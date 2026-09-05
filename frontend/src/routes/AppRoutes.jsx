import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";

// Page Components
import DashboardPage from "../pages/Dashboard/DashboardPage";

// Employees Submenu Pages
import EmployeesPage from "../pages/Employees/EmployeesPage";
import EmployeeDetailPage from "../pages/Employees/EmployeeDetailPage";
import EmployeeContractsPage from "../pages/Employees/EmployeeContractsPage";
import DepartmentsPage from "../pages/Departments/DepartmentsPage";
import WorkingSchedulesPage from "../pages/WorkingSchedules/WorkingSchedulesPage";

// Top-Level Navbar Pages
import ContractsPage from "../pages/Contracts/ContractsPage";
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

          {/* 2. Employees Submenu Routes */}
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
          <Route path="/time-off/requests/new" element={<CreateTimeOffRequest />} />
          <Route path="/time-off/requests/:id" element={<TimeOffRequestDetails />} />
          <Route path="/time-off/new" element={<CreateTimeOffRequest />} />
          <Route path="/time-off/:id" element={<TimeOffRequestDetails />} />
          <Route path="/time-off/types" element={<TimeOffTypesPage />} />
          <Route path="/time-off/types/new" element={<CreateTimeOffType />} />
          <Route path="/time-off/types/:typeId" element={<TimeOffTypeDetails />} />
          <Route path="/time-off/types/:typeId/edit" element={<EditTimeOffType />} />
          <Route path="/time-off/allocations" element={<TimeOffAllocationsPage />} />
          <Route path="/time-off/allocations/:id" element={<AllocationDetails />} />

          {/* 6. Payroll Submenu Routes */}
          <Route path="/payroll" element={<PayrollDashboardPage />} />
          <Route path="/payroll/payruns" element={<PayRunsPage />} />
          <Route path="/payroll/payruns/:id" element={<PayrunProcessingPage />} />

          <Route path="/payslips" element={<PayslipsPage />} />
          <Route path="/payslips/:id" element={<PayslipDetailPage />} />
          <Route path="/payroll/payslips" element={<PayslipsPage />} />
          <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />

          <Route path="/payroll/structures" element={<SalaryStructuresPage />} />
          <Route path="/payroll/structures/:id" element={<SalaryStructureDetailPage />} />

          <Route path="/payroll/rules" element={<SalaryRulesPage />} />
          <Route path="/payroll/rules/:id" element={<SalaryRuleDetailPage />} />

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