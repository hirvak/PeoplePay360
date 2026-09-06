import { useNavigate } from "react-router-dom";
import { Eye, Edit3, Trash2, Users } from "lucide-react";

export default function EmployeeList({ employees = [], onEdit, onDelete }) {
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
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#211D20] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3.5">Employee</th>
              <th scope="col" className="px-6 py-3.5">Email</th>
              <th scope="col" className="px-6 py-3.5">Job Position</th>
              <th scope="col" className="px-6 py-3.5">Department</th>
              <th scope="col" className="px-6 py-3.5">Manager</th>
              <th scope="col" className="px-6 py-3.5">Working Schedule</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#211D20]">
            {safeEmployees.map((emp) => {
              const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() || "EM";
              const dept = emp.department_name || "General";
              const mgr = emp.manager_name || "None";
              const schedule = emp.schedule_name || "Standard 40h/Week";
              const active = emp.is_active !== false && emp.employment_status !== "Inactive";

              return (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition cursor-pointer group"
                >
                  {/* Employee Name, Code & Avatar */}
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-700 text-xs font-bold text-white shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{emp.employee_code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {emp.user_email || "N/A"}
                  </td>

                  {/* Job Position */}
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">
                    {emp.job_position || "Employee"}
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {dept}
                    </span>
                  </td>

                  {/* Manager */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {mgr}
                  </td>

                  {/* Working Schedule */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <span className="text-xs">{schedule}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        active
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/${emp.id}`);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-100 hover:text-purple-700 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(emp);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-100 hover:text-purple-700 transition cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(emp);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
