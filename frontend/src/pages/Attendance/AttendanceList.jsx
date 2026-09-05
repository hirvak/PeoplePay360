import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Calendar, Filter, RefreshCw, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAttendances, useEmployees, useCreateAttendance } from "@/hooks/useAttendance";
import { AttendanceWidget } from "@/components/attendance/AttendanceWidget";

export default function AttendanceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeFilterParam = searchParams.get("employee_id") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterToday, setFilterToday] = useState(false);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState(employeeFilterParam);
  
  // State for "New Attendance" modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    employee_id: "",
    attendance_date: new Date().toISOString().split("T")[0],
    check_in: "09:00",
    check_out: "17:00",
  });
  const [formError, setFormError] = useState("");

  const { data: attendances = [], isLoading, isError, error, refetch } = useAttendances();
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateAttendance();

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper map for employee details
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(emp.id, emp);
    });
    return map;
  }, [employees]);

  // Filtered attendances based on search, today toggle, and employee dropdown
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

      // 2. Today Filter
      if (filterToday && record.attendance_date !== todayStr) {
        return false;
      }

      // 3. Employee Filter
      if (selectedEmployeeFilter !== "all" && String(record.employee_id) !== String(selectedEmployeeFilter)) {
        return false;
      }

      return true;
    });
  }, [attendances, employeeMap, searchQuery, filterToday, selectedEmployeeFilter, todayStr]);

  const handleOpenNewModal = () => {
    setFormError("");
    setNewForm({
      employee_id: employees.length > 0 ? employees[0].id : "",
      attendance_date: todayStr,
      check_in: "09:00",
      check_out: "17:00",
    });
    setNewModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newForm.employee_id) {
      setFormError("Please select an employee.");
      return;
    }

    if (!newForm.attendance_date) {
      setFormError("Please choose a date.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        employee_id: Number(newForm.employee_id),
        attendance_date: newForm.attendance_date,
        check_in: newForm.check_in ? `${newForm.check_in}:00` : null,
        check_out: newForm.check_out ? `${newForm.check_out}:00` : null,
      });

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">List view of employee attendance records.</p>
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
      <Card className="p-4 bg-white shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search attendance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50/50"
            />
          </div>

          {/* Useful Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Today Filter Toggle */}
            <Button
              variant={filterToday ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterToday(!filterToday)}
              className={filterToday ? "bg-purple-600 text-white hover:bg-purple-700 font-semibold" : ""}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Today</span>
            </Button>

            {/* Employee Filter Dropdown */}
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

            {/* Reset Filters */}
            {(searchQuery || filterToday || selectedEmployeeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterToday(false);
                  setSelectedEmployeeFilter("all");
                  searchParams.delete("employee_id");
                  setSearchParams(searchParams);
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

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
        <Card className="overflow-hidden shadow-2xs border-slate-200">
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
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 py-6">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-700">No attendance records found</p>
                        <p className="text-xs text-slate-400">
                          {searchQuery || filterToday || selectedEmployeeFilter !== "all"
                            ? "Try adjusting your search or active filters."
                            : "Click 'New' or use the quick widget to create the first attendance record."}
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
                  const empName = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${record.employee_id}`;
                  const empCode = emp?.employee_code || "";
                  const isPresent = record.status === "Present" || Boolean(record.check_in);

                  return (
                    <TableRow
                      key={record.id}
                      onClick={() => navigate(`/attendance/${record.id}`)}
                      className="cursor-pointer group hover:bg-purple-50/50 transition"
                    >
                      {/* Employee Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            {emp ? `${emp.first_name[0]}${emp.last_name[0]}` : "EM"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {empName}
                            </div>
                            {empCode && <div className="text-[11px] text-slate-400 font-mono">{empCode}</div>}
                          </div>
                        </div>
                      </TableCell>

                      {/* Date Column */}
                      <TableCell className="text-slate-600 font-medium">
                        {record.attendance_date}
                      </TableCell>

                      {/* Check In Column */}
                      <TableCell className="font-mono text-slate-700">
                        {record.check_in ? record.check_in.slice(0, 5) : "—"}
                      </TableCell>

                      {/* Check Out Column */}
                      <TableCell className="font-mono text-slate-700">
                        {record.check_out ? record.check_out.slice(0, 5) : "—"}
                      </TableCell>

                      {/* Worked Hours Column */}
                      <TableCell className="text-right font-bold text-slate-800">
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
            <label className="text-xs font-semibold text-slate-700">Employee *</label>
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
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Attendance Date *</label>
            <Input
              type="date"
              value={newForm.attendance_date}
              onChange={(e) => setNewForm({ ...newForm, attendance_date: e.target.value })}
            />
          </div>

          {/* Check In & Check Out */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Check In Time</label>
              <Input
                type="time"
                value={newForm.check_in}
                onChange={(e) => setNewForm({ ...newForm, check_in: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Check Out Time</label>
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
