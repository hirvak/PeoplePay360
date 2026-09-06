import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Public & Auth Pages
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";

// Dashboard
import DashboardPage from "../pages/Dashboard/DashboardPage";

// Employees & HR Submenu Pages
import EmployeesPage from "../pages/Employees/EmployeesPage";
import EmployeeDetailPage from "../pages/Employees/EmployeeDetailPage";
import EmployeeContractsPage from "../pages/Employees/EmployeeContractsPage";
import DepartmentsPage from "../pages/Departments/DepartmentsPage";
import WorkingSchedulesPage from "../pages/WorkingSchedules/WorkingSchedulesPage";
import ContractsPage from "../pages/Contracts/ContractsPage";
import CreateContractPage from "../pages/Contracts/CreateContractPage";

// Attendance
import AttendancePage from "../pages/Attendance/AttendancePage";
import AttendanceDetails from "../pages/Attendance/AttendanceDetails";

// Time Off Submenu Pages
import TimeOffDashboardPage from "../pages/TimeOff/TimeOffDashboardPage";
import TimeOffRequestsPage from "../pages/TimeOff/TimeOffRequestsPage";
import CreateTimeOffRequest from "../pages/TimeOff/CreateTimeOffRequest";
import TimeOffRequestDetails from "../pages/TimeOff/TimeOffRequestDetails";
import TimeOffTypesPage from "../pages/TimeOff/TimeOffTypesPage";
import CreateTimeOffType from "../pages/TimeOff/CreateTimeOffType";
import EditTimeOffType from "../pages/TimeOff/EditTimeOffType";
import TimeOffTypeDetails from "../pages/TimeOff/TimeOffTypeDetails";
import TimeOffAllocationsPage from "../pages/TimeOff/TimeOffAllocationsPage";
import AllocationDetails from "../pages/TimeOff/AllocationDetails";

// Payroll Submenu Pages
import PayrollDashboardPage from "../pages/Payroll/PayrollDashboardPage";
import PayRunsPage from "../pages/Payroll/PayRunsPage";
import PayrunProcessingPage from "../pages/Payroll/PayrunProcessingPage";
import PayslipsPage from "../pages/Payslips/PayslipsPage";
import PayslipDetailPage from "../pages/Payslips/PayslipDetailPage";
import SalaryStructuresPage from "../pages/SalaryStructures/SalaryStructuresPage";
import SalaryStructureDetailPage from "../pages/SalaryStructures/SalaryStructureDetailPage";
import SalaryRulesPage from "../pages/SalaryRules/SalaryRulesPage";
import SalaryRuleDetailPage from "../pages/SalaryRules/SalaryRuleDetailPage";

// Admin Page
import AdminUsersPage from "../pages/Admin/AdminUsersPage";

import MyProfilePage from "../pages/Employees/MyProfilePage";
import MyContractPage from "../pages/Contracts/MyContractPage";

const ALL_ROLES = ["Employee", "HR Manager", "HR Payroll User", "HR Payroll Manager", "Admin"];
const HR_ROLES = ["HR Manager", "HR Payroll User", "HR Payroll Manager", "Admin"];
const PAYROLL_ROLES = ["HR Payroll User", "HR Payroll Manager", "Admin"];
const ADMIN_ROLES = ["Admin"];

function PublicLandingWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PublicLandingWrapper />} />

      {/* Main Authenticated Layout */}
      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<AppLayout />}>
          {/* Universal Accessible Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/employees/me" element={<MyProfilePage />} />
          <Route path="/my-contract" element={<MyContractPage />} />
          <Route path="/contracts/me" element={<MyContractPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/:id" element={<AttendanceDetails />} />
          <Route path="/time-off" element={<TimeOffDashboardPage />} />
          <Route path="/time-off/requests" element={<TimeOffRequestsPage />} />
          <Route path="/time-off/requests/new" element={<CreateTimeOffRequest />} />
          <Route path="/time-off/requests/:id" element={<TimeOffRequestDetails />} />
          <Route path="/time-off/new" element={<CreateTimeOffRequest />} />
          <Route path="/time-off/:id" element={<TimeOffRequestDetails />} />
          <Route path="/my-payslips" element={<PayslipsPage />} />
          <Route path="/payslips" element={<PayslipsPage />} />
          <Route path="/payslips/:id" element={<PayslipDetailPage />} />

          {/* HR Management Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={HR_ROLES} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/contracts" element={<EmployeeContractsPage />} />
            <Route path="/employees/:employeeId/contracts" element={<EmployeeContractsPage />} />
            <Route path="/employees/departments" element={<DepartmentsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/employees/working-schedules" element={<WorkingSchedulesPage />} />
            <Route path="/schedule" element={<WorkingSchedulesPage />} />
            <Route path="/contracts" element={<EmployeeContractsPage />} />
            <Route path="/contracts/new" element={<CreateContractPage />} />
            <Route path="/time-off/types" element={<TimeOffTypesPage />} />
            <Route path="/time-off/types/new" element={<CreateTimeOffType />} />
            <Route path="/time-off/types/:typeId" element={<TimeOffTypeDetails />} />
            <Route path="/time-off/types/:typeId/edit" element={<EditTimeOffType />} />
            <Route path="/time-off/allocations" element={<TimeOffAllocationsPage />} />
            <Route path="/time-off/allocations/:id" element={<AllocationDetails />} />
          </Route>

          {/* Payroll & Administration Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={PAYROLL_ROLES} />}>
            <Route path="/payroll" element={<PayrollDashboardPage />} />
            <Route path="/payroll/payruns" element={<PayRunsPage />} />
            <Route path="/payroll/payruns/:id" element={<PayrunProcessingPage />} />
            <Route path="/payslips" element={<PayslipsPage />} />
            <Route path="/payslips/:id" element={<PayslipDetailPage />} />
            <Route path="/payroll/payslips" element={<PayslipsPage />} />
            <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />
            <Route path="/salary-structures" element={<SalaryStructuresPage />} />
            <Route path="/payroll/structures" element={<SalaryStructuresPage />} />
            <Route path="/payroll/structures/:id" element={<SalaryStructureDetailPage />} />
            <Route path="/salary-rules" element={<SalaryRulesPage />} />
            <Route path="/payroll/rules" element={<SalaryRulesPage />} />
            <Route path="/payroll/rules/:id" element={<SalaryRuleDetailPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin" element={<AdminUsersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="space-y-4 p-8 text-center">
                <h1 className="text-2xl font-bold text-rose-600">404 - Page Not Found</h1>
                <p className="text-slate-600">The requested route does not exist.</p>
              </div>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;