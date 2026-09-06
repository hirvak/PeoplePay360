import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Loader2,
  AlertCircle,
  Layers,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLeaveAllocationDetails,
  useTimeOffTypes,
  useEmployees,
  useApproveLeaveAllocation,
  useRejectLeaveAllocation,
  useDeleteLeaveAllocation,
} from "@/hooks/useTimeOff";

export default function AllocationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const {
    data: allocation,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeaveAllocationDetails(id);

  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useTimeOffTypes();

  const approveMutation = useApproveLeaveAllocation();
  const rejectMutation = useRejectLeaveAllocation();
  const deleteMutation = useDeleteLeaveAllocation();

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
      map.set(type.id, {
        name: type.name,
        unit: type.unit || "Days",
      });
    });
    return map;
  }, [leaveTypes]);

  const empName = allocation
    ? employeeMap.get(allocation.employee_id) || `Employee #${allocation.employee_id}`
    : "";

  const typeData = allocation ? leaveTypeMap.get(allocation.leave_type_id) : null;
  const typeName = typeData ? typeData.name : allocation ? `Type #${allocation.leave_type_id}` : "";
  const unit = typeData ? typeData.unit : "Days";

  const handleApprove = async () => {
    if (!id) return;
    setActionError("");
    setActionSuccess("");
    try {
      await approveMutation.mutateAsync(id);
      setActionSuccess("Leave allocation approved successfully.");
      refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.detail || err.message || "Failed to approve allocation."
      );
    }
  };

  const handleRefuse = async () => {
    if (!id) return;
    setActionError("");
    setActionSuccess("");
    try {
      await rejectMutation.mutateAsync(id);
      setActionSuccess("Leave allocation refused successfully.");
      refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.detail || err.message || "Failed to refuse allocation."
      );
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this leave allocation?")) return;
    setActionError("");
    setActionSuccess("");
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/time-off/allocations");
    } catch (err) {
      setActionError(
        err.response?.data?.detail || err.message || "Failed to delete allocation."
      );
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-xs px-2.5 py-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
          Approved
        </Badge>
      );
    }
    if (s === "refused" || s === "rejected") {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100 text-xs px-2.5 py-1 font-medium">
          <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
          Refused
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs px-2.5 py-1 font-medium">
        <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
        To Approve
      </Badge>
    );
  };

  const isPending = allocation?.status?.toLowerCase() === "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/time-off/allocations")}
          className="text-slate-600 border-slate-200 hover:bg-slate-100 self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Allocations
        </Button>

        {/* Action Buttons */}
        {allocation && (
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={handleApprove}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium cursor-pointer"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Approve
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={handleRefuse}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-medium cursor-pointer"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <X className="h-4 w-4 mr-1.5" />
                  )}
                  Refuse
                </Button>
              </>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              className="border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5 text-rose-500" />
              )}
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {allocation ? `Allocation / ${empName}` : "Allocation Details"}
          </h1>
          {allocation && getStatusBadge(allocation.status)}
        </div>
        <p className="text-sm text-slate-500">
          Form view of one allocation record
        </p>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <Alert variant="success" title="Success">
          {actionSuccess}
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive" title="Error">
          {actionError}
        </Alert>
      )}

      {/* UI STATES */}

      {/* 1. Loading State */}
      {isLoading && (
        <Card className="p-6 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-44" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </Card>
      )}

      {/* 2. Error State */}
      {isError && (
        <Card className="p-6 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20]">
          <Alert variant="destructive" title="Failed to load allocation details">
            {error?.response?.data?.detail ||
              error?.message ||
              "Could not fetch details for this allocation."}
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Not Found State */}
      {!isLoading && !isError && !allocation && (
        <Card className="p-12 text-center border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Allocation Record Not Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            The requested leave allocation (ID #{id}) does not exist or has been removed.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/time-off/allocations")}
          >
            Return to Allocations List
          </Button>
        </Card>
      )}

      {/* 4. Success / Data State */}
      {!isLoading && !isError && allocation && (
        <div className="space-y-6">
          {/* Balance Cards Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Allocated
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {allocation.allocated_amount} {unit}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Total allocated amount</span>
            </Card>

            <Card className="p-4 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Taken
              </span>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {allocation.used_amount} {unit}
              </div>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Amount already used</span>
            </Card>

            <Card className="p-4 border-purple-100 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/40 shadow-2xs">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-1">
                Remaining
              </span>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {allocation.remaining_amount} {unit}
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Available balance</span>
            </Card>
          </div>

          {/* Main Information Layout */}
          <Card className="border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Allocation Information</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Detailed allocation overview for Record #{allocation.id}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Side */}

                {/* Employee */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Employee
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{empName}</div>
                </div>

                {/* Taken */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Taken
                  </span>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {allocation.used_amount} {unit}
                  </div>
                </div>

                {/* Time Off Type */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Time Off Type
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {typeName}
                  </div>
                </div>

                {/* Remaining */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Remaining
                  </span>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {allocation.remaining_amount} {unit}
                  </div>
                </div>

                {/* Allocated */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <PieChart className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Allocated
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {allocation.allocated_amount} {unit}
                  </div>
                </div>

                {/* Validity Period */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Validity Period
                  </span>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {allocation.start_date} to {allocation.end_date}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                  </span>
                  <div>{getStatusBadge(allocation.status)}</div>
                </div>

                {/* Created At */}
                {allocation.created_at && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Created On
                    </span>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {new Date(allocation.created_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card className="border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                Annual leave allocation for period {allocation.start_date} to {allocation.end_date}.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
