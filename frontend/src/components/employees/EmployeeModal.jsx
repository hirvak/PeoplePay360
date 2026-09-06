import { useState, useEffect } from "react";
import { X, UserPlus, Edit3, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, User } from "lucide-react";

import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import authService from "../../services/authService";

export default function EmployeeModal({ isOpen, onClose, onSave, initialData = null }) {
  const isEditing = Boolean(initialData);
  const isAlreadyLinked = Boolean(initialData?.user_id || initialData?.user_email);

  const [formData, setFormData] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    user_email: "",
    password: "",
    confirm_password: "",
    create_login_account: false,
    job_position: "",
    department_id: "1",
    employment_status: "Active",
    is_active: true,
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccessData, setCreatedSuccessData] = useState(null);
  const [existingRegisteredUserId, setExistingRegisteredUserId] = useState(null);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await departmentService.getAll();
        setDepartments(depts || []);
        if (!initialData && depts && depts.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: String(depts[0].id) }));
        }
      } catch (err) {
        console.error("Failed to load departments in EmployeeModal", err);
      }
    }
    if (isOpen) {
      loadDepts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        employee_code: initialData.employee_code || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        user_email: initialData.user_email || "",
        password: "",
        confirm_password: "",
        create_login_account: false,
        job_position: initialData.job_position || "",
        department_id: initialData.department_id ? String(initialData.department_id) : "1",
        employment_status: initialData.employment_status || "Active",
        is_active: initialData.is_active !== false,
      });
    } else {
      setFormData({
        employee_code: `EMP-${Math.floor(Math.random() * 900) + 100}`,
        first_name: "",
        last_name: "",
        user_email: "",
        password: "",
        confirm_password: "",
        create_login_account: true,
        job_position: "",
        department_id: "1",
        employment_status: "Active",
        is_active: true,
      });
    }
    setErrors({});
    setSubmitError("");
    setCreatedSuccessData(null);
    setExistingRegisteredUserId(null);
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
    if (!formData.job_position.trim()) newErrors.job_position = "Job position is required.";
    if (!formData.employee_code.trim()) newErrors.employee_code = "Employee code is required.";

    if (formData.create_login_account && !isAlreadyLinked) {
      if (!formData.user_email.trim()) {
        newErrors.user_email = "Work Email is required for login account creation.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email.trim())) {
        newErrors.user_email = "Please enter a valid email address.";
      }

      if (!existingRegisteredUserId) {
        if (!formData.password) {
          newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters.";
        }

        if (!formData.confirm_password) {
          newErrors.confirm_password = "Please confirm the password.";
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = "Passwords do not match.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError("");
    setIsSubmitting(true);

    try {
      let registeredUserId = existingRegisteredUserId;

      // 1. Create User account if requested, not already linked, and not already registered in a prior submit attempt
      if (formData.create_login_account && !isAlreadyLinked && !registeredUserId) {
        try {
          console.log("[EMPLOYEE_MODAL] Registering User account for:", formData.user_email.trim());
          const userRes = await authService.register({
            email: formData.user_email.trim(),
            password: formData.password,
          });

          // Safely extract User ID from response.id or response.data.id
          registeredUserId = userRes?.id || userRes?.data?.id;

          if (!registeredUserId || isNaN(Number(registeredUserId)) || Number(registeredUserId) <= 0) {
            throw new Error("User account registration succeeded, but failed to return a valid User ID.");
          }

          setExistingRegisteredUserId(registeredUserId);
          console.log("[EMPLOYEE_MODAL] Registered User ID:", registeredUserId);
        } catch (regErr) {
          console.error("[EMPLOYEE_MODAL] Registration Error:", regErr);
          const backendErr = regErr?.response?.data?.detail || regErr.message;
          if (typeof backendErr === "string" && backendErr.toLowerCase().includes("email already registered")) {
            setSubmitError("An account with this email already exists.");
          } else {
            setSubmitError(backendErr || "Failed to create user login account. Please try again.");
          }
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Prepare Employee Payload (DO NOT SEND PASSWORD TO EMPLOYEE API)
      const payload = {
        employee_code: formData.employee_code.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        department_id: Number(formData.department_id) || 1,
        job_position: formData.job_position.trim(),
        employment_status: formData.employment_status || "Active",
      };

      if (formData.create_login_account && !isAlreadyLinked) {
        if (!registeredUserId) {
          setSubmitError("User account was not created or User ID is missing. Cannot create employee linked to login.");
          setIsSubmitting(false);
          return;
        }
        payload.user_id = Number(registeredUserId);
      }

      console.log("[EMPLOYEE_MODAL] Creating employee with payload:", payload);

      let result;
      if (isEditing) {
        result = await employeeService.update(formData.id, payload);
      } else {
        result = await employeeService.create(payload);
      }

      console.log("[EMPLOYEE_MODAL] Employee created response:", result);

      // 3. Verify user_id link in returned employee record if login account was requested
      if (formData.create_login_account && !isAlreadyLinked) {
        const returnedUserId = result?.user_id || result?.data?.user_id;
        if (!returnedUserId || Number(returnedUserId) !== Number(registeredUserId)) {
          console.error("[EMPLOYEE_MODAL] LINK FAILURE! Expected user_id:", registeredUserId, "Got:", returnedUserId);
          setSubmitError(`Login account was created (User ID: ${registeredUserId}), but employee profile creation failed to link user_id.`);
          setIsSubmitting(false);
          return;
        }
      }

      // 4. Show Success Card if login account was created, or close modal directly
      if (formData.create_login_account && registeredUserId) {
        setCreatedSuccessData({
          employee_code: result.employee_code,
          email: formData.user_email.trim(),
          role: "Employee",
          user_id: registeredUserId,
          employee_id: result.id,
        });
      } else {
        onSave(result);
        onClose();
      }
    } catch (err) {
      console.error("[EMPLOYEE_MODAL] Employee Creation Error:", err);
      setSubmitError(err?.response?.data?.detail || err.message || "Failed to save employee profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSuccess = () => {
    if (onSave) onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {isEditing ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? "Edit Employee Profile" : "Create New Employee"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Update employee organizational details and profile"
                  : "Fill in details to onboard a new employee and optional login account"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success View Screen */}
        {createdSuccessData ? (
          <div className="p-6 space-y-6 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Employee and login account created successfully.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The user account is linked to the employee record and ready for employee self-service login.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 font-sans">Employee Code:</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{createdSuccessData.employee_code}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 font-sans">Work Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{createdSuccessData.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 font-sans">User ID / Employee ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">User #{createdSuccessData.user_id} ↔ Employee #{createdSuccessData.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">System Role:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  {createdSuccessData.role}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full sm:w-auto rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 text-sm transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {submitError && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* SECTION 1: EMPLOYEE PROFILE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Employee Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee Code */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Employee Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                      errors.employee_code ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                    }`}
                  />
                  {errors.employee_code && <p className="text-[11px] text-rose-600 mt-1">{errors.employee_code}</p>}
                </div>

                {/* Job Position */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Job Position <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="job_position"
                    value={formData.job_position}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Developer"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                      errors.job_position ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                    }`}
                  />
                  {errors.job_position && <p className="text-[11px] text-rose-600 mt-1">{errors.job_position}</p>}
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                      errors.first_name ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                    }`}
                  />
                  {errors.first_name && <p className="text-[11px] text-rose-600 mt-1">{errors.first_name}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="e.g. Smith"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                      errors.last_name ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                    }`}
                  />
                  {errors.last_name && <p className="text-[11px] text-rose-600 mt-1">{errors.last_name}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Employment Status
                  </label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOGIN ACCOUNT */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Login Account
                  </h3>
                </div>

                {!isAlreadyLinked && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="create_login_account"
                      name="create_login_account"
                      checked={formData.create_login_account}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="create_login_account" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                      Create login account for this employee
                    </label>
                  </div>
                )}
              </div>

              {isAlreadyLinked ? (
                /* Already Linked State */
                <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Login account already linked</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {formData.user_email || "Linked User Account"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {initialData?.user_role || "Employee"}
                  </span>
                </div>
              ) : !formData.create_login_account ? (
                /* Disabled Checkbox Message */
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-500 dark:text-slate-400 italic">
                  No login credentials will be created. This employee record will exist for HR tracking without portal access.
                </div>
              ) : (
                /* Active Login Account Creation Fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/30 dark:bg-purple-950/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
                  {/* Work Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="user_email"
                      disabled={Boolean(existingRegisteredUserId)}
                      value={formData.user_email}
                      onChange={handleChange}
                      placeholder="e.g. hirva@gmail.com"
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                        errors.user_email ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                      }`}
                    />
                    {errors.user_email && <p className="text-[11px] text-rose-600 mt-1">{errors.user_email}</p>}
                    {existingRegisteredUserId && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        ✓ User account created (User ID: {existingRegisteredUserId}). Ready to link to employee profile.
                      </p>
                    )}
                  </div>

                  {!existingRegisteredUserId && (
                    <>
                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                            errors.password ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                          }`}
                        />
                        {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 dark:bg-slate-950 focus:outline-hidden ${
                            errors.confirm_password ? "border-rose-500 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 focus:border-purple-600"
                          }`}
                        />
                        {errors.confirm_password && <p className="text-[11px] text-rose-600 mt-1">{errors.confirm_password}</p>}
                      </div>
                    </>
                  )}

                  {/* Fixed System Role */}
                  <div className="sm:col-span-2 flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Assigned System Role:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      Employee
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 text-sm transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : isEditing ? "Save Changes" : "Create Employee"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
