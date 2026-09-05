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

export default function AllocationsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: allocations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useLeaveAllocations();

  const { data: leaveTypes = [] } = useTimeOffTypes();
  const { data: employees = [] } = useEmployees();

  // Employee lookup
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(
        emp.id,
        `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
          emp.employee_code ||
          `Employee #${emp.id}`
      );
    });
    return map;
  }, [employees]);

  // Leave Type lookup
  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach((type) => {
      map.set(type.id, type.name);
    });
    return map;
  }, [leaveTypes]);

  // Search filtering
  const filteredAllocations = useMemo(() => {
    return allocations.filter((alloc) => {
      const empName = employeeMap.get(alloc.employee_id) || `Employee #${alloc.employee_id}`;
      const typeName = leaveTypeMap.get(alloc.leave_type_id) || `Type #${alloc.leave_type_id}`;
      const statusStr = alloc.status || "";

      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        empName.toLowerCase().includes(query) ||
        typeName.toLowerCase().includes(query) ||
        statusStr.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Allocations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            List view opened from Time Off → Allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition cursor-pointer"
            onClick={() => {
              // Navigation to Create Allocation page in future steps
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Refresh */}
      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search allocations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
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
              className="text-slate-600 hover:text-slate-900 border-slate-200"
              title="Refresh allocations"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* UI States & Allocations Table */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Allocations Found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No leave allocations matching "${searchQuery}". Try clearing search.`
                : "There are no leave allocations recorded in the system yet."}
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
            <TableHeader className="bg-slate-50/70">
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Allocated</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Taken</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Remaining</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((alloc) => {
                const empName = employeeMap.get(alloc.employee_id) || `Employee #${alloc.employee_id}`;
                const typeName = leaveTypeMap.get(alloc.leave_type_id) || `Type #${alloc.leave_type_id}`;

                return (
                  <TableRow
                    key={alloc.id}
                    onClick={() => navigate(`/time-off/allocations/${alloc.id}`)}
                    className="hover:bg-purple-50/40 border-slate-100 transition cursor-pointer"
                  >
                    {/* Employee */}
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {empName[0]}
                        </div>
                        <span className="hover:text-purple-600 hover:underline">{empName}</span>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="text-slate-700 font-medium">{typeName}</TableCell>

                    {/* Allocated */}
                    <TableCell className="text-slate-900 font-semibold text-right">
                      {alloc.allocated_amount} Days
                    </TableCell>

                    {/* Taken */}
                    <TableCell className="text-amber-700 font-medium text-right">
                      {alloc.used_amount} Days
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="text-emerald-700 font-bold text-right">
                      {alloc.remaining_amount} Days
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
    </div>
  );
}
