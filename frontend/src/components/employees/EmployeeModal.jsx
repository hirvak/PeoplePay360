import { useState, useEffect } from "react";
import { X, UserPlus, Edit3 } from "lucide-react";

export default function EmployeeModal({ isOpen, onClose, onSave, initialData = null }) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    user_email: "",
    user_role: "Employee",
    job_position: "",
    department_name: "Engineering",
    schedule_name: "Standard 40 Hours/Week",
    manager_name: "Sarah Johnson",
    employment_status: "Full-Time",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        employee_code: initialData.employee_code || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        user_email: initialData.user_email || "",
        user_role: initialData.user_role || "Employee",
        job_position: initialData.job_position || "",
        department_name: initialData.department_name || "Engineering",
        schedule_name: initialData.schedule_name || "Standard 40 Hours/Week",
        manager_name: initialData.manager_name || "Sarah Johnson",
        employment_status: initialData.employment_status || "Full-Time",
        is_active: initialData.is_active !== false,
      });
    } else {
      setFormData({
        employee_code: `EMP-00${Math.floor(Math.random() * 900) + 100}`,
        first_name: "",
        last_name: "",
        user_email: "",
        user_role: "Employee",
        job_position: "",
        department_name: "Engineering",
        schedule_name: "Standard 40 Hours/Week",
        manager_name: "Sarah Johnson",
        employment_status: "Full-Time",
        is_active: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formData.user_email.trim()) {
      newErrors.user_email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = "Please enter a valid email address.";
    }
    if (!formData.job_position.trim()) newErrors.job_position = "Job position is required.";
    if (!formData.employee_code.trim()) newErrors.employee_code = "Employee code is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const savedData = {
      ...formData,
      id: isEditing ? formData.id : Date.now(),
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              {isEditing ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Employee Profile" : "Create New Employee"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Update employee role, position, and organizational details"
                  : "Fill in details to onboard a new employee"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Employee Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Employee Code *
              </label>
              <input
                type="text"
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-hidden ${
                  errors.employee_code ? "border-red-500 bg-red-50/30" : "border-slate-300 bg-slate-50 focus:border-purple-600 focus:bg-white"
                }`}
              />
              {errors.employee_code && <p className="text-[11px] text-red-600 mt-1">{errors.employee_code}</p>}
            </div>

            {/* System Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                System Role
              </label>
              <select
                name="user_role"
                value={formData.user_role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="Employee">Employee</option>
                <option value="Developer">Developer</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Finance Manager">Finance Manager</option>
                <option value="Designer">Designer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-hidden ${
                  errors.first_name ? "border-red-500 bg-red-50/30" : "border-slate-300 bg-white focus:border-purple-600"
                }`}
              />
              {errors.first_name && <p className="text-[11px] text-red-600 mt-1">{errors.first_name}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Smith"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-hidden ${
                  errors.last_name ? "border-red-500 bg-red-50/30" : "border-slate-300 bg-white focus:border-purple-600"
                }`}
              />
              {errors.last_name && <p className="text-[11px] text-red-600 mt-1">{errors.last_name}</p>}
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Work Email Address *
              </label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                placeholder="john.smith@peoplepay360.com"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-hidden ${
                  errors.user_email ? "border-red-500 bg-red-50/30" : "border-slate-300 bg-white focus:border-purple-600"
                }`}
              />
              {errors.user_email && <p className="text-[11px] text-red-600 mt-1">{errors.user_email}</p>}
            </div>

            {/* Job Position */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Job Position *
              </label>
              <input
                type="text"
                name="job_position"
                value={formData.job_position}
                onChange={handleChange}
                placeholder="e.g. Senior Software Developer"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-hidden ${
                  errors.job_position ? "border-red-500 bg-red-50/30" : "border-slate-300 bg-white focus:border-purple-600"
                }`}
              />
              {errors.job_position && <p className="text-[11px] text-red-600 mt-1">{errors.job_position}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Department
              </label>
              <select
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Payroll">Finance & Payroll</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Direct Manager */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Direct Manager
              </label>
              <select
                name="manager_name"
                value={formData.manager_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="Sarah Johnson">Sarah Johnson (HR Manager)</option>
                <option value="John Smith">John Smith (Tech Lead)</option>
                <option value="Michael Brown">Michael Brown (Finance Lead)</option>
                <option value="Executive Leadership">Executive Leadership</option>
              </select>
            </div>

            {/* Working Schedule */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Working Schedule
              </label>
              <select
                name="schedule_name"
                value={formData.schedule_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="Standard 40 Hours/Week">Standard 40 Hours/Week</option>
                <option value="Flexible Shift">Flexible Shift</option>
                <option value="Part-Time 20h">Part-Time 20h/Week</option>
              </select>
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Employment Status
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* Active Status Switch */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-800 cursor-pointer">
                Active Employee Status
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition shadow-xs cursor-pointer"
            >
              {isEditing ? "Save Changes" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
