import { useState, useEffect } from "react";
import { FileText, Calendar, DollarSign, Briefcase, Building2, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import contractService from "../../services/contractService";
import { useAuth } from "../../context/AuthContext";

export default function MyContractPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadMyContracts() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await contractService.getMyContracts();
        setContracts(data || []);
      } catch (err) {
        console.error("Error loading employee contract:", err);
        setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load contract details.");
      } finally {
        setLoading(false);
      }
    }
    loadMyContracts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const activeContract = contracts.find((c) => c.status === "Active" || c.is_active) || contracts[0];
  const historicalContracts = contracts.filter((c) => c !== activeContract);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Contract</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View your active employment agreement, wage structure, and contract terms.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Contract Card */}
      {!activeContract ? (
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-8 text-center text-slate-500 shadow-xs">
          <FileText className="h-10 w-10 mx-auto mb-3 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Active Contract Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            You do not currently have an active employment contract registered in the system. Contact HR for assistance.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white font-bold shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Employment Contract #{activeContract.id}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {activeContract.status || "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Position: <span className="font-semibold text-purple-700 dark:text-purple-400">{activeContract.job_position || "Not specified"}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right text-xs">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Monthly Wage</span>
                <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
                  ₹{(Number(activeContract.wage) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Contract Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" /> Start Date
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{activeContract.start_date}</span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" /> End Date
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeContract.end_date || "Indefinite / Permanent"}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-purple-600" /> Department ID
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeContract.department_id ? `Dept #${activeContract.department_id}` : "Unassigned"}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-purple-600" /> Salary Structure
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeContract.salary_structure_id ? `Structure #${activeContract.salary_structure_id}` : "Standard Salary Structure"}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-600" /> Working Schedule
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeContract.schedule_id ? `Schedule #${activeContract.schedule_id}` : "Standard Full-Time (40 hrs/wk)"}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-purple-600" /> Job Position
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeContract.job_position || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Contracts */}
          {historicalContracts.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Contract History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Contract ID</th>
                      <th className="px-4 py-3">Job Position</th>
                      <th className="px-4 py-3">Start Date</th>
                      <th className="px-4 py-3">End Date</th>
                      <th className="px-4 py-3">Wage</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {historicalContracts.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">#{c.id}</td>
                        <td className="px-4 py-3 font-medium">{c.job_position}</td>
                        <td className="px-4 py-3">{c.start_date}</td>
                        <td className="px-4 py-3">{c.end_date || "Present"}</td>
                        <td className="px-4 py-3 font-bold text-purple-700 dark:text-purple-400">
                          ₹{(Number(c.wage) || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
