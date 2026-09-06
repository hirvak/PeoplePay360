import { useState, useEffect } from "react";
import { Users, Shield, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import adminService from "../../services/adminService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load user list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await adminService.updateRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      await adminService.updateStatus(userId, !currentStatus);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-600" />
        <h3 className="font-bold">Unable to load Users</h3>
        <p className="text-xs mt-1">{errorMsg}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Administration</h1>
          <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
            {users.length} Users
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage system user roles, access permissions, and account status.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#211D20] shadow-xs overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-semibold">No registered users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#211D20]">
                {users.map((u) => {
                  const isPendingThisUser = updatingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/30">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-700 text-xs font-bold text-white">
                            {u.email?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.email}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">User ID #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role?.name || u.role || "Employee"}
                          disabled={isPendingThisUser}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                        >
                          <option value="Employee">Employee</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="HR Payroll User">HR Payroll User</option>
                          <option value="HR Payroll Manager">HR Payroll Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {u.is_active ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isPendingThisUser}
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            u.is_active
                              ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
                              : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {isPendingThisUser ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                          ) : u.is_active ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
