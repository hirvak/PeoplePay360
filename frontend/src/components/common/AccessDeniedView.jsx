import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccessDeniedView() {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your current role (<strong className="text-slate-700 dark:text-slate-200">{user?.role || "Employee"}</strong>) does not have permission to view this section of PeoplePay360.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
