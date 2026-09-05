import { Routes, Route, Navigate } from "react-router-dom";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
            <Route path="/employees" element={<h1>Employees</h1>} />
            <Route path="/contracts" element={<h1>Contracts</h1>} />
            <Route path="/attendance" element={<h1>Attendance</h1>} />
            <Route path="/time-off" element={<h1>Time Off</h1>} />
            <Route path="/payroll" element={<h1>Payroll</h1>} />
            <Route path="/payslips" element={<h1>Payslips</h1>} />

            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}

export default AppRoutes;