import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAttendances, useEmployees, useCreateAttendance } from "@/hooks/useAttendance";
import { AttendanceWidget } from "@/components/attendance/AttendanceWidget";
import { useAuth } from "@/context/AuthContext";
import employeeService from "@/services/employeeService";
import timeOffService from "@/services/timeOffService";

// Timezone-safe date helper functions (strictly using YYYY-MM-DD strings)
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const changeDateByDays = (dateStr, days) => {
  if (!dateStr) return getTodayStr();
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function AttendanceList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const [searchParams, setSearchParams] = useSearchParams();
  const employeeFilterParam = searchParams.get("employee_id") || "all";

  const todayStr = useMemo(() => getTodayStr(), []);

  // Filter States
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAllDates, setIsAllDates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState(employeeFilterParam);

  // State for "New Attendance" modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    employee_id: "",
    attendance_date: todayStr,
    check_in: "09:00",
    check_out: "17:00",
  });
  const [formError, setFormError] = useState("");
  const [myEmployeeProfile, setMyEmployeeProfile] = useState(null);

  // Fetch Attendance & Employee Data
  const { data: attendances = [], isLoading, isError, error, refetch } = useAttendances();
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateAttendance();

  // Fetch Leave Requests (Role-Aware: Employee = my-requests, HR/Admin = requests)
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["timeOffRequests", isEmployee ? "me" : "all"],
    queryFn: isEmployee ? timeOffService.getMyRequests : timeOffService.getAllRequests,
    enabled: Boolean(user),
  });

  // Fetch Leave Types for Displaying Names
  const { data: timeOffTypes = [] } = useQuery({
    queryKey: ["timeOffTypes"],
    queryFn: timeOffService.getTypes,
    enabled: Boolean(user) && !isEmployee,
  });

  // Lookup Maps
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => map.set(emp.id, emp));
    return map;
  }, [employees]);

  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    timeOffTypes.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [timeOffTypes]);

  // Leave Requests for Selected Date
  const leavesOnSelectedDate = useMemo(() => {
    if (isAllDates || !selectedDate) return [];
    return leaveRequests.filter((req) => {
      // Ignore rejected leaves
      if (req.status !== "Approved" && req.status !== "Pending") return false;
      // Date range overlap check (ISO YYYY-MM-DD comparison)
      const inRange = selectedDate >= req.start_date && selectedDate <= req.end_date;
      if (!inRange) return false;
      // Filter by employee if active
      if (selectedEmployeeFilter !== "all" && String(req.employee_id) !== String(selectedEmployeeFilter)) {
        return false;
      }
      return true;
    });
  }, [leaveRequests, selectedDate, isAllDates, selectedEmployeeFilter]);

  const approvedLeavesOnDate = useMemo(() => {
    return leavesOnSelectedDate.filter((l) => l.status === "Approved");
  }, [leavesOnSelectedDate]);

  const pendingLeavesOnDate = useMemo(() => {
    return leavesOnSelectedDate.filter((l) => l.status === "Pending");
  }, [leavesOnSelectedDate]);

  // Combined Filtered Attendance Records
  const filteredAttendances = useMemo(() => {
    return attendances.filter((record) => {
      const emp = employeeMap.get(record.employee_id);
      const empName = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${record.employee_id}`;
      const empCode = emp?.employee_code || "";

      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = empName.toLowerCase().includes(q);
        const matchesCode = empCode.toLowerCase().includes(q);
        const matchesDate = record.attendance_date.includes(q);
        const matchesStatus = (record.status || "").toLowerCase().includes(q);

        if (!matchesName && !matchesCode && !matchesDate && !matchesStatus) {
          return false;
        }
      }

      // 2. Date Filter
      if (!isAllDates && record.attendance_date !== selectedDate) {
        return false;
      }

      // 3. Employee Filter
      if (selectedEmployeeFilter !== "all" && String(record.employee_id) !== String(selectedEmployeeFilter)) {
        return false;
      }

      return true;
    });
  }, [attendances, employeeMap, searchQuery, isAllDates, selectedDate, selectedEmployeeFilter]);

  // Open New Attendance Record Modal
  const handleOpenNewModal = async () => {
    setFormError("");
    const targetDate = isAllDates ? todayStr : selectedDate;
    if (isEmployee) {
      try {
        const me = await employeeService.getMe();
        setMyEmployeeProfile(me);
        setNewForm({
          employee_id: me.id,
          attendance_date: targetDate,
          check_in: "09:00",
          check_out: "17:00",
        });
      } catch (err) {
        setFormError(err?.response?.data?.detail || err.message || "Failed to load employee profile.");
      }
    } else {
      setMyEmployeeProfile(null);
      setNewForm({
        employee_id: employees.length > 0 ? employees[0].id : "",
        attendance_date: targetDate,
        check_in: "09:00",
        check_out: "17:00",
      });
    }
    setNewModalOpen(true);
  };

  // Submit New Attendance Record
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const targetEmpId = isEmployee
      ? myEmployeeProfile?.id || newForm.employee_id
      : newForm.employee_id;

    if (!targetEmpId) {
      setFormError(isEmployee ? "Your employee profile is not linked to this user." : "Please select an employee.");
      return;
    }

    if (newForm.check_in && newForm.check_out) {
      if (newForm.check_out <= newForm.check_in) {
        setFormError("Check-out time cannot be earlier than check-in time.");
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        employee_id: Number(targetEmpId),
        attendance_date: newForm.attendance_date,
        check_in: newForm.check_in ? `${newForm.check_in}:00` : null,
        check_out: newForm.check_out ? `${newForm.check_out}:00` : null,
      });

      // Keep user on newly created attendance date
      setSelectedDate(newForm.attendance_date);
      setIsAllDates(false);
      setNewModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Failed to create attendance record.";
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee ? "Your attendance records and check-in history." : "List view of employee attendance records."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AttendanceWidget buttonVariant="outline" buttonSize="md" />

          <Button onClick={handleOpenNewModal} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <Card className="p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search attendance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50/50 dark:bg-slate-900/50"
            />
          </div>

          {/* Useful Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Real Calendar Date Selector & Navigation Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {/* Previous Day */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(changeDateByDays(selectedDate, -1));
                  setIsAllDates(false);
                }}
                className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Native Date Input with Calendar Icon */}
              <div className="relative flex items-center">
                <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-purple-600 dark:text-purple-400 pointer-events-none" />
                <input
                  type="date"
                  value={isAllDates ? "" : selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                      setIsAllDates(false);
                    }
                  }}
                  className="h-8 pl-8 pr-2 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Next Day */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(changeDateByDays(selectedDate, 1));
                  setIsAllDates(false);
                }}
                className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Today Reset Button */}
              <Button
                variant={!isAllDates && selectedDate === todayStr ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedDate(todayStr);
                  setIsAllDates(false);
                }}
                className={`h-8 px-2.5 text-xs font-medium ${
                  !isAllDates && selectedDate === todayStr
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
                }`}
              >
                Today
              </Button>

              {/* All Dates Toggle */}
              <Button
                variant={isAllDates ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAllDates(!isAllDates)}
                className={`h-8 px-2.5 text-xs font-medium ${
                  isAllDates
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
                }`}
              >
                All Dates
              </Button>
            </div>

            {/* Employee Filter Dropdown (Only for HR/Admin) */}
            {!isEmployee && (
              <div className="w-48 sm:w-56">
                <Select
                  value={selectedEmployeeFilter}
                  onChange={(e) => {
                    setSelectedEmployeeFilter(e.target.value);
                    if (e.target.value === "all") {
                      searchParams.delete("employee_id");
                    } else {
                      searchParams.set("employee_id", e.target.value);
                    }
                    setSearchParams(searchParams);
                  }}
                >
                  <option value="all">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Reset Filters */}
            {(searchQuery || isAllDates || selectedDate !== todayStr || selectedEmployeeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDate(todayStr);
                  setIsAllDates(false);
                  setSelectedEmployeeFilter("all");
                  searchParams.delete("employee_id");
                  setSearchParams(searchParams);
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Leave Awareness Banner */}
      {!isAllDates && leavesOnSelectedDate.length > 0 && (
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-900 dark:text-purple-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-bold">
              Leave Awareness ({formatDisplayDate(selectedDate)}):
            </span>
            <span>
              {approvedLeavesOnDate.length > 0 && (
                <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 mr-1.5 font-medium">
                  {approvedLeavesOnDate.length} Approved Leave{approvedLeavesOnDate.length > 1 ? "s" : ""}
                </Badge>
              )}
              {pendingLeavesOnDate.length > 0 && (
                <Badge className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-medium">
                  {pendingLeavesOnDate.length} Pending Leave{pendingLeavesOnDate.length > 1 ? "s" : ""}
                </Badge>
              )}
            </span>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
            {leavesOnSelectedDate
              .map((req) => {
                const emp = employeeMap.get(req.employee_id);
                const name = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${req.employee_id}`;
                const typeName = leaveTypeMap.get(req.leave_type_id) || "Time Off";
                return `${name} (${typeName} - ${req.status})`;
              })
              .join(", ")}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isError ? (
        <Alert variant="destructive" title="Failed to load attendance records">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span>{error?.response?.data?.detail || error?.message || "Could not connect to backend server."}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="w-fit">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <Card className="overflow-hidden shadow-2xs border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead className="text-right">Worked Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAttendances.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 dark:text-slate-500 py-6">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                          No attendance records found {!isAllDates && `for ${formatDisplayDate(selectedDate)}`}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
                          {!isAllDates && approvedLeavesOnDate.length > 0
                            ? `${approvedLeavesOnDate.length} employee(s) have approved leave on this date.`
                            : searchQuery || selectedEmployeeFilter !== "all"
                            ? "Try adjusting your search query or active employee filters."
                            : "No attendance was logged for this date. Click 'New' or use the quick widget to create a record."}
                        </p>
                      </div>
                      <Button size="sm" onClick={handleOpenNewModal} className="mt-2 bg-purple-600 text-white">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Attendance
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Attendance Records Data Rows
                filteredAttendances.map((record) => {
                  const emp = employeeMap.get(record.employee_id);
                  const empName = emp
                    ? `${emp.first_name} ${emp.last_name}`
                    : user?.first_name
                    ? `${user.first_name} ${user.last_name || ""}`.trim()
                    : user?.email || `Employee #${record.employee_id}`;
                  const initials = emp
                    ? `${emp.first_name[0]}${emp.last_name ? emp.last_name[0] : ""}`
                    : user?.first_name
                    ? user.first_name[0]
                    : "EM";
                  const empCode = emp?.employee_code || "";
                  const isPresent = record.status === "Present" || Boolean(record.check_in);

                  return (
                    <TableRow
                      key={record.id}
                      onClick={() => navigate(`/attendance/${record.id}`)}
                      className="cursor-pointer group hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition"
                    >
                      {/* Employee Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-200 dark:border-purple-800 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                              {empName}
                            </div>
                            {empCode && <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{empCode}</div>}
                          </div>
                        </div>
                      </TableCell>

                      {/* Date Column */}
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {record.attendance_date}
                      </TableCell>

                      {/* Check In Column */}
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                        {record.check_in ? record.check_in.slice(0, 5) : "—"}
                      </TableCell>

                      {/* Check Out Column */}
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                        {record.check_out ? record.check_out.slice(0, 5) : "—"}
                      </TableCell>

                      {/* Worked Hours Column */}
                      <TableCell className="text-right font-bold text-slate-800 dark:text-slate-200">
                        {(record.worked_hours || 0).toFixed(2)}
                      </TableCell>

                      {/* Status Badge Column */}
                      <TableCell>
                        {isPresent ? (
                          <Badge variant="success">Present</Badge>
                        ) : (
                          <Badge variant="destructive">Absent</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* New Attendance Record Modal */}
      <Dialog open={newModalOpen} onClose={() => setNewModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>New Attendance Record</DialogTitle>
          <DialogDescription>Manually log attendance for an employee</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateSubmit} className="space-y-4 my-2">
          {/* Employee */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employee *</label>
            {isEmployee ? (
              <Input
                disabled
                value={
                  myEmployeeProfile
                    ? `${myEmployeeProfile.first_name} ${myEmployeeProfile.last_name || ""}`.trim() + ` (${myEmployeeProfile.employee_code || "EMP"})`
                    : "Self Service"
                }
                className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-700 dark:text-slate-300 font-medium"
              />
            ) : (
              <Select
                value={newForm.employee_id}
                onChange={(e) => setNewForm({ ...newForm, employee_id: e.target.value })}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code || `ID: ${emp.id}`})
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Attendance Date *</label>
            <Input
              type="date"
              value={newForm.attendance_date}
              onChange={(e) => setNewForm({ ...newForm, attendance_date: e.target.value })}
            />
          </div>

          {/* Check In & Check Out */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Check In Time</label>
              <Input
                type="time"
                value={newForm.check_in}
                onChange={(e) => setNewForm({ ...newForm, check_in: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Check Out Time</label>
              <Input
                type="time"
                value={newForm.check_out}
                onChange={(e) => setNewForm({ ...newForm, check_out: e.target.value })}
              />
            </div>
          </div>

          {formError && (
            <Alert variant="destructive" title="Error">
              {formError}
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-purple-600 text-white">
              {createMutation.isPending ? "Saving..." : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

