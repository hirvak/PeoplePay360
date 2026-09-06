import { useNavigate } from "react-router-dom";
import { Mail, Building2, User, Clock, ChevronRight, Edit3, Trash2, Users, Eye } from "lucide-react";

export default function EmployeeKanban({ employees = [], onEdit, onDelete }) {
  const navigate = useNavigate();
  const safeEmployees = Array.isArray(employees) ? employees : [];

  if (safeEmployees.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No employees found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
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
        const active = emp.is_active !== false && emp.employment_status !== "Inactive";

        return (
          <div
            key={emp.id}
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="group relative rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Avatar, Name, Code, Status & Actions */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-700 text-sm font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition leading-snug truncate">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <span className="inline-flex shrink-0 items-center rounded-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {emp.employee_code}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                        {emp.job_position || "Employee"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top-Right Action & Status Container */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {active ? "Active" : "Inactive"}
                  </span>
                  
                  <div className="inline-flex items-center gap-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 p-0.5 border border-slate-200/80 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employees/${emp.id}`);
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer shadow-2xs"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(emp);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer shadow-2xs"
                        title="Edit Employee"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(emp);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body Info List */}
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{dept}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>Manager: <strong className="font-semibold text-slate-700 dark:text-slate-200">{mgr}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{schedule}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate text-slate-600 dark:text-slate-300">{emp.user_email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Card Bottom Link */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
              <span>View Profile</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
