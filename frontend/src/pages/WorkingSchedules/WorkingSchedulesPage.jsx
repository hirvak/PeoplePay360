import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Sun,
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react";
import scheduleService from "../../services/scheduleService";
import employeeService from "../../services/employeeService";

// Format time string "09:00:00" -> "09:00"
function formatTimeStr(tStr) {
  if (!tStr) return "";
  const parts = String(tStr).split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return tStr;
}

// Get daily timing display string from ScheduleDay records
function getDailyTimingStr(days) {
  if (!days || days.length === 0) return "No timing set";
  const firstStart = formatTimeStr(days[0].start_time);
  const firstEnd = formatTimeStr(days[0].end_time);
  const allSame = days.every(
    (d) => formatTimeStr(d.start_time) === firstStart && formatTimeStr(d.end_time) === firstEnd
  );
  if (allSame) {
    return `${firstStart} – ${firstEnd}`;
  }
  return "Varied timings";
}

const DAY_ABBR = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const ALL_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Get working days range display string (e.g. "Mon - Fri")
function getDaysRangeStr(days) {
  if (!days || days.length === 0) return "";
  const dayNames = days.map((d) => d.day_of_week);
  if (dayNames.length === 5 && dayNames[0] === "Monday" && dayNames[4] === "Friday") {
    return "Mon - Fri";
  }
  if (dayNames.length === 6 && dayNames[0] === "Monday" && dayNames[5] === "Saturday") {
    return "Mon - Sat";
  }
  return dayNames.map((d) => DAY_ABBR[d] || d.slice(0, 3)).join(", ");
}

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    schedule_type: "Full Time",
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 60,
    selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });

  const fetchSchedulesData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [schRes, empRes] = await Promise.all([
        scheduleService.getAll(),
        employeeService.getAll().catch(() => []),
      ]);
      setSchedules(Array.isArray(schRes) ? schRes : []);
      setEmployees(Array.isArray(empRes) ? empRes : []);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load working schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulesData();
  }, []);

  // Map employee count per schedule using real Employee.schedule_id relationship
  const scheduleEmployeesMap = useMemo(() => {
    const map = new Map();
    schedules.forEach((s) => map.set(s.id, []));

    employees.forEach((emp) => {
      if (emp.schedule_id && map.has(emp.schedule_id)) {
        map.get(emp.schedule_id).push(emp);
      }
    });

    return map;
  }, [schedules, employees]);

  const handleOpenCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: "",
      schedule_type: "Full Time",
      startTime: "09:00",
      endTime: "17:00",
      breakMinutes: 60,
      selectedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch) => {
    setEditingSchedule(sch);
    const firstDay = sch.days && sch.days.length > 0 ? sch.days[0] : null;
    const dayNames = sch.days ? sch.days.map((d) => d.day_of_week) : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    setFormData({
      name: sch.name || "",
      schedule_type: sch.schedule_type || "Full Time",
      startTime: firstDay ? formatTimeStr(firstDay.start_time) : "09:00",
      endTime: firstDay ? formatTimeStr(firstDay.end_time) : "17:00",
      breakMinutes: firstDay ? firstDay.break_minutes ?? 60 : 60,
      selectedDays: dayNames,
    });
    setIsModalOpen(true);
  };

  const handleToggleDay = (dayName) => {
    setFormData((prev) => {
      const exists = prev.selectedDays.includes(dayName);
      if (exists) {
        if (prev.selectedDays.length === 1) return prev; // At least 1 day required
        return { ...prev, selectedDays: prev.selectedDays.filter((d) => d !== dayName) };
      } else {
        // preserve day order
        const updated = ALL_WEEKDAYS.filter((d) => prev.selectedDays.includes(d) || d === dayName);
        return { ...prev, selectedDays: updated };
      }
    });
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const formattedStartTime = formData.startTime.includes(":") && formData.startTime.split(":").length === 2 ? `${formData.startTime}:00` : formData.startTime;
      const formattedEndTime = formData.endTime.includes(":") && formData.endTime.split(":").length === 2 ? `${formData.endTime}:00` : formData.endTime;

      const daysPayload = formData.selectedDays.map((day) => ({
        day_of_week: day,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        break_minutes: Number(formData.breakMinutes || 0),
      }));

      if (editingSchedule) {
        await scheduleService.update(editingSchedule.id, {
          name: formData.name,
          schedule_type: formData.schedule_type,
          days: daysPayload,
        });
      } else {
        await scheduleService.create({
          name: formData.name,
          schedule_type: formData.schedule_type,
          days: daysPayload,
        });
      }
      setIsModalOpen(false);
      await fetchSchedulesData();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to save schedule.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduleService.delete(id);
      setDeletingScheduleId(null);
      await fetchSchedulesData();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to delete schedule.");
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const timingStr = getDailyTimingStr(s.days).toLowerCase();
      const daysStr = getDaysRangeStr(s.days).toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        (s.schedule_type || "").toLowerCase().includes(term) ||
        `${s.weekly_hours}`.includes(term) ||
        timingStr.includes(term) ||
        daysStr.includes(term)
      );
    });
  }, [schedules, searchTerm]);

  // Primary active schedule for Standard Workweek summary metrics
  const primarySchedule = useMemo(() => {
    return schedules.find((s) => s.is_active !== false) || schedules[0];
  }, [schedules]);

  const activeSchedulesCount = schedules.filter((s) => s.is_active !== false).length;
  const totalAssignedEmps = employees.filter((e) => Boolean(e.schedule_id)).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 text-center text-xs">
        <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Failed to Load Working Schedules</h3>
        <p className="text-rose-700 dark:text-rose-300 mt-1">{errorMsg}</p>
        <button
          onClick={fetchSchedulesData}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Working Schedules</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredSchedules.length} Schedules
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage company working hours, shift timings, and weekly work schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Working Schedule</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Schedules */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Schedules</span>
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{schedules.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{activeSchedulesCount} active time structures</p>
        </div>

        {/* Card 2: Standard Workweek */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Standard Workweek</span>
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {primarySchedule ? `${primarySchedule.weekly_hours} Hours / Wk` : "N/A"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {primarySchedule && primarySchedule.days
              ? `${primarySchedule.days.length} Days ${getDaysRangeStr(primarySchedule.days) ? `(${getDaysRangeStr(primarySchedule.days)})` : ""}`
              : "No active schedule"}
          </p>
        </div>

        {/* Card 3: Schedule Status */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Schedule Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {activeSchedulesCount === schedules.length ? "Fully Configured" : `${activeSchedulesCount}/${schedules.length} Active`}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {totalAssignedEmps} Employee{totalAssignedEmps === 1 ? "" : "s"} Assigned
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search schedules by name, shift hours..."
          className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchedules.map((sch) => {
          const assignedEmps = scheduleEmployeesMap.get(sch.id) || [];
          const assignedCount = assignedEmps.length;
          const dailyTiming = getDailyTimingStr(sch.days);
          const workweekDays = sch.days ? sch.days.length : 0;

          return (
            <div
              key={sch.id}
              className="group rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition leading-snug">
                          {sch.name}
                        </h3>
                      </div>
                      <span className="inline-block rounded-xs bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mt-0.5">
                        {sch.schedule_type || "Full Time"}
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(sch)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                      title="Edit Schedule"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingScheduleId(sch.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete Schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-[#40383D] pt-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      Daily Timing:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dailyTiming}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Workweek:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {workweekDays} {workweekDays === 1 ? "Day" : "Days"} / Week
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Assignment:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Assigned to {assignedCount} {assignedCount === 1 ? "Employee" : "Employees"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 dark:border-[#40383D] pt-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${sch.is_active !== false ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sch.is_active !== false ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {sch.is_active !== false ? "Active Schedule" : "Inactive Schedule"}
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 font-mono">
                  {sch.weekly_hours} hrs/week
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Working Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSchedule ? "Edit Working Schedule" : "Create New Working Schedule"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Schedule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard 40 Hours/Week"
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Schedule Type</label>
                <select
                  value={formData.schedule_type}
                  onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Shift Work">Shift Work</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Break (mins)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData({ ...formData, breakMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">Working Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_WEEKDAYS.map((day) => {
                    const isSelected = formData.selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {DAY_ABBR[day]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#40383D]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingScheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to delete this schedule? Action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingScheduleId(null)}
                className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSchedule(deletingScheduleId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

