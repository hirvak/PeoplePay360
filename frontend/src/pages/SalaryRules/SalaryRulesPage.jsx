import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Edit3,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Layers,
  Tag,
  Code,
  Loader2,
} from "lucide-react";
import salaryService from "../../services/salaryService";

export default function SalaryRulesPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRuleId, setDeletingRuleId] = useState(null);

  const [formData, setFormData] = useState({
    salary_structure_id: 1,
    name: "",
    code: "",
    rule_type: "FIXED",
    category: "EARNING",
    sequence: 1,
    amount: "200.00",
    percentage: "",
    formula: "",
    description: "",
  });

  const fetchRulesAndStructures = async () => {
    try {
      setLoading(true);
      const [rulesData, structData] = await Promise.all([
        salaryService.getAllRules().catch(() => []),
        salaryService.getAllStructures().catch(() => []),
      ]);
      const activeRules = (rulesData || []).filter((r) => r.is_active !== false);
      setRules(activeRules);
      setStructures(structData || []);
    } catch (err) {
      console.error("Failed to load rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndStructures();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      salary_structure_id: structures[0]?.id || 1,
      name: "",
      code: `R-00${rules.length + 1}`,
      rule_type: "Fixed",
      category: "EARNING",
      sequence: rules.length + 1,
      amount: "5000.00",
      percentage: "",
      formula: "",
      base_code: "BASIC",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      salary_structure_id: rule.salary_structure_id || structures[0]?.id || 1,
      name: rule.name || "",
      code: rule.code || "",
      rule_type: rule.rule_type || "Fixed",
      category: rule.category || "EARNING",
      sequence: rule.sequence || 1,
      amount: rule.amount !== null && rule.amount !== undefined ? String(rule.amount) : "",
      percentage: rule.percentage !== null && rule.percentage !== undefined ? String(rule.percentage) : "",
      formula: rule.formula || "",
      base_code: rule.base_code || "BASIC",
      description: rule.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    try {
      const payload = {
        salary_structure_id: Number(formData.salary_structure_id),
        name: formData.name,
        code: formData.code,
        sequence: Number(formData.sequence || 1),
        rule_type: formData.rule_type,
        category: formData.category,
        amount: formData.amount ? Number(formData.amount) : null,
        percentage: formData.percentage ? Number(formData.percentage) : null,
        formula: formData.formula || null,
        base_code: formData.base_code || (formData.rule_type === "Percentage" ? "BASIC" : null),
      };

      if (editingRule) {
        await salaryService.updateRule(editingRule.id, payload);
      } else {
        await salaryService.createRule(payload);
      }
      setIsModalOpen(false);
      await fetchRulesAndStructures();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to save salary rule.");
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await salaryService.deleteRule(id);
      setDeletingRuleId(null);
      await fetchRulesAndStructures();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to delete rule.");
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const isAllowance = r.category === "EARNING" || r.category === "Allowance";
      const isDeduction = r.category === "DEDUCTION" || r.category === "Deduction";

      if (categoryFilter === "allowance" && !isAllowance) return false;
      if (categoryFilter === "deduction" && !isDeduction) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (r.name && r.name.toLowerCase().includes(term)) ||
        (r.code && r.code.toLowerCase().includes(term)) ||
        (r.rule_type && r.rule_type.toLowerCase().includes(term))
      );
    });
  }, [rules, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Salary Rules</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredRules.length} Rules
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure calculation formulas, allowance logic, and tax deduction rules used in payroll computation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Salary Rule</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by name, code, calculation method..."
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Categories ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("allowance")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "allowance" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Allowances
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("deduction")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "deduction" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Deductions
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#40383D]">
              <tr>
                <th scope="col" className="px-5 py-3.5 w-16">Seq</th>
                <th scope="col" className="px-5 py-3.5">Rule Name & Code</th>
                <th scope="col" className="px-5 py-3.5">Category</th>
                <th scope="col" className="px-5 py-3.5">Calculation Method</th>
                <th scope="col" className="px-5 py-3.5">Amount / Percentage</th>
                <th scope="col" className="px-5 py-3.5">Formula</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#40383D] bg-white dark:bg-[#211D20]">
              {filteredRules.map((rule) => {
                const isAllowance = rule.category === "EARNING" || rule.category === "Allowance";
                return (
                <tr
                  key={rule.id}
                  onClick={() => navigate(`/payroll/rules/${rule.id}`, { state: { rule } })}
                  className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition cursor-pointer group"
                >
                  <td className="px-5 py-4 font-mono font-bold text-purple-700 dark:text-purple-400 text-xs">{rule.sequence}</td>
                  
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    <span className="group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">{rule.name}</span>
                    <span className="block font-mono text-[10px] font-normal text-slate-500 dark:text-slate-400">{rule.code}</span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                        isAllowance
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {isAllowance ? "Allowance" : "Deduction"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap">
                    {rule.rule_type || rule.calculation_method || "FIXED"}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {rule.amount ? `₹${rule.amount}` : rule.percentage ? `${rule.percentage}%` : "Dynamic"}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-purple-700 dark:text-purple-400 whitespace-nowrap">
                    {rule.formula}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/rules/${rule.id}`, { state: { rule } })}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        title="View / Edit Rule Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRuleId(rule.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Salary Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingRule ? "Edit Salary Rule" : "Create Salary Rule"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Target Salary Structure *</label>
                <select
                  required
                  value={formData.salary_structure_id}
                  onChange={(e) => setFormData({ ...formData, salary_structure_id: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. House Rent Allowance (HRA)"
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Rule Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. HRA"
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white font-mono focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="EARNING">Allowance (Earning)</option>
                    <option value="DEDUCTION">Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Calculation Method</label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Formula">Formula</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Sequence Index</label>
                  <input
                    type="number"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {formData.rule_type === "Fixed" && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Fixed Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 5000.00"
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              )}

              {formData.rule_type === "Percentage" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Percentage (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      placeholder="e.g. 20.00"
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Base Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.base_code}
                      onChange={(e) => setFormData({ ...formData, base_code: e.target.value.toUpperCase() })}
                      placeholder="e.g. BASIC"
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm font-mono text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {formData.rule_type === "Formula" && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Formula Expression *</label>
                  <input
                    type="text"
                    required
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    placeholder="e.g. BASIC * 0.40"
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm font-mono text-purple-700 dark:text-purple-300 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rule description and calculation policy notes..."
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#40383D]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  Save Salary Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingRuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Salary Rule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to delete this salary rule? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingRuleId(null)}
                className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRule(deletingRuleId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
