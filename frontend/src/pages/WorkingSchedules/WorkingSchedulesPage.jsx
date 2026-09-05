import { useState, useMemo } from "react";
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
} from "lucide-react";

// Starter mock working schedules
const STARTER_SCHEDULES = [
  {
    id: 1,
    name: "Standard 40 Hours/Week",
    total_hours_per_week: 40,
    working_days: 5,
    daily_hours: "09:00 AM - 05:00 PM",
    is_default: true,
    status: "Active",
    description: "Standard full-time 8-hour workday schedule running Monday through Friday.",
  },
  {
    id: 2,
    name: "Part-Time 20 Hours/Week",
    total_hours_per_week: 20,
    working_days: 4,
    daily_hours: "09:00 AM - 02:00 PM",
    is_default: false,
    status: "Active",
    description: "Part-time schedule running 5 hours per day Monday through Thursday.",
  },
  {
    id: 3,
    name: "Flexible Shift 35 Hours/Week",
    total_hours_per_week: 35,
    working_days: 5,
    daily_hours: "08:00 AM - 04:00 PM (Flexible)",
    is_default: false,
    status: "Active",
    description: "Flexible core-hours schedule for engineering and product teams.",
  },
];

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState(STARTER_SCHEDULES);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    total_hours_per_week: 40,
    working_days: 5,
    daily_hours: "09:00 AM - 05:00 PM",
    status: "Active",
    description: "",
  });

  const handleOpenCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: "",
      total_hours_per_week: 40,
      working_days: 5,
      daily_hours: "09:00 AM - 05:00 PM",
      status: "Active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch) => {
    setEditingSchedule(sch);
    setFormData({ ...sch });
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingSchedule.id ? { ...formData, id: editingSchedule.id } : s))
      );
    } else {
      const newSchedule = {
        ...formData,
        id: Date.now(),
        is_default: false,
      };
      setSchedules((prev) => [newSchedule, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setDeletingScheduleId(null);
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.daily_hours.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
      );
    });
  }, [schedules, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Working Schedules</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredSchedules.length} Schedules
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Schedules</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{schedules.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active time structures</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Workweek</span>
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">40 Hours / Wk</p>
          <p className="text-[11px] text-slate-500 mt-1">5 Days (Mon - Fri)</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Schedule Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">Fully Configured</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Assigned across employees</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search schedules by name, shift hours..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchedules.map((sch) => (
          <div
            key={sch.id}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-purple-300 hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition leading-snug">
                        {sch.name}
                      </h3>
                    </div>
                    {sch.is_default && (
                      <span className="inline-block rounded-xs bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 mt-0.5">
                        Company Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(sch)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                    title="Edit Schedule"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingScheduleId(sch.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {sch.description}
              </p>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    Daily Timing:
                  </span>
                  <span className="font-semibold text-slate-800">{sch.daily_hours}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                    Workweek:
                  </span>
                  <span className="font-bold text-slate-900">{sch.working_days} Days / Week</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Schedule
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {sch.total_hours_per_week} hrs/week
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Working Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSchedule ? "Edit Working Schedule" : "Create New Working Schedule"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Schedule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard 40 Hours/Week"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Weekly Hours *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_hours_per_week}
                    onChange={(e) => setFormData({ ...formData, total_hours_per_week: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Working Days / Week *</label>
                  <input
                    type="number"
                    required
                    value={formData.working_days}
                    onChange={(e) => setFormData({ ...formData, working_days: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Daily Shift Timings</label>
                <input
                  type="text"
                  value={formData.daily_hours}
                  onChange={(e) => setFormData({ ...formData, daily_hours: e.target.value })}
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Schedule details and shift policy notes..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Delete Schedule</h3>
            <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this schedule? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingScheduleId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSchedule(deletingScheduleId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
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
