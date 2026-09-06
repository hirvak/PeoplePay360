import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import salaryService from "../../services/salaryService";
import contractService from "../../services/contractService";

export default function SalaryStructureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [structure, setStructure] = useState(location.state?.structure || null);
  const [assignedRules, setAssignedRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [structData, allRules, allContracts] = await Promise.all([
        salaryService.getStructureById(id).catch(() => null),
        salaryService.getAllRules().catch(() => []),
        contractService.getAll().catch(() => []),
      ]);

      let currentStruct = structData;
      if (!currentStruct && location.state?.structure) {
        currentStruct = location.state.structure;
      }

      const structContracts = (allContracts || []).filter((c) => Number(c.salary_structure_id) === Number(id));
      const assignedEmpIds = new Set(structContracts.map((c) => c.employee_id).filter(Boolean));

      if (currentStruct) {
        setStructure({
          ...currentStruct,
          employee_count: assignedEmpIds.size,
        });
      } else {
        setStructure({
          id,
          code: `STRUC-${id}`,
          name: "Salary Structure",
          description: "Standard payroll rule compilation structure.",
          employee_count: assignedEmpIds.size,
        });
      }

      const filteredRules = (allRules || [])
        .filter((r) => Number(r.salary_structure_id) === Number(id) && r.is_active !== false)
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      setAssignedRules(filteredRules);
    } catch (err) {
      console.error("Failed to load salary structure detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRemoveRule = async (ruleId) => {
    try {
      await salaryService.deleteRule(ruleId);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to remove rule.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payroll/structures")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Back to Salary Structures"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Salary Structures</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{structure?.code || `STRUC-${id}`}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{structure?.name || "Salary Structure Detail"}</h1>
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
      <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#40383D] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-xs bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Code: {structure?.code || `STRUC-${id}`}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{structure?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/50 px-3 py-1 font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Users className="h-3.5 w-3.5" />
              {structure?.employee_count || 0} Active Employees Assigned
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{structure?.description || "No description provided."}</p>
      </div>

      {/* Assigned Salary Rules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Computation Rules Sequence</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rules are executed strictly in order of sequence index to form gross and net payroll figures.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#40383D]">
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
              <tbody className="divide-y divide-slate-200 dark:divide-[#40383D] bg-white dark:bg-[#211D20]">
                {assignedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition">
                    <td className="px-5 py-4 font-mono font-bold text-purple-700 dark:text-purple-400 text-xs">{rule.sequence || rule.id}</td>
                    
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {rule.name}
                      <span className="block font-mono text-[10px] font-normal text-slate-500 dark:text-slate-400">{rule.code}</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          rule.category === "Allowance" || rule.category === "EARNING"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {rule.category === "EARNING" ? "Allowance" : rule.category === "DEDUCTION" ? "Deduction" : rule.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap">
                      {rule.calculation_method || (rule.amount ? "FIXED" : "PERCENTAGE")}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {rule.amount ? `₹${rule.amount}` : rule.percentage ? `${rule.percentage}%` : "Dynamic"}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-purple-700 dark:text-purple-400 whitespace-nowrap">
                      {rule.formula || rule.code}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
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
