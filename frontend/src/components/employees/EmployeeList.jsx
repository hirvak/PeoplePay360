import { useNavigate } from "react-router-dom";
import { Eye, Edit3, Users } from "lucide-react";

export default function EmployeeList({ employees = [], onEdit }) {
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
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
          <tbody className="divide-y divide-slate-200 bg-white">
            {safeEmployees.map((emp) => {
              const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() || "EM";
              const dept = emp.department_name || "General";
              const mgr = emp.manager_name || "None";
              const schedule = emp.schedule_name || "Standard 40h/Week";
              const active = emp.is_active !== false;

              return (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="hover:bg-purple-50/50 transition cursor-pointer group"
                >
                  {/* Employee Name, Code & Avatar */}
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 transition">
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">{emp.employee_code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {emp.user_email || "N/A"}
                  </td>

                  {/* Job Position */}
                  <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">
                    {emp.job_position || "Employee"}
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {dept}
                    </span>
                  </td>

                  {/* Manager */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {mgr}
                  </td>

                  {/* Working Schedule */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="text-xs">{schedule}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
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
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-100 hover:text-purple-700 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(emp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-100 hover:text-purple-700 transition cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit3 className="h-4 w-4" />
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
