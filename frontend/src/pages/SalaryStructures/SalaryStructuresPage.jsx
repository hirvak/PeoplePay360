import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Edit3,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import salaryService from "../../services/salaryService";
import contractService from "../../services/contractService";

export default function SalaryStructuresPage() {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [deletingStructId, setDeletingStructId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const fetchStructures = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [structsData, rulesData, contractsData] = await Promise.all([
        salaryService.getAllStructures(),
        salaryService.getAllRules().catch(() => []),
        contractService.getAll().catch(() => []),
      ]);

      const activeRules = (rulesData || []).filter((r) => r.is_active !== false);
      const activeContracts = contractsData || [];

      const enriched = (structsData || []).map((s) => {
        const sRules = activeRules.filter((r) => r.salary_structure_id === s.id);
        const sContracts = activeContracts.filter((c) => c.salary_structure_id === s.id);
        const assignedEmpIds = new Set(sContracts.map((c) => c.employee_id).filter(Boolean));
        return {
          ...s,
          rule_count: sRules.length,
          employee_count: assignedEmpIds.size,
        };
      });

      setStructures(enriched);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load salary structures.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingStructure(null);
    setFormData({
      name: "",
      code: `STR-00${structures.length + 1}`,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (struct) => {
    setEditingStructure(struct);
    setFormData({
      name: struct.name || "",
      code: struct.code || "",
      description: struct.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingStructure) {
        await salaryService.updateStructure(editingStructure.id, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
        });
      } else {
        await salaryService.createStructure({
          name: formData.name,
          code: formData.code,
          description: formData.description,
        });
      }
      setIsModalOpen(false);
      await fetchStructures();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to save salary structure.");
    }
  };

  const handleDeleteStructure = async (id) => {
    try {
      await salaryService.deleteStructure(id);
      setDeletingStructId(null);
      await fetchStructures();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to delete structure.");
    }
  };


  const filteredStructures = useMemo(() => {
    return structures.filter((s) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    });
  }, [structures, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Salary Structures</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredStructures.length} Structures
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define salary computation structures, allowance rules, and statutory deduction models.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Salary Structure</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search structures by name, code..."
          className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Loading / Error / Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{errorMsg}</p>
          <button
            type="button"
            onClick={fetchStructures}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-12 text-center">
          <Layers className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No salary structures found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm ? "No structures match your search criteria." : "Create your first salary structure to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStructures.map((struct) => (
            <div
              key={struct.id}
              onClick={() => navigate(`/payroll/structures/${struct.id}`, { state: { structure: struct } })}
              className="group rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition leading-snug">
                        {struct.name}
                      </h3>
                      <span className="inline-block rounded-xs bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mt-0.5">
                        {struct.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(struct)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                      title="Edit Structure"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStructId(struct.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete Structure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {struct.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-[#40383D] pt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800">
                  <Users className="h-3.5 w-3.5" />
                  {struct.employee_count || 0} Employee{struct.employee_count === 1 ? "" : "s"} Assigned
                </span>

                <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 flex items-center gap-1">
                  View Rules ({struct.rule_count !== undefined ? struct.rule_count : 0})
                  <Eye className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Structure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStructure ? "Edit Salary Structure" : "Create Salary Structure"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Structure Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Regular Full-Time Salary Structure"
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Structure Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. REG_FT"
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of salary rules included in this structure..."
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
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deletingStructId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Structure</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to delete this salary structure?</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingStructId(null)}
                className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStructure(deletingStructId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Structure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
