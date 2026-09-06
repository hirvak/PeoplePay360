import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import {
  useLeaveAllocations,
  useTimeOffTypes,
  useEmployees,
} from "@/hooks/useTimeOff";
import CreateAllocationModal from "./CreateAllocationModal";

export default function AllocationsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  const {
    data: allocations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useLeaveAllocations();

  const { data: leaveTypes = [] } = useTimeOffTypes();
  const { data: employees = [] } = useEmployees();

  // Employee details lookup (name + code)
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || `Employee #${emp.id}`;
      map.set(emp.id, {
        name,
        code: emp.employee_code || "",
      });
    });
    return map;
  }, [employees]);

  // Leave Type details lookup (name + unit)
  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach((type) => {
      map.set(type.id, {
        name: type.name,
        unit: type.unit || "Days",
      });
    });
    return map;
  }, [leaveTypes]);

  // Search filtering across employee name, code, type name, status, and unit
  const filteredAllocations = useMemo(() => {
    return allocations.filter((alloc) => {
      const empData = employeeMap.get(alloc.employee_id);
      const empName = empData ? empData.name : `Employee #${alloc.employee_id}`;
      const empCode = empData ? empData.code : "";

      const typeData = leaveTypeMap.get(alloc.leave_type_id);
      const typeName = typeData ? typeData.name : `Type #${alloc.leave_type_id}`;
      const unit = typeData ? typeData.unit : "Days";

      const statusStr = alloc.status || "";

      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        empName.toLowerCase().includes(query) ||
        empCode.toLowerCase().includes(query) ||
        typeName.toLowerCase().includes(query) ||
        statusStr.toLowerCase().includes(query) ||
        unit.toLowerCase().includes(query)
      );
    });
  }, [allocations, searchQuery, employeeMap, leaveTypeMap]);

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
          Approved
        </Badge>
      );
    }
    if (s === "refused" || s === "rejected") {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100 font-medium">
          <XCircle className="h-3 w-3 mr-1 text-rose-600" />
          Refused
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-medium">
        <Clock className="h-3 w-3 mr-1 text-amber-600" />
        To Approve
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Allocations
            </h1>
            <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border-purple-200 dark:border-purple-800">
              {allocations.length}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and view employee leave allocations and balance quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner("")}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search & Refresh */}
      <Card className="p-4 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search allocations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-[#40383D]"
              title="Refresh allocations"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* UI States & Allocations Table */}
      <Card className="border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs overflow-hidden">
        {/* Error State */}
        {isError && (
          <div className="p-6">
            <Alert variant="destructive" title="Failed to load leave allocations">
              {error?.response?.data?.detail ||
                error?.message ||
                "An unexpected error occurred while fetching allocations."}
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isError && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-20 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredAllocations.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No Allocations Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No allocations match your current search.`
                : "No leave allocations have been configured yet."}
            </p>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && filteredAllocations.length > 0 && (
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-900/80">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Employee</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Allocated</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Taken</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Remaining</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((alloc) => {
                const empData = employeeMap.get(alloc.employee_id);
                const empName = empData ? empData.name : `Employee #${alloc.employee_id}`;
                const empCode = empData ? empData.code : "";

                const typeData = leaveTypeMap.get(alloc.leave_type_id);
                const typeName = typeData ? typeData.name : `Type #${alloc.leave_type_id}`;
                const unit = typeData ? typeData.unit : "Days";

                return (
                  <TableRow
                    key={alloc.id}
                    onClick={() => navigate(`/time-off/allocations/${alloc.id}`)}
                    className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 border-slate-100 dark:border-slate-800 transition cursor-pointer"
                  >
                    {/* Employee */}
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                          {empName[0] || "E"}
                        </div>
                        <div className="flex flex-col">
                          <span className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline">
                            {empName}
                          </span>
                          {empCode && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {empCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
                      {typeName}
                    </TableCell>

                    {/* Allocated */}
                    <TableCell className="text-slate-900 dark:text-slate-100 font-semibold text-right">
                      {alloc.allocated_amount} {unit}
                    </TableCell>

                    {/* Taken */}
                    <TableCell className="text-amber-700 dark:text-amber-400 font-medium text-right">
                      {alloc.used_amount} {unit}
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="text-emerald-700 dark:text-emerald-400 font-bold text-right">
                      {alloc.remaining_amount} {unit}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-right">{getStatusBadge(alloc.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Allocation Modal */}
      <CreateAllocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => setSuccessBanner(msg)}
      />
    </div>
  );
}
