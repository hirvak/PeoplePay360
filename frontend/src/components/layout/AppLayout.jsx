import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AttendanceWidget } from "../attendance/AttendanceWidget";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Building2,
  ChevronDown,
  Menu,
  X,
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  LayoutDashboard,
  LogOut,
  User,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const userRole = user?.role || "Employee";
  const isEmployee = userRole === "Employee";
  const isHRManager = userRole === "HR Manager";
  const isHRPayrollUser = userRole === "HR Payroll User";
  const isHRPayrollManager = userRole === "HR Payroll Manager";
  const isAdmin = userRole === "Admin";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setOpenDropdown(null);
    logout();
    navigate("/login", { replace: true });
  };

  const pathname = location.pathname;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const activeLinkClass =
    "bg-[#714B67]/10 dark:bg-[#A9789A]/20 text-[#714B67] dark:text-[#A9789A] font-bold border-b-2 border-[#714B67] dark:border-[#A9789A]";
  const inactiveLinkClass =
    "text-slate-600 dark:text-slate-300 hover:bg-[#714B67]/5 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white";

  // Dropdown Active State Helpers
  const isEmployeesActive = ["/employees", "/contracts", "/departments", "/schedule"].some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const isTimeOffActive = pathname === "/time-off" || pathname.startsWith("/time-off/");

  const isPayrollActive =
    ["/payroll", "/payslips"].some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#171417] text-[#212529] dark:text-[#F5F1F4] flex flex-col font-sans selection:bg-[#714B67] selection:text-white transition-colors duration-200">
      {/* Top Header / Navigation Bar */}
      <header
        className="sticky top-0 z-50 w-full border-b border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs"
        ref={headerRef}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left Brand Area & Desktop Navigation */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Brand Logo & Name */}
            <NavLink to="/dashboard" className="flex items-center gap-2 transition hover:opacity-90 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#714B67] text-white shadow-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  PeoplePay<span className="text-[#714B67] dark:text-[#A9789A]">360</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                  HR & PAYROLL SUITE
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* ============================================================ */}
              {/* 1. EMPLOYEE ROLE NAVIGATION */}
              {/* ============================================================ */}
              {isEmployee && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/dashboard" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>My Home</span>
                  </NavLink>

                  <NavLink
                    to="/my-profile"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/my-profile" || pathname === "/employees/me" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <User className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>My Profile</span>
                  </NavLink>

                  <NavLink
                    to="/my-contract"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/my-contract" || pathname === "/contracts/me" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <FileText className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>My Contract</span>
                  </NavLink>

                  <NavLink
                    to="/attendance"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/attendance" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <Clock className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>Attendance</span>
                  </NavLink>

                  <NavLink
                    to="/time-off"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname.startsWith("/time-off") ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <Calendar className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>Time Off</span>
                  </NavLink>

                  <NavLink
                    to="/my-payslips"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/my-payslips" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <DollarSign className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>My Payslips</span>
                  </NavLink>
                </>
              )}

              {/* ============================================================ */}
              {/* 2. HR / ADMIN / PAYROLL ROLES GROUPED NAVIGATION */}
              {/* ============================================================ */}
              {!isEmployee && (
                <>
                  {/* Dashboard */}
                  <NavLink
                    to="/dashboard"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/dashboard" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>Dashboard</span>
                  </NavLink>

                  {/* Employees Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown("employees")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isEmployeesActive ? activeLinkClass : inactiveLinkClass
                      }`}
                    >
                      <Users className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                      <span>Employees</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </button>

                    {openDropdown === "employees" && (
                      <div className="absolute left-0 mt-1.5 w-52 rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] py-1.5 shadow-lg ring-1 ring-black/5 z-50">
                        <NavLink
                          to="/employees"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Employees
                        </NavLink>
                        <NavLink
                          to="/contracts"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Contracts
                        </NavLink>
                        {(isHRManager || isAdmin) && (
                          <NavLink
                            to="/departments"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Departments
                          </NavLink>
                        )}
                        {(isHRManager || isAdmin) && (
                          <NavLink
                            to="/schedule"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Working Schedules
                          </NavLink>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Attendance */}
                  <NavLink
                    to="/attendance"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      pathname === "/attendance" ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    <Clock className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                    <span>Attendance</span>
                  </NavLink>

                  {/* Time Off Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown("timeOff")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isTimeOffActive ? activeLinkClass : inactiveLinkClass
                      }`}
                    >
                      <Calendar className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                      <span>Time Off</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </button>

                    {openDropdown === "timeOff" && (
                      <div className="absolute left-0 mt-1.5 w-48 rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] py-1.5 shadow-lg ring-1 ring-black/5 z-50">
                        <NavLink
                          to="/time-off"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/time-off/requests"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Time Off
                        </NavLink>
                        <NavLink
                          to="/time-off/types"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Time Off Types
                        </NavLink>
                        <NavLink
                          to="/time-off/allocations"
                          className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                        >
                          Allocations
                        </NavLink>
                      </div>
                    )}
                  </div>

                  {/* Payroll Dropdown */}
                  {(isHRPayrollUser || isHRPayrollManager || isAdmin) && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleDropdown("payroll")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                          isPayrollActive ? activeLinkClass : inactiveLinkClass
                        }`}
                      >
                        <DollarSign className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                        <span>Payroll</span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </button>

                      {openDropdown === "payroll" && (
                        <div className="absolute left-0 mt-1.5 w-52 rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] py-1.5 shadow-lg ring-1 ring-black/5 z-50">
                          <NavLink
                            to="/payroll"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Dashboard
                          </NavLink>
                          <NavLink
                            to="/payroll/payruns"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Pay Runs
                          </NavLink>
                          <NavLink
                            to="/payslips"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Payslips
                          </NavLink>
                          <NavLink
                            to="/payroll/structures"
                            className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                          >
                            Salary Structures
                          </NavLink>
                          {(isHRPayrollManager || isAdmin) && (
                            <NavLink
                              to="/payroll/rules"
                              className="block px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-[#A9789A]/20 hover:text-[#714B67] dark:hover:text-[#A9789A] transition"
                            >
                              Salary Rules
                            </NavLink>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Users */}
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                        pathname === "/admin" ? activeLinkClass : inactiveLinkClass
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-[#714B67] dark:text-[#A9789A]" />
                      <span>Admin Users</span>
                    </NavLink>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Action Bar (Check In/Out Widget, Theme Toggle, Profile Dropdown) */}
          <div className="flex items-center gap-3">
            <AttendanceWidget />

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[#714B67]" />}
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("user_profile")}
                className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#714B67] text-xs font-bold text-white shadow-2xs">
                  {user?.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                    {user?.email ? user.email.split("@")[0] : "User"}
                  </span>
                  <span className="text-[10px] text-[#714B67] dark:text-[#A9789A] font-semibold capitalize mt-0.5">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
              </button>

              {openDropdown === "user_profile" && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] py-1 shadow-lg ring-1 ring-black/5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">{user?.email || "User"}</span>
                    <span className="text-[10px] text-[#714B67] dark:text-[#A9789A] font-semibold uppercase tracking-wider">{userRole}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-md border border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#DEE2E6] dark:border-[#40383D] bg-white dark:bg-[#211D20] px-4 pt-2 pb-4 space-y-1 shadow-md">
            {isEmployee && (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  My Home
                </NavLink>
                <NavLink to="/my-profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  My Profile
                </NavLink>
                <NavLink to="/my-contract" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  My Contract
                </NavLink>
                <NavLink to="/attendance" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  Attendance
                </NavLink>
                <NavLink to="/time-off" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  Time Off
                </NavLink>
                <NavLink to="/my-payslips" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  My Payslips
                </NavLink>
              </>
            )}

            {!isEmployee && (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  Dashboard
                </NavLink>

                {/* Employees Group */}
                <div className="space-y-0.5 pl-2 border-l-2 border-[#714B67]/30 dark:border-[#A9789A]/30 my-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#714B67] dark:text-[#A9789A] px-3 pt-1">Employees</div>
                  <NavLink to="/employees" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Employees
                  </NavLink>
                  <NavLink to="/contracts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Contracts
                  </NavLink>
                  {(isHRManager || isAdmin) && (
                    <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Departments
                    </NavLink>
                  )}
                  {(isHRManager || isAdmin) && (
                    <NavLink to="/schedule" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Working Schedules
                    </NavLink>
                  )}
                </div>

                <NavLink to="/attendance" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                  Attendance
                </NavLink>

                {/* Time Off Group */}
                <div className="space-y-0.5 pl-2 border-l-2 border-[#714B67]/30 dark:border-[#A9789A]/30 my-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#714B67] dark:text-[#A9789A] px-3 pt-1">Time Off</div>
                  <NavLink to="/time-off" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Dashboard
                  </NavLink>
                  <NavLink to="/time-off/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Time Off
                  </NavLink>
                  <NavLink to="/time-off/types" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Time Off Types
                  </NavLink>
                  <NavLink to="/time-off/allocations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Allocations
                  </NavLink>
                </div>

                {/* Payroll Group */}
                {(isHRPayrollUser || isHRPayrollManager || isAdmin) && (
                  <div className="space-y-0.5 pl-2 border-l-2 border-[#714B67]/30 dark:border-[#A9789A]/30 my-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#714B67] dark:text-[#A9789A] px-3 pt-1">Payroll</div>
                    <NavLink to="/payroll" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Dashboard
                    </NavLink>
                    <NavLink to="/payroll/payruns" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Pay Runs
                    </NavLink>
                    <NavLink to="/payslips" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Payslips
                    </NavLink>
                    <NavLink to="/payroll/structures" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                      Salary Structures
                    </NavLink>
                    {(isHRPayrollManager || isAdmin) && (
                      <NavLink to="/payroll/rules" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                        Salary Rules
                      </NavLink>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#714B67]/10 rounded-md">
                    Admin Users
                  </NavLink>
                )}
              </>
            )}
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
