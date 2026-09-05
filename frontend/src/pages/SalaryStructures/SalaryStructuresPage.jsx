import { useState, useMemo } from "react";
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
} from "lucide-react";
import { MOCK_SALARY_STRUCTURES } from "../../data/payrollData";

export default function SalaryStructuresPage() {
  const navigate = useNavigate();
  const [structures, setStructures] = useState(MOCK_SALARY_STRUCTURES);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [deletingStructId, setDeletingStructId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "Active",
    description: "",
  });

  const handleOpenCreateModal = () => {
    setEditingStructure(null);
    setFormData({
      name: "",
      code: `STR-00${structures.length + 1}`,
      status: "Active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (struct) => {
    setEditingStructure(struct);
    setFormData({ ...struct });
    setIsModalOpen(true);
  };

  const handleSaveStructure = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStructure) {
      setStructures((prev) =>
        prev.map((s) => (s.id === editingStructure.id ? { ...formData, id: editingStructure.id } : s))
      );
    } else {
      const newStruct = {
        ...formData,
        id: `STR-00${structures.length + 1}`,
        employee_count: 0,
        rules: ["R-001", "R-002", "R-003", "R-007"],
      };
      setStructures((prev) => [newStruct, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteStructure = (id) => {
    setStructures((prev) => prev.filter((s) => s.id !== id));
    setDeletingStructId(null);
  };

  const filteredStructures = useMemo(() => {
    return structures.filter((s) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
      );
    });
  }, [structures, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Salary Structures</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredStructures.length} Structures
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search structures by name, code..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Structures Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStructures.map((struct) => (
          <div
            key={struct.id}
            onClick={() => navigate(`/payroll/structures/${struct.id}`, { state: { structure: struct } })}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-purple-300 hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition leading-snug">
                      {struct.name}
                    </h3>
                    <span className="inline-block rounded-xs bg-purple-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-purple-700 border border-purple-200 mt-0.5">
                      {struct.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(struct)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                    title="Edit Structure"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingStructId(struct.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Structure"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {struct.description}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                <Users className="h-3.5 w-3.5" />
                {struct.employee_count} Employees Assigned
              </span>

              <span className="font-semibold text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
                View Rules ({struct.rules?.length || 5})
                <Eye className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Structure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStructure ? "Edit Salary Structure" : "Create Salary Structure"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Structure Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Regular Full-Time Salary Structure"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Structure Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. REG_FT"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of salary rules included in this structure..."
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Delete Structure</h3>
            <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this salary structure?</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingStructId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
