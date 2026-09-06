import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserPlus,
  Search,
  LayoutGrid,
  ListFilter,
  AlertTriangle,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  SearchX,
  Loader2,
} from "lucide-react";
import EmployeeKanban from "../../components/employees/EmployeeKanban";
import EmployeeList from "../../components/employees/EmployeeList";
import EmployeeModal from "../../components/employees/EmployeeModal";
import employeeService from "../../services/employeeService";

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");

  // Popover panel state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await employeeService.getAll();
      setEmployees(data || []);
    } catch (err) {
      setIsError(true);
      setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Click outside & ESC key listeners for Filter Popover Panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setIsFilterPanelOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFilterPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Read view mode from URL query param or default to 'kanban'
  const viewMode = searchParams.get("view") === "list" ? "list" : "kanban";

  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === "list") {
        next.set("view", "list");
      } else {
        next.delete("view");
      }
      return next;
    });
  };

  // Derive unique filter dropdown options dynamically from real employee dataset
  const departmentOptions = useMemo(() => {
    const depts = new Set();
    employees.forEach((emp) => {
      if (emp.department_name) depts.add(emp.department_name);
    });
    return Array.from(depts).sort();
  }, [employees]);

  const positionOptions = useMemo(() => {
    const positions = new Set();
    employees.forEach((emp) => {
      if (emp.job_position) positions.add(emp.job_position);
    });
    return Array.from(positions).sort();
  }, [employees]);

  const managerOptions = useMemo(() => {
    const mgrs = new Set();
    employees.forEach((emp) => {
      if (emp.manager_name) mgrs.add(emp.manager_name);
    });
    return Array.from(mgrs).sort();
  }, [employees]);

  const scheduleOptions = useMemo(() => {
    const scheds = new Set();
    employees.forEach((emp) => {
      if (emp.schedule_name) scheds.add(emp.schedule_name);
    });
    return Array.from(scheds).sort();
  }, [employees]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(["Active", "Inactive"]);
    employees.forEach((emp) => {
      if (emp.employment_status) statuses.add(emp.employment_status);
    });
    return Array.from(statuses).sort();
  }, [employees]);

  // Active filter count for UI badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (departmentFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (managerFilter !== "all") count++;
    if (positionFilter !== "all") count++;
    if (scheduleFilter !== "all") count++;
    return count;
  }, [departmentFilter, statusFilter, managerFilter, positionFilter, scheduleFilter]);

  // Comprehensive multi-criteria filtering
  const filteredEmployees = useMemo(() => {
    const list = Array.isArray(employees) ? employees : [];
    return list.filter((emp) => {
      // 1. Status Filter (All / Active / Inactive / Custom Employment Status)
      if (statusFilter === "active" && (emp.is_active === false || emp.employment_status === "Inactive")) {
        return false;
      }
      if (statusFilter === "inactive" && emp.is_active !== false && emp.employment_status !== "Inactive") {
        return false;
      }
      if (statusFilter !== "all" && statusFilter !== "active" && statusFilter !== "inactive") {
        if (emp.employment_status !== statusFilter) return false;
      }

      // 2. Department Filter
      if (departmentFilter !== "all") {
        if ((emp.department_name || "") !== departmentFilter) return false;
      }

      // 3. Direct Manager Filter
      if (managerFilter !== "all") {
        if ((emp.manager_name || "") !== managerFilter) return false;
      }

      // 4. Job Position Filter
      if (positionFilter !== "all") {
        if ((emp.job_position || "") !== positionFilter) return false;
      }

      // 5. Working Schedule Filter
      if (scheduleFilter !== "all") {
        if ((emp.schedule_name || "") !== scheduleFilter) return false;
      }

      // 6. Search Term (across Name, Employee Code, Department, Position, Email, Manager)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
        const code = (emp.employee_code || "").toLowerCase();
        const email = (emp.user_email || "").toLowerCase();
        const pos = (emp.job_position || "").toLowerCase();
        const dept = (emp.department_name || "").toLowerCase();
        const mgr = (emp.manager_name || "").toLowerCase();

        const match =
          fullName.includes(term) ||
          code.includes(term) ||
          email.includes(term) ||
          pos.includes(term) ||
          dept.includes(term) ||
          mgr.includes(term);

        if (!match) return false;
      }

      return true;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter, managerFilter, positionFilter, scheduleFilter]);

  // Tab counters calculated strictly from real employee dataset
  const activeCount = employees.filter((e) => e.is_active !== false && e.employment_status !== "Inactive").length;
  const inactiveCount = employees.filter((e) => e.is_active === false || e.employment_status === "Inactive").length;
  const totalCount = employees.length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setManagerFilter("all");
    setPositionFilter("all");
    setScheduleFilter("all");
    setIsFilterPanelOpen(false);
  };

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (emp) => {
    setDeletingEmployee(emp);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await employeeService.delete(deletingEmployee.id);
      setDeletingEmployee(null);
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  };

  const handleSaveEmployee = async () => {
    await fetchEmployees();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employees</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              {filteredEmployees.length} {statusFilter !== "all" ? `${statusFilter}` : ""} Employees
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your organization's employees, roles, and profiles.
          </p>
        </div>

        {/* Purple "+ New Employee" Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition shadow-xs cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Employee</span>
        </button>
      </div>

      {/* Controls Bar: Search Input, Filter Button, Status Tabs & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input & Filter Button */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, department, position, email..."
              className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Popover Button & Panel */}
          <div className="relative shrink-0" ref={filterPanelRef}>
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                activeFilterCount > 0
                  ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:bg-[#211D20] dark:border-[#40383D] dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Panel Dropdown */}
            {isFilterPanelOpen && (
              <div className="absolute right-0 sm:left-0 top-11 z-40 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Filter Employees</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Department Filter */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Department
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                    >
                      <option value="all">All Departments</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      {statusOptions
                        .filter((st) => st !== "Active" && st !== "Inactive")
                        .map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Manager Filter */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Manager
                    </label>
                    <select
                      value={managerFilter}
                      onChange={(e) => setManagerFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                    >
                      <option value="all">All Managers</option>
                      {managerOptions.map((mgr) => (
                        <option key={mgr} value={mgr}>
                          {mgr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Position Filter */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Job Position
                    </label>
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                    >
                      <option value="all">All Job Positions</option>
                      {positionOptions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Working Schedule Filter */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                      Working Schedule
                    </label>
                    <select
                      value={scheduleFilter}
                      onChange={(e) => setScheduleFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                    >
                      <option value="all">All Schedules</option>
                      {scheduleOptions.map((sched) => (
                        <option key={sched} value={sched}>
                          {sched}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition cursor-pointer shadow-xs"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs (All / Active / Inactive) */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 dark:bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-slate-600 dark:bg-slate-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          {/* View Switcher (Kanban / List) */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-[#211D20] rounded-xl border border-slate-200 dark:border-[#40383D]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 text-sm">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-rose-600" />
          <p className="font-bold">{errorMsg || "Failed to load employees."}</p>
          <button
            type="button"
            onClick={fetchEmployees}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-12 text-center text-slate-500 dark:text-slate-400 shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No employees found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No employees match your current search or filter criteria.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        <EmployeeKanban employees={filteredEmployees} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
      ) : (
        <EmployeeList employees={filteredEmployees} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
      )}

      {/* Reusable Modal for New Employee / Edit Employee */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

      {/* Confirmation Modal for Employee Deletion */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xl text-center">
            <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete employee{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                {deletingEmployee.first_name} {deletingEmployee.last_name} ({deletingEmployee.employee_code})
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
