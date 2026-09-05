import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";

// Page Components
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EmployeesPage from "../pages/Employees/EmployeesPage";
import EmployeeDetailPage from "../pages/Employees/EmployeeDetailPage";
import EmployeeContractsPage from "../pages/Employees/EmployeeContractsPage";
import DepartmentsPage from "../pages/Departments/DepartmentsPage";
import WorkingSchedulesPage from "../pages/WorkingSchedules/WorkingSchedulesPage";

import ContractsPage from "../pages/Contracts/ContractsPage";
import AttendancePage from "../pages/Attendance/AttendancePage";
import AttendanceDetails from "../pages/Attendance/AttendanceDetails";

import TimeOffDashboardPage from "../pages/TimeOff/TimeOffDashboardPage";
import TimeOffRequestsPage from "../pages/TimeOff/TimeOffRequestsPage";
import TimeOffTypesPage from "../pages/TimeOff/TimeOffTypesPage";
import TimeOffAllocationsPage from "../pages/TimeOff/TimeOffAllocationsPage";

import PayrollDashboardPage from "../pages/Payroll/PayrollDashboardPage";
import PayRunsPage from "../pages/Payroll/PayRunsPage";
import PayslipsPage from "../pages/Payslips/PayslipsPage";
import SalaryStructuresPage from "../pages/SalaryStructures/SalaryStructuresPage";
import SalaryRulesPage from "../pages/SalaryRules/SalaryRulesPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Unauthenticated Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Redirect root to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes (Requires valid authentication session) */}
      <Route element={<ProtectedRoute />}>
        {/* Main Application Layout Shell */}
        <Route element={<AppLayout />}>
          {/* 1. Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 2. Employees & Submenu Routes */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/contracts" element={<EmployeeContractsPage />} />
          <Route path="/employees/departments" element={<DepartmentsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/employees/working-schedules" element={<WorkingSchedulesPage />} />
          <Route path="/schedule" element={<WorkingSchedulesPage />} />

          {/* 3. Contracts (Top-level navbar item) */}
          <Route path="/contracts" element={<ContractsPage />} />

          {/* 4. Attendance */}
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/:id" element={<AttendanceDetails />} />

          {/* 5. Time Off Submenu Routes */}
          <Route path="/time-off" element={<TimeOffDashboardPage />} />
          <Route path="/time-off/requests" element={<TimeOffRequestsPage />} />
          <Route path="/time-off/types" element={<TimeOffTypesPage />} />
          <Route path="/time-off/allocations" element={<TimeOffAllocationsPage />} />

          {/* 6. Payroll Submenu Routes */}
          <Route path="/payroll" element={<PayrollDashboardPage />} />
          <Route path="/payroll/payruns" element={<PayRunsPage />} />
          <Route path="/payslips" element={<PayslipsPage />} />
          <Route path="/payroll/structures" element={<SalaryStructuresPage />} />
          <Route path="/payroll/rules" element={<SalaryRulesPage />} />

          {/* Wildcard 404 Route */}
          <Route
            path="*"
            element={
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-red-600">404 - Page Not Found</h1>
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