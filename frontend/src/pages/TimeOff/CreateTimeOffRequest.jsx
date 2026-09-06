import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, User, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import timeOffService from "../../services/timeOffService";
import employeeService from "../../services/employeeService";
import { useAuth } from "../../context/AuthContext";

export default function CreateTimeOffRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    async function loadOptions() {
      setLoadingData(true);
      try {
        if (isEmployee) {
          const balData = await timeOffService.getMyBalance().catch(() => []);
          const availableTypes = (balData || []).map((b) => ({
            id: b.leave_type_id,
            name: b.leave_type_name || b.leave_type?.name || (b.leave_type_id ? `Leave Type #${b.leave_type_id}` : "N/A"),
          }));

          setLeaveTypes(availableTypes);
          if (availableTypes.length > 0) {
            setFormData((prev) => ({ ...prev, leave_type_id: String(availableTypes[0].id) }));
          }
        } else {
          const typesData = await timeOffService.getTypes().catch(() => []);
          const empData = await employeeService.getAll().catch(() => []);
          setLeaveTypes(typesData || []);
          setEmployees(empData || []);
          if (typesData && typesData.length > 0) {
            setFormData((prev) => ({ ...prev, leave_type_id: String(typesData[0].id) }));
          }
        }
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadOptions();
  }, [isEmployee]);

  const durationDays = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.start_date, formData.end_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.leave_type_id) {
      setErrorMsg("Please select a Time Off Type.");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setErrorMsg("Please provide both Start and End dates.");
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setErrorMsg("End Date cannot be before Start Date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        leave_type_id: parseInt(formData.leave_type_id, 10),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || undefined,
        requested_amount: durationDays > 0 ? durationDays : 1,
      };

      if (!isEmployee) {
        if (!formData.employee_id) {
          setErrorMsg("Please select an employee.");
          setIsSubmitting(false);
          return;
        }
        payload.employee_id = parseInt(formData.employee_id, 10);
        await timeOffService.createRequest(payload);
      } else {
        payload.employee_id = 0; // Backend overwrites with current_employee.id
        await timeOffService.createMyRequest(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      navigate(isEmployee ? "/time-off" : "/time-off/requests");
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to create leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/time-off/requests")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Requests</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Time Off Request</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit a leave request for approval.</p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs space-y-5">
        {!isEmployee && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Employee *</span>
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
              required
            >
              <option value="">{loadingData ? "Loading employees..." : "-- Select Employee --"}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Time Off Type *</span>
          </label>
          <select
            name="leave_type_id"
            value={formData.leave_type_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
            required
          >
            <option value="">{loadingData ? "Loading types..." : "-- Select Time Off Type --"}</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} {type.is_paid ? "(Paid)" : "(Unpaid)"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/60 p-3.5 border border-purple-100 dark:border-purple-800 flex items-center justify-between">
          <span className="text-xs font-medium text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Duration:
          </span>
          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
            {durationDays > 0 ? `${durationDays} Day${durationDays > 1 ? "s" : ""}` : "—"}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Reason / Notes</span>
          </label>
          <textarea
            name="reason"
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            placeholder="Brief reason for requested leave..."
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/time-off/requests")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Submit Request</span>
          </button>
        </div>
      </form>
    </div>
  );
}
