import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useTimeOffRequests, useTimeOffTypes, useEmployees } from "../../hooks/useTimeOff";
import { useAuth } from "../../context/AuthContext";
import { LeaveBalanceOverview } from "../../components/timeoff/LeaveBalanceOverview";

export default function TimeOffDashboardPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimeOffRequests();

  const { data: leaveTypes = [] } = useTimeOffTypes();
  const { data: employees = [] } = useEmployees();

  // Create lookups for Employees & Leave Types
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(emp.id, emp);
    });
    return map;
  }, [employees]);

  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach((t) => {
      map.set(t.id, t.name);
    });
    return map;
  }, [leaveTypes]);

  // Derived KPI Counts from real backend data
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter(
    (r) => r.status === "Rejected" || r.status === "Refused"
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
        <h3 className="font-bold">Unable to load Time Off data</h3>
        <p className="text-xs mt-1">
          {error?.response?.data?.detail || error?.message || "Failed to load leave data."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Time Off Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee ? "View your leave requests and active balance allocations." : "Manage employee leave requests, types, and allocations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#211D20] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
            title="Refresh from database"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            to="/time-off/requests/new"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Time Off Request</span>
          </Link>
        </div>
      </div>

      {/* Prominent Leave Balance Section */}
      <LeaveBalanceOverview />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Requests</span>
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{totalCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Approval</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{pendingCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{approvedCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Rejected</span>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{rejectedCount}</p>
        </div>
      </div>

      {/* Recent Leave Requests List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Leave Requests</h2>
          <Link to="/time-off/requests" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700">
            View All →
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No leave requests found.</p>
            <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Submit a new time off request to see it listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Employee / Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {requests.slice(0, 5).map((req) => {
                  let empName = "";
                  let empCode = "";

                  if (isEmployee) {
                    empName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "My Profile";
                    empCode = user?.employee_code || (req.employee_id ? `EMP-${req.employee_id}` : "N/A");
                  } else {
                    const emp = employeeMap.get(req.employee_id);
                    empName = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : req.employee_name || `Employee #${req.employee_id}`;
                    empCode = emp?.employee_code || req.employee_code || (req.employee_id ? `EMP-${req.employee_id}` : "N/A");
                  }

                  const typeName = leaveTypeMap.get(req.leave_type_id) || req.leave_type_name || req.leave_type?.name || (req.leave_type_id ? `Leave Type #${req.leave_type_id}` : "N/A");
                  const daysVal = req.requested_amount ? Number(req.requested_amount) : req.number_of_days || 1;
                  const daysDisplay = `${daysVal} ${daysVal === 1 ? "day" : "days"}`;

                  const isApproved = req.status === "Approved";
                  const isRejected = req.status === "Rejected" || req.status === "Refused";

                  return (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{empName}</span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{empCode}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                        {typeName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {req.start_date} to {req.end_date}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {daysDisplay}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : isRejected
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
