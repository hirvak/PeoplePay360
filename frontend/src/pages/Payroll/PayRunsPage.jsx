import { useState, useMemo } from "react";
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
} from "lucide-react";
import { MOCK_PAYRUNS } from "../../data/payrollData";
import PayrunWizardModal from "../../components/payroll/PayrunWizardModal";

export default function PayRunsPage() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState(MOCK_PAYRUNS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleCreatePayrunFromWizard = (newPayrun) => {
    setPayruns((prev) => [newPayrun, ...prev]);
    setIsWizardOpen(false);
    // Navigate immediately to processing screen for the newly created payrun
    navigate(`/payroll/payruns/${newPayrun.id}`, { state: { payrun: newPayrun } });
  };

  const handleDeletePayrun = (id, e) => {
    e.stopPropagation();
    setPayruns((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPayruns = useMemo(() => {
    return payruns.filter((pr) => {
      if (statusFilter !== "all" && pr.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        pr.name.toLowerCase().includes(term) ||
        pr.period.toLowerCase().includes(term) ||
        pr.id.toLowerCase().includes(term) ||
        pr.structure_name.toLowerCase().includes(term)
      );
    });
  }, [payruns, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            Validated
          </span>
        );
      case "Computed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
            Computed
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payruns</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredPayruns.length} Payruns
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage payroll computation runs, validate disbursements, and process monthly employee salary payruns.
          </p>
        </div>

        {/* New Payrun Button (Triggers 2-Step Setup Wizard) */}
        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Payrun</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payruns</span>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{payruns.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Payroll runs on record</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Disbursement</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">$33,260</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">February 2026 Payroll</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Workflow Compliance</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">Validated</p>
          <p className="text-[11px] text-slate-500 mt-1">Draft → Compute → Validate → Paid</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payrun by name, period, ID, structure..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({payruns.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "draft" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("validated")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "validated" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Validated
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "paid" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* Payruns List Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredPayruns.map((pr) => (
                <tr
                  key={pr.id}
                  onClick={() => navigate(`/payroll/payruns/${pr.id}`, { state: { payrun: pr } })}
                  className="hover:bg-purple-50/50 transition cursor-pointer group"
                >
                  {/* Name & ID */}
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 transition">{pr.name}</div>
                        <div className="text-xs font-mono text-slate-500">{pr.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{pr.period}</span>
                    </div>
                  </td>

                  {/* Structure */}
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap text-xs max-w-[180px] truncate">
                    {pr.structure_name}
                  </td>

                  {/* Employee Count */}
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                      <Users className="h-3 w-3 text-purple-600" />
                      {pr.employee_count} Employees
                    </span>
                  </td>

                  {/* Gross Total */}
                  <td className="px-6 py-4 text-slate-900 font-semibold whitespace-nowrap">
                    ${pr.total_gross.toLocaleString()}
                  </td>

                  {/* Total Deductions */}
                  <td className="px-6 py-4 text-rose-600 font-medium whitespace-nowrap">
                    -${pr.total_deductions.toLocaleString()}
                  </td>

                  {/* Net Disbursement */}
                  <td className="px-6 py-4 font-extrabold text-purple-700 whitespace-nowrap">
                    ${pr.total_net.toLocaleString()}
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
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        <span>Process</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeletePayrun(pr.id, e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Payrun"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
