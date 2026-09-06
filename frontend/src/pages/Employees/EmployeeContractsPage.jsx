import { useState, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import contractService from "../../services/contractService";
import employeeService from "../../services/employeeService";

export default function EmployeeContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [deletingContractId, setDeletingContractId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employee_id: "",
    job_position: "",
    wage: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cntData, empData] = await Promise.all([
        contractService.getAll().catch(() => []),
        employeeService.getAll().catch(() => []),
      ]);
      setContracts(Array.isArray(cntData) ? cntData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.error("Failed to load contracts or employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp;
    });
    return map;
  }, [employees]);

  const handleOpenCreateModal = () => {
    setEditingContract(null);
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : "",
      job_position: "Software Developer",
      wage: "80000",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cnt) => {
    setEditingContract(cnt);
    setFormData({
      employee_id: cnt.employee_id || "",
      job_position: cnt.job_position || "",
      wage: cnt.wage || "",
      start_date: cnt.start_date || "",
      end_date: cnt.end_date || "",
      status: cnt.status || "Active",
    });
    setIsModalOpen(true);
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.job_position) return;

    try {
      const payload = {
        employee_id: Number(formData.employee_id),
        job_position: formData.job_position,
        wage: Number(formData.wage || 0),
        start_date: formData.start_date,
        end_date: formData.end_date ? formData.end_date : null,
        status: formData.status,
      };

      if (editingContract) {
        await contractService.update(editingContract.id, payload);
      } else {
        await contractService.create(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to save contract:", err);
    }
  };

  const handleDeleteContract = async (id) => {
    try {
      await contractService.delete(id);
      setDeletingContractId(null);
      await loadData();
    } catch (err) {
      console.error("Failed to delete contract:", err);
    }
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter === "active" && c.status !== "Active") return false;
      if (statusFilter === "expiring" && c.status !== "Expiring") return false;
      if (statusFilter === "expired" && c.status !== "Expired") return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const emp = employeeMap[c.employee_id];
      const empName = emp ? `${emp.first_name} ${emp.last_name}` : "";
      return (
        (c.job_position && c.job_position.toLowerCase().includes(term)) ||
        empName.toLowerCase().includes(term) ||
        (c.status && c.status.toLowerCase().includes(term))
      );
    });
  }, [contracts, searchTerm, statusFilter, employeeMap]);

  const activeCount = contracts.filter((c) => c.status === "Active" || c.is_active).length;
  const expiringCount = contracts.filter((c) => c.status === "Expiring").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "Expiring":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Expiring
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Contracts</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredContracts.length} Contracts
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Total Contracts</span>
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{contracts.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Registered employee agreements</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Active Contracts</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Active operational compliance</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Expiring Soon</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{expiringCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires renewal review</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Avg Base Wage</span>
            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{contracts.length > 0 ? Math.round(contracts.reduce((acc, c) => acc + Number(c.wage || 0), 0) / contracts.length).toLocaleString("en-IN") : 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Basic wage benchmark</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by position, employee name, status..."
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({contracts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
        </div>
      </div>

      {/* Contract Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-[#211D20] rounded-xl border border-slate-200 dark:border-[#40383D]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#211D20] rounded-xl border border-slate-200 dark:border-[#40383D]">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No contracts found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create a contract for an employee to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#40383D]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Contract / ID</th>
                  <th scope="col" className="px-6 py-3.5">Employee</th>
                  <th scope="col" className="px-6 py-3.5">Position</th>
                  <th scope="col" className="px-6 py-3.5">Start Date</th>
                  <th scope="col" className="px-6 py-3.5">End Date</th>
                  <th scope="col" className="px-6 py-3.5">Wage</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#40383D] bg-white dark:bg-[#211D20]">
                {filteredContracts.map((cnt) => {
                  const emp = employeeMap[cnt.employee_id];
                  const empName = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${cnt.employee_id}`;
                  const empCode = emp?.employee_code || `EMP-${cnt.employee_id}`;

                  return (
                    <tr key={cnt.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group cursor-pointer" onClick={() => setViewingContract(cnt)}>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                              {cnt.job_position} Agreement
                            </div>
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">CNT-{cnt.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-900 dark:text-white whitespace-nowrap font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <div>
                            <span>{empName}</span>
                            <span className="block text-xs font-mono text-slate-400">{empCode}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          <Tag className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          {cnt.job_position || "Standard Position"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {cnt.start_date ? new Date(cnt.start_date).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {cnt.end_date ? new Date(cnt.end_date).toLocaleDateString() : "Ongoing"}
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        ₹{Number(cnt.wage || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cnt.status || (cnt.is_active ? "Active" : "Inactive"))}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingContract(cnt)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                            title="View Contract Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cnt)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                            title="Edit Contract"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingContractId(cnt.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Delete Contract"
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
        </div>
      )}

      {/* Modal for Add / Edit Contract */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingContract ? "Edit Employee Contract" : "Create New Employee Contract"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Employee *</label>
                  <select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Job Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.job_position}
                    onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                    placeholder="e.g. Senior Software Developer"
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Wage / Salary *</label>
                  <input
                    type="number"
                    required
                    value={formData.wage}
                    onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                    placeholder="80000"
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
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
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingContract.job_position} Agreement</h3>
              <button onClick={() => setViewingContract(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white">Employee:</strong> {employeeMap[viewingContract.employee_id]?.first_name}{" "}
                {employeeMap[viewingContract.employee_id]?.last_name} ({employeeMap[viewingContract.employee_id]?.employee_code || viewingContract.employee_id})
              </p>
              <p><strong className="text-slate-900 dark:text-white">Position:</strong> {viewingContract.job_position}</p>
              <p><strong className="text-slate-900 dark:text-white">Period:</strong> {viewingContract.start_date} → {viewingContract.end_date || "Ongoing"}</p>
              <p>
                <strong className="text-slate-900 dark:text-white">Wage:</strong> <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{Number(viewingContract.wage || 0).toLocaleString("en-IN")}</span>
              </p>
              <p><strong className="text-slate-900 dark:text-white">Status:</strong> {viewingContract.status || (viewingContract.is_active ? "Active" : "Inactive")}</p>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-[#40383D] mt-4">
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to delete this contract? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingContractId(null)}
                className="rounded-lg border border-slate-300 dark:border-[#40383D] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
