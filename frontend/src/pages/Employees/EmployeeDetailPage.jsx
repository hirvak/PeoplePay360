import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Clock,
  Briefcase,
  FileText,
  Calendar,
  Layers,
  Edit3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import EmployeeModal from "../../components/employees/EmployeeModal";

import employeeService from "../../services/employeeService";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchEmployeeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await employeeService.getById(id);
      setEmployee(data);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load employee details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetail();
  }, [id]);

  const handleSaveEmployee = async () => {
    await fetchEmployeeDetail();
    setIsEditModalOpen(false);
  };


  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading employee details...
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-8 text-center text-rose-600 font-medium">
        {errorMsg || "Employee record not found."}
      </div>
    );
  }

  const initials = `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase() || "EM";
  const dept = employee.department_name || (employee.department ? employee.department.name : "General");
  const mgr = employee.manager_name || "None";
  const schedule = employee.schedule_name || (employee.schedule ? employee.schedule.name : "Standard Schedule");
  const active = employee.employment_status !== "Inactive" && employee.is_active !== false;


  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Back to Employees"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Employees</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{employee.employee_code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {employee.first_name} {employee.last_name}
            </h1>
          </div>
        </div>

        {/* Action Button: Edit Employee */}
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
        >
          <Edit3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Odoo-Style Form Card */}
      <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs overflow-hidden">
        
        {/* Card Header & Smart Buttons */}
        <div className="border-b border-slate-200 dark:border-[#40383D] bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Employee Brief Profile Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {employee.first_name} {employee.last_name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    active
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-600 dark:bg-emerald-400" : "bg-slate-400"}`} />
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{employee.job_position || "Employee"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{employee.user_email || "No email"}</p>
            </div>
          </div>

          {/* Odoo-Style Related Record Buttons (Smart Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t lg:border-t-0 border-slate-200 dark:border-[#40383D] pt-4 lg:pt-0">
            {/* 1. Contracts */}
            <Link
              to="/employees/contracts"
              className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 text-center hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-bold text-sm">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Contracts</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Employee Contracts</span>
            </Link>

            {/* 2. Attendance */}
            <Link
              to="/attendance"
              className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 text-center hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-bold text-sm">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Attendance Log</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Timesheets</span>
            </Link>

            {/* 3. Time Off */}
            <Link
              to="/time-off/requests"
              className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 text-center hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-bold text-sm">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Time Off</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Requests</span>
            </Link>

            {/* 4. Allocations */}
            <Link
              to="/time-off/allocations"
              className="flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 text-center hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 font-bold text-sm">
                <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Allocations</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Balances</span>
            </Link>
          </div>
        </div>

        {/* Form Content Grid */}
        <div className="p-6 space-y-8">
          
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/50 pb-2 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">First Name</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 block">{employee.first_name}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Last Name</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 block">{employee.last_name}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Employee Code</span>
                <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 mt-1">
                  {employee.employee_code}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Work Email</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {employee.user_email || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">System Role</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 block">{employee.user_role || "Employee"}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Organization Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/50 pb-2 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Organization Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Department</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1 block">{dept}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Job Position</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1 block">{employee.job_position || "Employee"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Direct Manager</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 block">{mgr}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Working Schedule</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {schedule}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Employment Information & Status */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/50 pb-2 mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Employment Information & Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Employment Status</span>
                <span className="inline-block rounded-md bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mt-1">
                  {employee.employment_status || "Full-Time"}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Active Status</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  {active ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Active Employee</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Inactive</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={employee}
      />
    </div>
  );
}
