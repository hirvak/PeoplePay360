import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { UserPlus, Search, LayoutGrid, ListFilter } from "lucide-react";
import EmployeeKanban from "../../components/employees/EmployeeKanban";
import EmployeeList from "../../components/employees/EmployeeList";
import EmployeeModal from "../../components/employees/EmployeeModal";

// Initial mock dataset matching user specification
const STARTER_EMPLOYEES = [
  {
    id: 1,
    employee_code: "EMP-001",
    first_name: "John",
    last_name: "Smith",
    user_email: "john.smith@peoplepay360.com",
    user_role: "Developer",
    department_name: "Engineering",
    schedule_name: "Standard 40 Hours/Week",
    manager_name: "Sarah Johnson",
    job_position: "Senior Software Developer",
    employment_status: "Full-Time",
    is_active: true,
  },
  {
    id: 2,
    employee_code: "EMP-002",
    first_name: "Sarah",
    last_name: "Johnson",
    user_email: "sarah.johnson@peoplepay360.com",
    user_role: "HR Manager",
    department_name: "Human Resources",
    schedule_name: "Standard 40 Hours/Week",
    manager_name: "Executive Leadership",
    job_position: "HR Manager",
    employment_status: "Full-Time",
    is_active: true,
  },
  {
    id: 3,
    employee_code: "EMP-003",
    first_name: "Michael",
    last_name: "Brown",
    user_email: "michael.brown@peoplepay360.com",
    user_role: "Finance Lead",
    department_name: "Finance & Payroll",
    schedule_name: "Standard 40 Hours/Week",
    manager_name: "Sarah Johnson",
    job_position: "Finance Manager",
    employment_status: "Full-Time",
    is_active: true,
  },
];

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState(STARTER_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (savedEmp) => {
    setEmployees((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.some((e) => e.id === savedEmp.id);
      if (exists) {
        return list.map((e) => (e.id === savedEmp.id ? savedEmp : e));
      } else {
        return [savedEmp, ...list];
      }
    });
  };

  // Filter employees locally with defensive checks
  const filteredEmployees = useMemo(() => {
    const list = Array.isArray(employees) ? employees : [];
    return list.filter((emp) => {
      if (statusFilter === "active" && !emp.is_active) return false;
      if (statusFilter === "inactive" && emp.is_active) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const code = (emp.employee_code || "").toLowerCase();
      const email = (emp.user_email || "").toLowerCase();
      const pos = (emp.job_position || "").toLowerCase();
      const dept = (emp.department_name || "").toLowerCase();

      return (
        fullName.includes(term) ||
        code.includes(term) ||
        email.includes(term) ||
        pos.includes(term) ||
        dept.includes(term)
      );
    });
  }, [employees, searchTerm, statusFilter]);

  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.is_active).length;
  const inactiveCount = employees.filter((e) => !e.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employees</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredEmployees.length} {statusFilter !== "all" ? `${statusFilter}` : ""} Employees
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's employees, roles, and profiles.
          </p>
        </div>

        {/* Purple "+ New Employee" Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800 transition shadow-xs cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Employee</span>
        </button>
      </div>

      {/* Controls Bar: Search Input, Status Filter Tabs & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, department, position..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs (All / Active / Inactive) */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-slate-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          {/* View Switcher (Kanban / List) */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "kanban" ? (
        <EmployeeKanban employees={filteredEmployees} onEdit={handleOpenEditModal} />
      ) : (
        <EmployeeList employees={filteredEmployees} onEdit={handleOpenEditModal} />
      )}

      {/* Reusable Modal for New Employee / Edit Employee */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />
    </div>
  );
}
