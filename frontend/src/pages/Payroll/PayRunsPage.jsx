import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Play,
  Loader2,
  Clock,
  Calculator,
} from "lucide-react";
import payrunService from "../../services/payrunService";
import salaryService from "../../services/salaryService";
import PayrunWizardModal from "../../components/payroll/PayrunWizardModal";

export default function PayRunsPage() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const fetchPayrunsAndStructures = async () => {
    try {
      setLoading(true);
      const [prData, structData] = await Promise.all([
        payrunService.getAll().catch(() => []),
        salaryService.getAllStructures().catch(() => []),
      ]);
      setPayruns(Array.isArray(prData) ? prData : []);
      setStructures(Array.isArray(structData) ? structData : []);
    } catch (err) {
      console.error("Failed to load payruns data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrunsAndStructures();
  }, []);

  const structuresMap = useMemo(() => {
    const map = new Map();
    structures.forEach((s) => {
      map.set(s.id, s.name);
    });
    return map;
  }, [structures]);

  const handleCreatePayrunFromWizard = (newPayrun) => {
    setIsWizardOpen(false);
    fetchPayrunsAndStructures();
    if (newPayrun?.id) {
      navigate(`/payroll/payruns/${newPayrun.id}`, { state: { payrun: newPayrun } });
    }
  };

  const handleDeletePayrun = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel/delete this payrun?")) return;
    try {
      await payrunService.cancel(id).catch(() => {});
      fetchPayrunsAndStructures();
    } catch (err) {
      console.error("Error cancelling payrun:", err);
    }
  };

  // Status Tabs Counts
  const statusCounts = useMemo(() => {
    const draft = payruns.filter((p) => p.status?.toLowerCase() === "draft").length;
    const validated = payruns.filter((p) =>
      ["validated", "calculated", "computed", "finalized"].includes(p.status?.toLowerCase())
    ).length;
    const paid = payruns.filter((p) => p.status?.toLowerCase() === "paid").length;
    return {
      all: payruns.length,
      draft,
      validated,
      paid,
    };
  }, [payruns]);

  // Search & Filtered Payruns
  const filteredPayruns = useMemo(() => {
    return payruns.filter((pr) => {
      const st = pr.status?.toLowerCase() || "draft";
      if (statusFilter === "draft" && st !== "draft") return false;
      if (
        statusFilter === "validated" &&
        !["validated", "calculated", "computed", "finalized"].includes(st)
      )
        return false;
      if (statusFilter === "paid" && st !== "paid") return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const name = pr.name || "";
      const idStr = `pay-${pr.id} ${pr.id}`;
      const period = `${pr.period_start || ""} ${pr.period_end || ""} ${pr.period || ""}`;
      const structName = structuresMap.get(pr.salary_structure_id) || pr.structure_name || "";
      const statusStr = pr.status || "";

      return (
        name.toLowerCase().includes(term) ||
        idStr.toLowerCase().includes(term) ||
        period.toLowerCase().includes(term) ||
        structName.toLowerCase().includes(term) ||
        statusStr.toLowerCase().includes(term)
      );
    });
  }, [payruns, searchTerm, statusFilter, structuresMap]);

  // Latest Disbursement Card Calculation (Only actual Paid / Finalized payruns)
  const latestPaid = useMemo(() => {
    const paidList = payruns.filter((p) => p.status === "Paid" || p.status === "Finalized");
    if (paidList.length === 0) {
      return { amount: 0, name: "No disbursement yet" };
    }
    const latest = paidList.slice().sort(
      (a, b) => new Date(b.period_end || b.created_at) - new Date(a.period_end || a.created_at)
    )[0];
    return {
      amount: Number(latest.total_net || 0),
      name: latest.name,
    };
  }, [payruns]);

  // Workflow Compliance Card Calculation
  const latestWorkflowStatus = useMemo(() => {
    const activePayruns = payruns.filter((p) => p.status !== "Cancelled");
    if (activePayruns.length === 0) return "Draft";
    const latest = activePayruns.slice().sort(
      (a, b) => new Date(b.created_at || b.period_end) - new Date(a.created_at || a.period_end)
    )[0];
    return latest.status || "Draft";
  }, [payruns]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Paid
          </span>
        );
      case "Finalized":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Finalized
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Validated
          </span>
        );
      case "Calculated":
      case "Computed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Calculator className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Calculated
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payruns</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              {filteredPayruns.length} Payruns
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage payroll computation runs, validate disbursements, and process monthly employee salary payruns.
          </p>
        </div>

        {/* New Payrun Button (Triggers 2-Step Setup Wizard) */}
        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 dark:hover:bg-purple-600 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Payrun</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Payruns */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Payruns</span>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{payruns.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Payroll runs on record</p>
        </div>

        {/* Latest Disbursement */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Latest Disbursement</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{latestPaid.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{latestPaid.name}</p>
        </div>

        {/* Workflow Compliance */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workflow Compliance</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{latestWorkflowStatus}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Draft → Compute → Validate → Paid</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payrun by name, period, ID..."
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-1 shadow-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "draft" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Draft ({statusCounts.draft})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("validated")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "validated" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Validated / Computed ({statusCounts.validated})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "paid" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Paid ({statusCounts.paid})
          </button>
        </div>
      </div>

      {/* Payruns List Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredPayruns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No payruns found</p>
            <p className="text-xs mt-1">No payrun records match your current filter selection.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3.5">Payrun Name</th>
                <th scope="col" className="px-6 py-3.5">Period</th>
                <th scope="col" className="px-6 py-3.5">Structure</th>
                <th scope="col" className="px-6 py-3.5">Employees</th>
                <th scope="col" className="px-6 py-3.5">Gross Total</th>
                <th scope="col" className="px-6 py-3.5">Deductions</th>
                <th scope="col" className="px-6 py-3.5">Net Disbursement</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#211D20]">
              {filteredPayruns.map((pr) => {
                const empCount = pr.total_employees || pr.selected_employee_ids?.length || 0;
                const periodText = pr.period || (pr.period_start && pr.period_end ? `${pr.period_start} ~ ${pr.period_end}` : "N/A");
                const grossVal = Number(pr.total_gross || 0);
                const dedVal = Number(pr.total_deductions || 0);
                const netVal = Number(pr.total_net || 0);
                const structureName = structuresMap.get(pr.salary_structure_id) || pr.structure_name || `Structure #${pr.salary_structure_id}`;

                return (
                <tr
                  key={pr.id}
                  onClick={() => navigate(`/payroll/payruns/${pr.id}`, { state: { payrun: pr } })}
                  className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition cursor-pointer group"
                >
                  {/* Name & ID */}
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">{pr.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">PAY-{pr.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{periodText}</span>
                    </div>
                  </td>

                  {/* Structure */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap text-xs max-w-[180px] truncate font-medium">
                    {structureName}
                  </td>

                  {/* Employee Count */}
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      {empCount} Employees
                    </span>
                  </td>

                  {/* Gross Total */}
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                    ₹{grossVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Total Deductions */}
                  <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap">
                    -₹{dedVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Net Disbursement */}
                  <td className="px-6 py-4 font-extrabold text-purple-700 dark:text-purple-400 whitespace-nowrap">
                    ₹{netVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(pr.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/payruns/${pr.id}`, { state: { payrun: pr } })}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        <span>Process</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeletePayrun(pr.id, e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 transition cursor-pointer"
                        title="Delete Payrun"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 2-Step Payrun Wizard Modal */}
      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreatePayrun={handleCreatePayrunFromWizard}
      />
    </div>
  );
}
