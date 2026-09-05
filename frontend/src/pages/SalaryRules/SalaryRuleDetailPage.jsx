import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Tag,
  Code,
  CheckCircle2,
  Edit3,
  Calculator,
} from "lucide-react";
import { MOCK_SALARY_RULES } from "../../data/payrollData";

export default function SalaryRuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const rule = useMemo(() => {
    if (location.state?.rule) return location.state.rule;
    return MOCK_SALARY_RULES.find((r) => r.id === id) || MOCK_SALARY_RULES[0];
  }, [id, location.state]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payroll/rules")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Back to Salary Rules"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Salary Rule</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">{rule.code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{rule.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rule Name</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">{rule.name}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rule Code</span>
            <span className="inline-block rounded-md bg-purple-50 px-2.5 py-1 text-xs font-mono font-bold text-purple-700 border border-purple-200 mt-1">
              {rule.code}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</span>
            <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mt-1">
              {rule.category} ({rule.category_type || "Standard"})
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Sequence Index</span>
            <span className="text-sm font-semibold text-slate-900 mt-1 block font-mono">#{rule.sequence}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Calculation Method</span>
            <span className="text-sm font-medium text-slate-900 mt-1 block">{rule.calculation_method}</span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rate / Percentage</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{rule.amount || rule.percentage || "Dynamic Formula"}</span>
          </div>
        </div>

        {/* Computation Formula Block */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
            <Code className="h-4 w-4 text-purple-600" />
            <span>Formula / Calculation Expression</span>
          </div>
          <p className="font-mono text-sm font-bold text-purple-800 bg-white p-3 rounded-lg border border-purple-200">
            {rule.formula || "Fixed Rate Expression"}
          </p>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Purpose</h4>
          <p className="text-xs text-slate-700 leading-relaxed">{rule.description || "No specific policy notes defined for this rule."}</p>
        </div>
      </div>
    </div>
  );
}
