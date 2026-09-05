import { useState } from "react";
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAttendances, useEmployees, useCreateAttendance, useUpdateAttendance } from "@/hooks/useAttendance";

export function AttendanceWidget({ buttonVariant = "outline", buttonSize = "sm", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const { data: attendances = [], isLoading: loadingAttendances } = useAttendances();
  const { data: employees = [], isLoading: loadingEmployees, isError: isEmpError, error: empError } = useEmployees();

  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance();

  const todayStr = new Date().toISOString().split("T")[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5); // HH:MM

  // Active employee selection (default to first employee if not set)
  const activeEmployeeId = selectedEmployeeId || (employees.length > 0 ? employees[0].id : "");

  const activeEmployee = employees.find((e) => String(e.id) === String(activeEmployeeId));
  const activeEmployeeName = activeEmployee
    ? activeEmployee.first_name
      ? `${activeEmployee.first_name} ${activeEmployee.last_name || ""}`.trim()
      : activeEmployee.name || `Employee #${activeEmployee.id}`
    : "Employee";

  // Find today's attendance record for the selected employee
  const todayRecord = attendances.find(
    (a) => String(a.employee_id) === String(activeEmployeeId) && a.attendance_date === todayStr
  );

  const isCheckedIn = Boolean(todayRecord && todayRecord.check_in && !todayRecord.check_out);
  const isShiftCompleted = Boolean(todayRecord && todayRecord.check_in && todayRecord.check_out);

  const handleOpen = () => {
    setFeedback({ type: null, message: "" });
    setCustomTime(currentTimeStr);
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
    setIsOpen(true);
  };

  const handleAction = async () => {
    setFeedback({ type: null, message: "" });

    if (!activeEmployeeId) {
      setFeedback({ type: "error", message: "Please select an employee." });
      return;
    }

    const timeToSubmit = customTime ? `${customTime}:00` : `${new Date().toTimeString().slice(0, 8)}`;

    try {
      if (!isCheckedIn && !isShiftCompleted) {
        // Perform CHECK IN (POST new attendance record)
        await createMutation.mutateAsync({
          employee_id: Number(activeEmployeeId),
          attendance_date: todayStr,
          check_in: timeToSubmit,
          check_out: null,
        });

        setFeedback({
          type: "success",
          message: `Checked in successfully for ${activeEmployeeName} at ${timeToSubmit.slice(0, 5)}!`,
        });
      } else if (isCheckedIn) {
        // Perform CHECK OUT (PUT existing attendance record)
        await updateMutation.mutateAsync({
          id: todayRecord.id,
          data: {
            check_out: timeToSubmit,
          },
        });

        setFeedback({
          type: "success",
          message: `Checked out successfully for ${activeEmployeeName} at ${timeToSubmit.slice(0, 5)}!`,
        });
      } else {
        // Record already completed, allow updating check-out
        await updateMutation.mutateAsync({
          id: todayRecord.id,
          data: {
            check_out: timeToSubmit,
          },
        });

        setFeedback({
          type: "success",
          message: `Check-out time updated to ${timeToSubmit.slice(0, 5)}.`,
        });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.detail || err.message || "Failed to process attendance action.";
      setFeedback({ type: "error", message: errMsg });
    }
  };

  const isLoadingAction = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleOpen}
        className={`gap-2 ${isCheckedIn ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100" : ""} ${className}`}
      >
        <Clock className="h-4 w-4 text-purple-600" />
        <span>
          {isCheckedIn ? "Checked In" : isShiftCompleted ? "Shift Done" : "Check In / Out"}
        </span>
        {isCheckedIn && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Attendance Quick Action</DialogTitle>
              <DialogDescription>Check In or Check Out employee attendance for today</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Select Employee</label>
            {loadingEmployees ? (
              <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
            ) : isEmpError ? (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-md border border-amber-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {empError?.response?.data?.detail || empError?.message || "Could not load employees from API."}
                </span>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                No employees available in database.
              </div>
            ) : (
              <Select
                value={activeEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setFeedback({ type: null, message: "" });
                }}
              >
                {employees.map((emp) => {
                  const empName = emp.first_name
                    ? `${emp.first_name} ${emp.last_name || ""}`.trim()
                    : emp.name || `Employee #${emp.id}`;
                  const code = emp.employee_code || `ID: ${emp.id}`;
                  return (
                    <option key={emp.id} value={emp.id}>
                      {empName} ({code})
                    </option>
                  );
                })}
              </Select>
            )}
          </div>

          {/* Current Session Status Card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Current Status</span>
              {isCheckedIn ? (
                <Badge variant="success">Checked In</Badge>
              ) : isShiftCompleted ? (
                <Badge variant="default">Completed Today</Badge>
              ) : (
                <Badge variant="secondary">Not Checked In</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-md border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Check In Time</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {todayRecord?.check_in ? todayRecord.check_in.slice(0, 5) : "—"}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-md border border-slate-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Check Out Time</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {todayRecord?.check_out ? todayRecord.check_out.slice(0, 5) : "—"}
                </span>
              </div>
            </div>

            {todayRecord && (
              <div className="text-xs text-slate-600 flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span>Total Worked Hours:</span>
                <span className="font-bold text-purple-700">{todayRecord.worked_hours || 0} hrs</span>
              </div>
            )}
          </div>

          {/* Time Input for Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Action Time (HH:MM)</label>
            <Input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          </div>

          {/* Feedback Display */}
          {feedback.type === "success" && (
            <Alert variant="success" title="Success">
              {feedback.message}
            </Alert>
          )}

          {feedback.type === "error" && (
            <Alert variant="destructive" title="Error">
              {feedback.message}
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>

          <Button
            onClick={handleAction}
            disabled={isLoadingAction || loadingAttendances || employees.length === 0 || isEmpError}
            className={isCheckedIn ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
          >
            {isLoadingAction ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Processing...
              </>
            ) : isCheckedIn ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                Check Out
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                Check In
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
