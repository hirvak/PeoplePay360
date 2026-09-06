import { useState, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  useEmployees,
  useTimeOffTypes,
  useCreateLeaveAllocation,
} from "@/hooks/useTimeOff";

export default function CreateAllocationModal({ isOpen, onClose, onSuccess }) {
  const currentYear = new Date().getFullYear();
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("20.00");
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: timeOffTypes = [], isLoading: loadingTypes } = useTimeOffTypes();
  const createMutation = useCreateLeaveAllocation();

  // Selected time off type for unit label
  const selectedType = useMemo(() => {
    return timeOffTypes.find((t) => String(t.id) === String(leaveTypeId));
  }, [timeOffTypes, leaveTypeId]);

  const unitLabel = selectedType ? selectedType.unit : "Days";

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!employeeId) {
      setErrorMsg("Please select an employee.");
      return;
    }
    if (!leaveTypeId) {
      setErrorMsg("Please select a time off type.");
      return;
    }
    if (!allocatedAmount || parseFloat(allocatedAmount) <= 0) {
      setErrorMsg("Allocated amount must be greater than 0.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Please specify both start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg("Allocation end date cannot be before start date.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        employee_id: parseInt(employeeId, 10),
        leave_type_id: parseInt(leaveTypeId, 10),
        allocated_amount: parseFloat(allocatedAmount),
        start_date: startDate,
        end_date: endDate,
      });

      if (onSuccess) {
        onSuccess("Leave allocation created successfully.");
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail || err.message || "Failed to create leave allocation."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#211D20] border border-slate-200 dark:border-[#40383D] rounded-xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Leave Allocation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign leave days/hours to an employee for a specific period
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <Alert variant="destructive" title="Validation Error">
              {errorMsg}
            </Alert>
          )}

          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Employee <span className="text-rose-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              disabled={loadingEmployees}
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => {
                const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.employee_code || `Employee #${emp.id}`;
                const code = emp.employee_code ? ` (${emp.employee_code})` : "";
                return (
                  <option key={emp.id} value={emp.id}>
                    {name}{code}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Time Off Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Time Off Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              disabled={loadingTypes}
            >
              <option value="">-- Select Time Off Type --</option>
              {timeOffTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Allocation Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Allocated Amount ({unitLabel}) <span className="text-rose-500">*</span>
              </label>
            </div>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              placeholder="e.g. 20.00"
              className="bg-white dark:bg-slate-900"
            />
          </div>

          {/* Date Range: Start & End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                End Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Modal Footer / Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs cursor-pointer"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              Create Allocation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
