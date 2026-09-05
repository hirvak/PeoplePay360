import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTimeOffRequestDetails,
  useTimeOffTypes,
  useEmployees,
  useApproveTimeOffRequest,
  useRejectTimeOffRequest,
} from "@/hooks/useTimeOff";

export default function TimeOffRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useTimeOffRequestDetails(id);

  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useTimeOffTypes();

  const approveMutation = useApproveTimeOffRequest();
  const rejectMutation = useRejectTimeOffRequest();

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

  const handleApprove = async () => {
    if (!id) return;
    setActionError("");
    setActionSuccess("");
    try {
      await approveMutation.mutateAsync(id);
      setActionSuccess("Time off request approved successfully.");
      refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.detail || err.message || "Failed to approve request."
      );
    }
  };

  const handleRefuse = async () => {
    if (!id) return;
    setActionError("");
    setActionSuccess("");
    try {
      await rejectMutation.mutateAsync(id);
      setActionSuccess("Time off request refused successfully.");
      refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.detail || err.message || "Failed to refuse request."
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

  // Status check for action eligibility
  const statusLower = (request?.status || "").toLowerCase();
  const isPending =
    statusLower !== "approved" &&
    statusLower !== "refused" &&
    statusLower !== "rejected";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/time-off/requests")}
          className="text-slate-600 border-slate-200 hover:bg-slate-100 self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Requests
        </Button>

        {/* Action Buttons (Approve / Refuse) */}
        {request && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={handleApprove}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
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
              className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-medium"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <X className="h-4 w-4 mr-1.5" />
              )}
              Refuse
            </Button>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Time Off Request
          </h1>
          {request && getStatusBadge(request.status)}
        </div>
        <p className="text-sm text-slate-500">
          Form view of one time off request
        </p>
      </div>

      {/* Alerts */}
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
        <Card className="p-6 border-slate-200 bg-white space-y-6">
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
        <Card className="p-6 border-slate-200 bg-white">
          <Alert variant="destructive" title="Failed to load request details">
            {error?.response?.data?.detail ||
              error?.message ||
              "Could not fetch details for this request."}
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Not Found State */}
      {!isLoading && !isError && !request && (
        <Card className="p-12 text-center border-slate-200 bg-white shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Request Not Found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            The requested time off request (ID #{id}) does not exist or has been removed.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/time-off/requests")}
          >
            Return to Requests List
          </Button>
        </Card>
      )}

      {/* 4. Success / Data State */}
      {!isLoading && !isError && request && (
        <div className="space-y-6">
          {/* Main Information Card */}
          <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Request Details</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Detailed information for Request #{request.id}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Employee */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-purple-600" />
                    Employee
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {employeeMap.get(request.employee_id) || `Employee #${request.employee_id}`}
                  </div>
                </div>

                {/* Time Off Type */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    Time Off Type
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {leaveTypeMap.get(request.leave_type_id) || `Type #${request.leave_type_id}`}
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Start Date
                  </span>
                  <div className="text-sm font-medium text-slate-800">
                    {request.start_date}
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    End Date
                  </span>
                  <div className="text-sm font-medium text-slate-800">
                    {request.end_date}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    Duration
                  </span>
                  <div className="text-sm font-bold text-purple-700">
                    {request.requested_amount ? `${request.requested_amount} Days` : "1 Day"}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Status
                  </span>
                  <div>{getStatusBadge(request.status)}</div>
                </div>

                {/* Optional backend fields if present */}
                {request.created_at && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Submitted On
                    </span>
                    <div className="text-xs text-slate-600">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                )}

                {request.approved_by && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Approved / Reviewed By
                    </span>
                    <div className="text-xs font-medium text-slate-800">
                      {employeeMap.get(request.approved_by) || `User #${request.approved_by}`}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Description / Reason</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.reason || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
