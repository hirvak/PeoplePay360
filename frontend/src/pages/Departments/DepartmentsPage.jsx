import { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  UserCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

// Starter mock dataset for Departments
const STARTER_DEPARTMENTS = [
  {
    id: 1,
    code: "DEP-ENG",
    name: "Engineering",
    manager_name: "John Smith",
    employee_count: 12,
    status: "Active",
    description: "Software engineering, product development, infrastructure, and technical architecture.",
  },
  {
    id: 2,
    code: "DEP-HR",
    name: "Human Resources",
    manager_name: "Sarah Johnson",
    employee_count: 5,
    status: "Active",
    description: "Talent acquisition, employee relations, payroll compliance, and HR strategy.",
  },
  {
    id: 3,
    code: "DEP-FIN",
    name: "Finance & Payroll",
    manager_name: "Michael Brown",
    employee_count: 8,
    status: "Active",
    description: "Financial reporting, payroll processing, budget allocation, and tax accounting.",
  },
  {
    id: 4,
    code: "DEP-SLS",
    name: "Sales & Marketing",
    manager_name: "Executive Leadership",
    employee_count: 15,
    status: "Active",
    description: "Enterprise sales, digital marketing, business development, and client acquisition.",
  },
  {
    id: 5,
    code: "DEP-OPS",
    name: "Operations",
    manager_name: "Executive Leadership",
    employee_count: 6,
    status: "Active",
    description: "Internal business operations, office administration, vendor management, and logistics.",
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(STARTER_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDeptId, setDeletingDeptId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    manager_name: "John Smith",
    employee_count: 1,
    status: "Active",
    description: "",
  });

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: "",
      code: `DEP-00${departments.length + 1}`,
      manager_name: "John Smith",
      employee_count: 1,
      status: "Active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDepartment(dept);
    setFormData({ ...dept });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingDepartment) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDepartment.id ? { ...formData, id: editingDepartment.id } : d))
      );
    } else {
      const newDept = {
        ...formData,
        id: Date.now(),
      };
      setDepartments((prev) => [newDept, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteDepartment = (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setDeletingDeptId(null);
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term) ||
        d.manager_name.toLowerCase().includes(term)
      );
    });
  }, [departments, searchTerm]);

  const totalEmployees = departments.reduce((acc, d) => acc + (d.employee_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Departments</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredDepartments.length} Departments
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage organization departments, departmental managers, and team headcounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Departments</span>
            <Building2 className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active business units</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalEmployees} Employees</p>
          <p className="text-[11px] text-slate-500 mt-1">Distributed across departments</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Department Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">100% Active</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">All departments fully operational</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search department by name, code, manager..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-purple-300 hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition leading-snug">
                      {dept.name}
                    </h3>
                    <span className="inline-block rounded-xs bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 border border-slate-200 mt-0.5">
                      {dept.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(dept)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingDeptId(dept.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {dept.description || "No description provided."}
              </p>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                    Manager:
                  </span>
                  <span className="font-bold text-slate-900">{dept.manager_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    Team Size:
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                    {dept.employee_count} Employees
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Department
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDepartment ? "Edit Department" : "Create New Department"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Department Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. DEP-ENG"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Department Manager</label>
                  <select
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="John Smith">John Smith (Senior Software Developer)</option>
                    <option value="Sarah Johnson">Sarah Johnson (HR Manager)</option>
                    <option value="Michael Brown">Michael Brown (Finance Manager)</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of department functions and team mandate..."
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDeptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Delete Department</h3>
            <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this department? Employees will be unassigned.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingDeptId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDepartment(deletingDeptId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
