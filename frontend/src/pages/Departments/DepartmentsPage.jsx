import { useState, useMemo, useEffect } from "react";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDeptId, setDeletingDeptId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const fetchDepartmentsData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll().catch(() => []),
      ]);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setEmployees(Array.isArray(empRes) ? empRes : []);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  // Map employee count per department using real Employee.department_id relationship
  const deptEmployeesMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, []));

    employees.forEach((emp) => {
      if (emp.department_id && map.has(emp.department_id)) {
        map.get(emp.department_id).push(emp);
      } else if (emp.department_name) {
        const foundDept = departments.find(
          (d) => d.name.toLowerCase() === emp.department_name.toLowerCase()
        );
        if (foundDept && map.has(foundDept.id)) {
          map.get(foundDept.id).push(emp);
        }
      }
    });

    return map;
  }, [departments, employees]);

  // Helper to determine Department Manager based on real employee records
  const getDepartmentManager = (dept) => {
    const deptEmps = deptEmployeesMap.get(dept.id) || [];
    
    // Check if any employee in department is referenced as a manager by others
    const managerIdInDept = deptEmps.find((e) => e.manager_id)?.manager_id;
    if (managerIdInDept) {
      const managerObj = employees.find((e) => e.id === managerIdInDept);
      if (managerObj) {
        return `${managerObj.first_name} ${managerObj.last_name}`;
      }
    }

    // Check if any employee in this department has a manager job position
    const managerPosEmp = deptEmps.find((e) => {
      const pos = (e.job_position || "").toLowerCase();
      return (
        pos.includes("manager") ||
        pos.includes("lead") ||
        pos.includes("head") ||
        pos.includes("director")
      );
    });

    if (managerPosEmp) {
      return `${managerPosEmp.first_name} ${managerPosEmp.last_name}`;
    }

    return "No manager assigned";
  };

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: "",
      code: `DEP-${Math.floor(Math.random() * 900) + 100}`,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name || "",
      code: dept.code || `DEP-${dept.id}`,
      description: dept.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingDepartment) {
        await departmentService.update(editingDepartment.id, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        await departmentService.create({
          name: formData.name,
          description: formData.description,
        });
      }
      setIsModalOpen(false);
      await fetchDepartmentsData();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to save department.");
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await departmentService.delete(id);
      setDeletingDeptId(null);
      await fetchDepartmentsData();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || "Failed to delete department.");
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const mgrName = getDepartmentManager(d).toLowerCase();
      const code = (d.code || `DEP-${d.id}`).toLowerCase();
      const desc = (d.description || "").toLowerCase();
      return (
        d.name.toLowerCase().includes(term) ||
        code.includes(term) ||
        mgrName.includes(term) ||
        desc.includes(term)
      );
    });
  }, [departments, deptEmployeesMap, searchTerm]);

  // Total workforce count across the organization (from real backend employee data)
  const totalWorkforce = employees.length;
  const activeDeptCount = departments.filter((d) => d.is_active !== false).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 text-center text-xs">
        <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Failed to Load Departments</h3>
        <p className="text-rose-700 dark:text-rose-300 mt-1">{errorMsg}</p>
        <button
          onClick={fetchDepartmentsData}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              {filteredDepartments.length} Departments
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Departments</span>
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{departments.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Active business units</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Workforce</span>
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalWorkforce} Employees</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Distributed across departments</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {departments.length > 0 ? `${Math.round((activeDeptCount / departments.length) * 100)}% Active` : "100% Active"}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {activeDeptCount} of {departments.length} operational
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search department by name, code, manager..."
          className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((dept) => {
          const deptEmps = deptEmployeesMap.get(dept.id) || [];
          const teamSize = deptEmps.length;
          const managerName = getDepartmentManager(dept);
          const deptCode = dept.code || `DEP-${String(dept.id).padStart(3, "0")}`;

          return (
            <div
              key={dept.id}
              className="group rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition leading-snug">
                        {dept.name}
                      </h3>
                      <span className="inline-block rounded-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mt-0.5">
                        {deptCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(dept)}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDeptId(dept.id)}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {dept.description || "No description provided."}
                </p>

                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <UserCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      Manager:
                    </span>
                    <span className={`font-bold ${managerName === "No manager assigned" ? "text-slate-400 dark:text-slate-500 italic font-normal" : "text-slate-900 dark:text-white"}`}>
                      {managerName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Team Size:
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 font-mono">
                      {teamSize} {teamSize === 1 ? "Employee" : "Employees"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${dept.is_active !== false ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${dept.is_active !== false ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {dept.is_active !== false ? "Active Department" : "Inactive Department"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingDepartment ? "Edit Department" : "Create New Department"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of department functions and team mandate..."
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 cursor-pointer"
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
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Department</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Are you sure you want to delete this department?</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingDeptId(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDepartment(deletingDeptId)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
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
