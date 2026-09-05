import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  X,
  Users,
} from "lucide-react";

// Starter mock contracts for Employees -> Contracts
const STARTER_EMPLOYEE_CONTRACTS = [
  {
    id: "CNT-001",
    name: "Senior Developer Employment Agreement",
    employee_name: "John Smith",
    employee_code: "EMP-001",
    contract_type: "Permanent / Full-Time",
    start_date: "2024-01-15",
    end_date: "",
    job_position: "Senior Software Developer",
    working_schedule: "Standard 40 Hours/Week",
    salary: "$95,000 / year",
    status: "Active",
    notes: "Full-time senior software engineering agreement including health insurance, equity options, and 20 PTO days.",
  },
  {
    id: "CNT-002",
    name: "HR Manager Employment Agreement",
    employee_name: "Sarah Johnson",
    employee_code: "EMP-002",
    contract_type: "Permanent / Full-Time",
    start_date: "2023-06-01",
    end_date: "",
    job_position: "HR Manager",
    working_schedule: "Standard 40 Hours/Week",
    salary: "$85,000 / year",
    status: "Active",
    notes: "Full-time HR management contract including executive benefits, bonus structure, and annual performance review.",
  },
  {
    id: "CNT-003",
    name: "Finance Manager Employment Agreement",
    employee_name: "Michael Brown",
    employee_code: "EMP-003",
    contract_type: "Fixed-Term",
    start_date: "2024-02-01",
    end_date: "2026-01-31",
    job_position: "Finance Manager",
    working_schedule: "Standard 40 Hours/Week",
    salary: "$70,000 / year",
    status: "Active",
    notes: "Two-year fixed-term finance lead agreement subject to annual extension upon performance evaluation.",
  },
];

export default function EmployeeContractsPage() {
  const [contracts, setContracts] = useState(STARTER_EMPLOYEE_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [deletingContractId, setDeletingContractId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    employee_name: "John Smith",
    contract_type: "Permanent / Full-Time",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    job_position: "Senior Software Developer",
    working_schedule: "Standard 40 Hours/Week",
    salary: "$80,000 / year",
    status: "Active",
    notes: "",
  });

  const handleOpenCreateModal = () => {
    setEditingContract(null);
    setFormData({
      name: "",
      employee_name: "John Smith",
      contract_type: "Permanent / Full-Time",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      job_position: "Senior Software Developer",
      working_schedule: "Standard 40 Hours/Week",
      salary: "$80,000 / year",
      status: "Active",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cnt) => {
    setEditingContract(cnt);
    setFormData({ ...cnt });
    setIsModalOpen(true);
  };

  const handleSaveContract = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employee_name.trim()) return;

    if (editingContract) {
      setContracts((prev) =>
        prev.map((c) => (c.id === editingContract.id ? { ...formData, id: editingContract.id } : c))
      );
    } else {
      const newContract = {
        ...formData,
        id: `CNT-00${contracts.length + 1}`,
        employee_code: `EMP-00${contracts.length + 1}`,
      };
      setContracts((prev) => [newContract, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteContract = (id) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    setDeletingContractId(null);
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter === "active" && c.status !== "Active") return false;
      if (statusFilter === "expiring" && c.status !== "Expiring") return false;
      if (statusFilter === "expired" && c.status !== "Expired") return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.employee_name.toLowerCase().includes(term) ||
        c.contract_type.toLowerCase().includes(term) ||
        c.job_position.toLowerCase().includes(term)
      );
    });
  }, [contracts, searchTerm, statusFilter]);

  const activeCount = contracts.filter((c) => c.status === "Active").length;
  const expiringCount = contracts.filter((c) => c.status === "Expiring").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "Expiring":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Expiring
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Contracts</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredContracts.length} Contracts
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage contracts, compensation terms, and agreement periods for employees across the organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Contract</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Contracts</span>
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{contracts.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Registered employee agreements</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Contracts</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">100% active operational compliance</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiring Soon</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{expiringCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires renewal review within 30 days</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Compensation</span>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$83,333</p>
          <p className="text-[11px] text-slate-500 mt-1">Annual basic salary benchmark</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by contract name, employee, position, type..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({contracts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("expiring")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "expiring" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Expiring ({expiringCount})
          </button>
        </div>
      </div>

      {/* Contract Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3.5">Contract</th>
                <th scope="col" className="px-6 py-3.5">Employee</th>
                <th scope="col" className="px-6 py-3.5">Contract Type</th>
                <th scope="col" className="px-6 py-3.5">Start Date</th>
                <th scope="col" className="px-6 py-3.5">End Date</th>
                <th scope="col" className="px-6 py-3.5">Salary / Compensation</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredContracts.map((cnt) => (
                <tr key={cnt.id} className="hover:bg-purple-50/50 transition group cursor-pointer" onClick={() => setViewingContract(cnt)}>
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 transition">{cnt.name}</div>
                        <div className="text-xs font-mono text-slate-500">{cnt.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-900 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{cnt.employee_name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                      <Tag className="h-3 w-3 text-purple-600" />
                      {cnt.contract_type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {cnt.start_date ? new Date(cnt.start_date).toLocaleDateString() : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {cnt.end_date ? new Date(cnt.end_date).toLocaleDateString() : "Ongoing"}
                  </td>

                  <td className="px-6 py-4 font-bold text-emerald-700 whitespace-nowrap">
                    {cnt.salary}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(cnt.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingContract(cnt)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                        title="View Contract Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cnt)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                        title="Edit Contract"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingContractId(cnt.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Contract"
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

      {/* Modal for Add / Edit Contract */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingContract ? "Edit Employee Contract" : "Create New Employee Contract"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Contract Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Senior Software Developer Agreement 2024"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Employee Name *</label>
                  <select
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="John Smith">John Smith (EMP-001)</option>
                    <option value="Sarah Johnson">Sarah Johnson (EMP-002)</option>
                    <option value="Michael Brown">Michael Brown (EMP-003)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="Permanent / Full-Time">Permanent / Full-Time</option>
                    <option value="Fixed-Term">Fixed-Term</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Salary / Compensation</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Contract Detail Modal */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{viewingContract.name}</h3>
              <button onClick={() => setViewingContract(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><strong>Employee:</strong> {viewingContract.employee_name} ({viewingContract.employee_code})</p>
              <p><strong>Type:</strong> {viewingContract.contract_type}</p>
              <p><strong>Period:</strong> {viewingContract.start_date} → {viewingContract.end_date || "Ongoing"}</p>
              <p><strong>Position:</strong> {viewingContract.job_position}</p>
              <p><strong>Working Schedule:</strong> {viewingContract.working_schedule}</p>
              <p><strong>Compensation:</strong> <span className="font-bold text-emerald-700">{viewingContract.salary}</span></p>
              <p><strong>Notes:</strong> {viewingContract.notes || "None"}</p>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setViewingContract(null)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContractId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this contract? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingContractId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContract(deletingContractId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
