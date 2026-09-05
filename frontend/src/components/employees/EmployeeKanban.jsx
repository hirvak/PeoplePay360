import { useNavigate } from "react-router-dom";
import { Mail, Building2, User, Clock, ChevronRight, Edit3, Users } from "lucide-react";

export default function EmployeeKanban({ employees = [], onEdit }) {
  const navigate = useNavigate();
  const safeEmployees = Array.isArray(employees) ? employees : [];

  if (safeEmployees.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No employees found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Click "+ New Employee" to add your first employee to the organization.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {safeEmployees.map((emp) => {
        const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() || "EM";
        const dept = emp.department_name || "General";
        const mgr = emp.manager_name || "None";
        const schedule = emp.schedule_name || "Standard 40h/Week";
        const active = emp.is_active !== false;

        return (
          <div
            key={emp.id}
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Avatar, Name, Code, Status & Edit Button */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition leading-snug">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center rounded-xs bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
                        {emp.employee_code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                        {emp.job_position || "Employee"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {active ? "Active" : "Inactive"}
                  </span>
                  
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(emp)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                      title="Edit Employee"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body Info List */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{dept}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Manager: <strong className="font-semibold text-slate-700">{mgr}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 truncate">{schedule}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-600">{emp.user_email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Card Bottom Link */}
            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold text-purple-600 group-hover:text-purple-700">
              <span>View Profile</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
