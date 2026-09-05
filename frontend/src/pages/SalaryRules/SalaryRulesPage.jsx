import { useState, useMemo } from "react";
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
} from "lucide-react";
import { MOCK_SALARY_RULES, MOCK_SALARY_STRUCTURES } from "../../data/payrollData";

export default function SalaryRulesPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState(MOCK_SALARY_RULES);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRuleId, setDeletingRuleId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Allowance",
    sequence: 1,
    calculation_method: "Fixed Amount",
    amount: "$200.00",
    percentage: "",
    formula: "Fixed Rate",
    status: "Active",
    description: "",
  });

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      code: `R-00${rules.length + 1}`,
      category: "Allowance",
      sequence: rules.length + 1,
      calculation_method: "Fixed Amount",
      amount: "$200.00",
      percentage: "",
      formula: "Fixed Rate",
      status: "Active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setIsModalOpen(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingRule) {
      setRules((prev) =>
        prev.map((r) => (r.id === editingRule.id ? { ...formData, id: editingRule.id } : r))
      );
    } else {
      const newRule = {
        ...formData,
        id: `R-00${rules.length + 1}`,
      };
      setRules((prev) => [...prev, newRule]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDeletingRuleId(null);
  };

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (categoryFilter !== "all" && r.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        r.calculation_method.toLowerCase().includes(term)
      );
    });
  }, [rules, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Salary Rules</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredRules.length} Rules
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by name, code, calculation method..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Categories ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("allowance")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "allowance" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Allowances
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("deduction")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoryFilter === "deduction" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Deductions
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  onClick={() => navigate(`/payroll/rules/${rule.id}`, { state: { rule } })}
                  className="hover:bg-purple-50/50 transition cursor-pointer group"
                >
                  <td className="px-5 py-4 font-mono font-bold text-purple-700 text-xs">{rule.sequence}</td>
                  
                  <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                    <span className="group-hover:text-purple-700 transition">{rule.name}</span>
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

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/rules/${rule.id}`, { state: { rule } })}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                        title="View / Edit Rule Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRuleId(rule.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Salary Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRule ? "Edit Salary Rule" : "Create Salary Rule"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. House Rent Allowance (HRA)"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Rule Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. HRA"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm font-mono focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="Allowance">Allowance</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Calculation Method</label>
                  <select
                    value={formData.calculation_method}
                    onChange={(e) => setFormData({ ...formData, calculation_method: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Formula">Formula</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Sequence Index</label>
                  <input
                    type="number"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Formula / Calculation Expression</label>
                <input
                  type="text"
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  placeholder="e.g. BASIC * 0.40"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm font-mono text-purple-700 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rule description and calculation policy notes..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Delete Salary Rule</h3>
            <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this salary rule? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingRuleId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
