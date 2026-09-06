import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Tag,
  Code,
  CheckCircle2,
  Edit3,
  Calculator,
  Loader2,
} from "lucide-react";
import salaryService from "../../services/salaryService";

export default function SalaryRuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rule, setRule] = useState(location.state?.rule || null);
  const [loading, setLoading] = useState(!location.state?.rule);

  useEffect(() => {
    if (!rule && id) {
      setLoading(true);
      salaryService
        .getRuleById(id)
        .then((data) => setRule(data))
        .catch((err) => console.error("Failed to load rule:", err))
        .finally(() => setLoading(false));
    }
  }, [id, rule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Rule not found.
      </div>
    );
  }

  const categoryLabel = rule.category === "EARNING" || rule.category === "Allowance" ? "Allowance" : "Deduction";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payroll/rules")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Back to Salary Rules"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Salary Rule</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{rule.code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{rule.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rule Name</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">{rule.name}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rule Code</span>
            <span className="inline-block rounded-md bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mt-1">
              {rule.code}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</span>
            <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mt-1">
              {categoryLabel}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Sequence Index</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white mt-1 block font-mono">#{rule.sequence}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Calculation Method</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white mt-1 block">{rule.rule_type || rule.calculation_method || "FIXED"}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rate / Percentage</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {rule.amount ? `₹${rule.amount}` : rule.percentage ? `${rule.percentage}%` : rule.formula || "Dynamic Formula"}
            </span>
          </div>
        </div>

        {/* Computation Formula Block */}
        <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
            <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Formula / Calculation Expression</span>
          </div>
          <p className="font-mono text-sm font-bold text-purple-800 dark:text-purple-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            {rule.formula || "Fixed Rate Expression"}
          </p>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Purpose</h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rule.description || "No specific policy notes defined for this rule."}</p>
        </div>
      </div>
    </div>
  );
}

