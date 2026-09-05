import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Check,
  X,
  Loader2,
  Clock,
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
  useTimeOffRequests,
  useTimeOffTypes,
  useEmployees,
  useApproveTimeOffRequest,
  useRejectTimeOffRequest,
} from "@/hooks/useTimeOff";

export default function TimeOffRequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [myTeamOnly, setMyTeamOnly] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState(location.state?.message || "");

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimeOffRequests();

  const { data: leaveTypes = [] } = useTimeOffTypes();
  const { data: employees = [] } = useEmployees();

  const approveMutation = useApproveTimeOffRequest();
  const rejectMutation = useRejectTimeOffRequest();

  // Create lookups
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(emp.id, `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || `Employee #${emp.id}`);
    });
    return map;
  }, [employees]);

  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach((type) => {
      map.set(type.id, type.name);
    });
    return map;
  }, [leaveTypes]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const empName = employeeMap.get(req.employee_id) || `Employee #${req.employee_id}`;
      const typeName = leaveTypeMap.get(req.leave_type_id) || `Type #${req.leave_type_id}`;
      const statusStr = req.status || "";
      const reasonStr = req.reason || "";

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        empName.toLowerCase().includes(query) ||
        typeName.toLowerCase().includes(query) ||
        statusStr.toLowerCase().includes(query) ||
        reasonStr.toLowerCase().includes(query);

      // "My Team" filter placeholder (can filter team members or show all if unassigned)
      const matchesTeam = !myTeamOnly || true;

      return matchesSearch && matchesTeam;
    });
  }, [requests, searchQuery, myTeamOnly, employeeMap, leaveTypeMap]);

  const handleApprove = async (id) => {
    setActionError("");
    setActionSuccess("");
    try {
      await approveMutation.mutateAsync(id);
      setActionSuccess(`Request #${id} approved successfully.`);
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message || "Failed to approve request.");
    }
  };

  const handleRefuse = async (id) => {
    setActionError("");
    setActionSuccess("");
    try {
      await rejectMutation.mutateAsync(id);
      setActionSuccess(`Request #${id} refused successfully.`);
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message || "Failed to refuse request.");
    }
  };

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
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Time Off Requests
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            List view opened from Time Off → Requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition cursor-pointer"
            onClick={() => navigate("/time-off/requests/new")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New
          </Button>
        </div>
      </div>

      {/* Action Notification Alerts */}
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

      {/* Control Bar: Search + Filters */}
      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search requests..."
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

            {/* My Team Filter Button */}
            <Button
              type="button"
              variant={myTeamOnly ? "secondary" : "outline"}
              onClick={() => setMyTeamOnly(!myTeamOnly)}
              className={`gap-1.5 font-medium border-slate-200 ${
                myTeamOnly
                  ? "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Users className="h-4 w-4 text-purple-600" />
              <span>My Team</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-slate-600 hover:text-slate-900 border-slate-200"
              title="Refresh requests"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table / UI States */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Error State */}
        {isError && (
          <div className="p-6">
            <Alert variant="destructive" title="Failed to load time off requests">
              {error?.response?.data?.detail || error?.message || "An unexpected error occurred while fetching requests."}
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
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Time Off Requests Found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No requests matching "${searchQuery}". Try clearing search filters.`
                : "There are no time off requests submitted in the system yet."}
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
        {!isLoading && !isError && filteredRequests.length > 0 && (
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Start</TableHead>
                <TableHead className="font-semibold text-slate-700">End</TableHead>
                <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => {
                const empName = employeeMap.get(req.employee_id) || `Employee #${req.employee_id}`;
                const typeName = leaveTypeMap.get(req.leave_type_id) || `Type #${req.leave_type_id}`;
                const statusLower = (req.status || "").toLowerCase();
                const isPending = statusLower !== "approved" && statusLower !== "refused" && statusLower !== "rejected";

                return (
                  <TableRow
                    key={req.id}
                    onClick={() => navigate(`/time-off/requests/${req.id}`)}
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

                    {/* Start */}
                    <TableCell className="text-slate-600 whitespace-nowrap">{req.start_date}</TableCell>

                    {/* End */}
                    <TableCell className="text-slate-600 whitespace-nowrap">{req.end_date}</TableCell>

                    {/* Duration */}
                    <TableCell className="text-slate-700 font-medium">
                      {req.requested_amount ? `${req.requested_amount} Days` : "1 Day"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(req.id);
                          }}
                          className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                          title="Approve request"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefuse(req.id);
                          }}
                          className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-medium"
                          title="Refuse request"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Refuse
                        </Button>
                      </div>
                    </TableCell>
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
