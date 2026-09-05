import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  LayoutDashboard,
  Check,
} from "lucide-react";

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Determine active states for parent menu items
  const isDashboardActive = pathname === "/dashboard";

  const isEmployeesActive =
    pathname === "/employees" ||
    pathname.startsWith("/employees/") ||
    pathname === "/departments" ||
    pathname === "/schedule";

  const isContractsActive = pathname === "/contracts";

  const isAttendanceActive = pathname === "/attendance";

  const isTimeOffActive = pathname.startsWith("/time-off");

  const isPayrollActive =
    pathname === "/payroll" ||
    pathname.startsWith("/payroll/") ||
    pathname === "/payslips";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left Brand Area & Desktop Navigation */}
          <div className="flex items-center gap-6" ref={dropdownRef}>
            {/* Brand Logo & Name */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-90">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600 text-white shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  PeoplePay<span className="text-purple-600">360</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                  HR & PAYROLL SUITE
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">

              {/* 1. Employees Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("employees")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isEmployeesActive
                      ? "bg-purple-50 text-purple-700 font-semibold border-b-2 border-purple-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === "employees" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "employees" && (
                  <div className="absolute left-0 mt-1.5 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                    <button
                      onClick={() => navigate("/employees")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/employees"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Employees</span>
                      {pathname === "/employees" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/employees/contracts")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/employees/contracts"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Contracts</span>
                      {pathname === "/employees/contracts" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/departments")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/departments"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Departments</span>
                      {pathname === "/departments" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/schedule")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/schedule"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Working Schedule</span>
                      {pathname === "/schedule" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Contracts (Direct Nav Item -> /contracts) */}
              <NavLink
                to="/contracts"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isContractsActive
                    ? "bg-purple-50 text-purple-700 font-semibold border-b-2 border-purple-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Contracts</span>
              </NavLink>

              {/* 4. Attendance (Direct Nav Item -> /attendance) */}
              <NavLink
                to="/attendance"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isAttendanceActive
                    ? "bg-purple-50 text-purple-700 font-semibold border-b-2 border-purple-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Attendance</span>
              </NavLink>

              {/* 5. Time Off Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("timeoff")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isTimeOffActive
                      ? "bg-purple-50 text-purple-700 font-semibold border-b-2 border-purple-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Time Off</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === "timeoff" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "timeoff" && (
                  <div className="absolute left-0 mt-1.5 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                    <button
                      onClick={() => navigate("/time-off")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/time-off"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Dashboard</span>
                      {pathname === "/time-off" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/time-off/requests")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/time-off/requests"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Time Offs</span>
                      {pathname === "/time-off/requests" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/time-off/types")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/time-off/types"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Time Off Types</span>
                      {pathname === "/time-off/types" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/time-off/allocations")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/time-off/allocations"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Allocations</span>
                      {pathname === "/time-off/allocations" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Payroll Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("payroll")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isPayrollActive
                      ? "bg-purple-50 text-purple-700 font-semibold border-b-2 border-purple-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Payroll</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === "payroll" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "payroll" && (
                  <div className="absolute left-0 mt-1.5 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                    <button
                      onClick={() => navigate("/payroll")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/payroll"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Dashboard</span>
                      {pathname === "/payroll" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/payroll/payruns")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/payroll/payruns"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Pay Runs</span>
                      {pathname === "/payroll/payruns" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/payslips")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/payslips"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Payslips</span>
                      {pathname === "/payslips" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/payroll/structures")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/payroll/structures"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Salary Structures</span>
                      {pathname === "/payroll/structures" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => navigate("/payroll/rules")}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                        pathname === "/payroll/rules"
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <span>Salary Rules</span>
                      {pathname === "/payroll/rules" && <Check className="h-3.5 w-3.5 text-purple-600" />}
                    </button>
                  </div>
                )}
              </div>

            </nav>
          </div>

          {/* Right Action Bar (Search, Notifications, Profile) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition shadow-xs"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition shadow-xs"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2.5 rounded-md p-1 hover:bg-slate-100 transition cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                HR
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-800">Alex Morgan</span>
                <span className="text-[10px] text-slate-500 font-medium">HR Administrator</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
            
            {/* Employees */}
            <div>
              <div className="px-3 py-1 text-xs font-bold uppercase text-purple-600 tracking-wider">Employees</div>
              <NavLink to="/employees" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Employees
              </NavLink>
              <NavLink to="/employees/contracts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Contracts
              </NavLink>
              <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Departments
              </NavLink>
              <NavLink to="/schedule" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Working Schedule
              </NavLink>
            </div>

            {/* Contracts */}
            <div className="border-t border-slate-100 pt-2">
              <NavLink to="/contracts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Contracts
              </NavLink>
            </div>

            {/* Attendance */}
            <div className="border-t border-slate-100 pt-2">
              <NavLink to="/attendance" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Attendance
              </NavLink>
            </div>

            {/* Time Off */}
            <div className="border-t border-slate-100 pt-2">
              <div className="px-3 py-1 text-xs font-bold uppercase text-purple-600 tracking-wider">Time Off</div>
              <NavLink to="/time-off" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Dashboard
              </NavLink>
              <NavLink to="/time-off/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Time Offs
              </NavLink>
              <NavLink to="/time-off/types" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Time Off Types
              </NavLink>
              <NavLink to="/time-off/allocations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Allocations
              </NavLink>
            </div>

            {/* Payroll */}
            <div className="border-t border-slate-100 pt-2">
              <div className="px-3 py-1 text-xs font-bold uppercase text-purple-600 tracking-wider">Payroll</div>
              <NavLink to="/payroll" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Dashboard
              </NavLink>
              <NavLink to="/payroll/payruns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Pay Runs
              </NavLink>
              <NavLink to="/payslips" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Payslips
              </NavLink>
              <NavLink to="/payroll/structures" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Salary Structures
              </NavLink>
              <NavLink to="/payroll/rules" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-md">
                Salary Rules
              </NavLink>
            </div>

          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
