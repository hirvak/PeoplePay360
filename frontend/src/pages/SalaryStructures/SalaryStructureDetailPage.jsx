import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Plus,
  Tag,
  CheckCircle2,
  Trash2,
  Edit3,
  FileText,
  Users,
} from "lucide-react";
import { MOCK_SALARY_STRUCTURES, MOCK_SALARY_RULES } from "../../data/payrollData";

export default function SalaryStructureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialStructure = useMemo(() => {
    if (location.state?.structure) return location.state.structure;
    return MOCK_SALARY_STRUCTURES.find((s) => s.id === id) || MOCK_SALARY_STRUCTURES[0];
  }, [id, location.state]);

  const [structure, setStructure] = useState(initialStructure);
  const [assignedRules, setAssignedRules] = useState(MOCK_SALARY_RULES);

  const handleRemoveRule = (ruleId) => {
    setAssignedRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payroll/structures")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Back to Salary Structures"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Salary Structures</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">{structure.code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{structure.name}</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/payroll/rules")}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Manage All Salary Rules</span>
        </button>
      </div>

      {/* Structure Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-xs bg-purple-50 px-2 py-0.5 text-xs font-mono font-bold text-purple-700 border border-purple-200">
                Code: {structure.code}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{structure.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 font-bold text-purple-700 border border-purple-200">
              <Users className="h-3.5 w-3.5" />
              {structure.employee_count} Active Employees Assigned
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{structure.description}</p>
      </div>

      {/* Assigned Salary Rules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Computation Rules Sequence</h3>
            <p className="text-xs text-slate-500">Rules are executed strictly in order of sequence index to form gross and net payroll figures.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5 w-16">Seq</th>
                  <th scope="col" className="px-5 py-3.5">Rule Name & Code</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="px-5 py-3.5">Calculation Method</th>
                  <th scope="col" className="px-5 py-3.5">Amount / Rate</th>
                  <th scope="col" className="px-5 py-3.5">Formula Definition</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assignedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-purple-50/50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-purple-700 text-xs">{rule.sequence}</td>
                    
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {rule.name}
                      <span className="block font-mono text-[10px] font-normal text-slate-500">{rule.code}</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          rule.category === "Allowance"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {rule.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700 text-xs font-medium whitespace-nowrap">
                      {rule.calculation_method}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {rule.amount || rule.percentage || "Dynamic"}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-purple-700 whitespace-nowrap">
                      {rule.formula}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Remove Rule from Structure"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
