import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Clock,
  Briefcase,
  Layers,
  Filter,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import {
  MOCK_DEPARTMENTS,
  MOCK_PAYSLIPS,
  MOCK_PAYRUNS,
  MOCK_ATTENDANCE_SUMMARY,
  MOCK_TIMEOFF_SUMMARY,
} from "../../data/payrollData";

export default function PayrollDashboardPage() {
  // Top Filter State
  const [periodFilter, setPeriodFilter] = useState("February 2026");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("PeoplePay360 Global Inc.");

  // Filtered Payslips based on Top Filters
  const filteredPayslips = useMemo(() => {
    return MOCK_PAYSLIPS.filter((ps) => {
      if (periodFilter !== "all" && ps.period !== periodFilter) return false;
      if (departmentFilter !== "all" && ps.department !== departmentFilter) return false;
      return true;
    });
  }, [periodFilter, departmentFilter]);

  // Dynamic KPI Calculations
  const totalNetPaid = useMemo(() => {
    return filteredPayslips.reduce((sum, ps) => sum + ps.net_salary, 0);
  }, [filteredPayslips]);

  const totalGrossPaid = useMemo(() => {
    return filteredPayslips.reduce((sum, ps) => sum + ps.gross_salary, 0);
  }, [filteredPayslips]);

  const payslipsCount = filteredPayslips.length;

  const avgSalary = useMemo(() => {
    return payslipsCount > 0 ? totalNetPaid / payslipsCount : 0;
  }, [totalNetPaid, payslipsCount]);

  const warningCount = useMemo(() => {
    return filteredPayslips.filter((ps) => ps.status === "Warning").length;
  }, [filteredPayslips]);

  // Department cost breakdown
  const departmentCosts = useMemo(() => {
    const map = {};
    MOCK_DEPARTMENTS.forEach((dept) => {
      map[dept.name] = 0;
    });

    filteredPayslips.forEach((ps) => {
      if (map[ps.department] !== undefined) {
        map[ps.department] += ps.gross_salary;
      } else {
        map[ps.department] = ps.gross_salary;
      }
    });

    return Object.entries(map).map(([name, cost]) => ({ name, cost }));
  }, [filteredPayslips]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payroll Dashboard</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              Live HR & Payroll Suite
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Executive overview of salary disbursements, department costs, attendance health, and compliance warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/payroll/payruns"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-xs"
          >
            <DollarSign className="h-4 w-4" />
            <span>Manage Pay Runs</span>
          </Link>
        </div>
      </div>

      {/* Top Interactive Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-purple-700">
          <Filter className="h-4 w-4 text-purple-600" />
          <span>Interactive Payroll Scope Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Period Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Payroll Period</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-600 focus:outline-hidden"
            >
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
              <option value="December 2025">December 2025</option>
              <option value="all">All Historical Periods</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-600 focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              {MOCK_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Employee Type</label>
            <select
              value={employeeTypeFilter}
              onChange={(e) => setEmployeeTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-600 focus:outline-hidden"
            >
              <option value="all">All Employee Types</option>
              <option value="fulltime">Permanent / Full-Time</option>
              <option value="parttime">Part-Time</option>
              <option value="contract">Fixed-Term Contract</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Company / Entity</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-600 focus:outline-hidden"
            >
              <option value="PeoplePay360 Global Inc.">PeoplePay360 Global Inc.</option>
              <option value="PeoplePay360 Tech Solutions">PeoplePay360 Tech Solutions</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Net Salary Paid */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Salary</span>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">${totalNetPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Gross: ${totalGrossPaid.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </p>
        </div>

        {/* KPI 2: Payslips Generated */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payslips Generated</span>
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{payslipsCount} Payslips</p>
          <p className="text-[11px] text-slate-500 mt-1">Period: {periodFilter}</p>
        </div>

        {/* KPI 3: Average Salary / Employee */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Salary / Emp</span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">${avgSalary.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-500 mt-1">Per active employee</p>
        </div>

        {/* KPI 4: Approved Time Off Days */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Time Off</span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{MOCK_TIMEOFF_SUMMARY.approved_days} Days</p>
          <p className="text-[11px] text-slate-500 mt-1">{MOCK_TIMEOFF_SUMMARY.pending_requests} Pending Approval</p>
        </div>

        {/* KPI 5: Attendance Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Attendance Health</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{MOCK_ATTENDANCE_SUMMARY.present}% Present</p>
          <p className="text-[11px] text-slate-500 mt-1">{MOCK_ATTENDANCE_SUMMARY.overtime_hours}h Overtime Logged</p>
        </div>
      </div>

      {/* Main Grid: Salary Cost by Department & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Salary Cost by Department */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Salary Cost by Department</h3>
              <p className="text-xs text-slate-500">Gross payroll disbursement by organizational unit ({periodFilter})</p>
            </div>
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>

          <div className="space-y-4">
            {departmentCosts.map((dept) => {
              const maxCost = 25000;
              const pct = Math.min(Math.round((dept.cost / maxCost) * 100), 100);

              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{dept.name}</span>
                    <span className="text-purple-700 font-bold">${dept.cost.toLocaleString("en-US")}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${pct || 4}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payslip Status & Payroll Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Payslip Status & Alerts</h3>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Validated / Processed
                </span>
                <span className="font-extrabold text-emerald-800">{payslipsCount - warningCount} Payslips</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Action / Warning Required
                </span>
                <span className="font-extrabold text-amber-800">{warningCount} Item</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payroll Warnings List</h4>
              
              <div className="text-xs p-2.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">EMP-004 (David Lee)</p>
                  <p className="text-[11px] text-slate-500">Missing verified tax ID documentation</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/payroll/payruns"
            className="mt-6 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800"
          >
            <span>View All Pay Runs</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Attendance & Time Off Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Impact Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Attendance Payroll Impact</h3>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-xs">
              Timesheet Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Present</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">{MOCK_ATTENDANCE_SUMMARY.present}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Late Shifts</span>
              <span className="text-lg font-bold text-amber-700 mt-1 block">{MOCK_ATTENDANCE_SUMMARY.late}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Overtime</span>
              <span className="text-lg font-bold text-indigo-700 mt-1 block">{MOCK_ATTENDANCE_SUMMARY.overtime_hours} hrs</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Missing Out</span>
              <span className="text-lg font-bold text-slate-700 mt-1 block">{MOCK_ATTENDANCE_SUMMARY.missing_checkouts}</span>
            </div>
          </div>
        </div>

        {/* Time Off Payroll Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Time Off & Leave Balance</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs">
              Leave Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Paid Leave</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{MOCK_TIMEOFF_SUMMARY.paid_time_off_days} d</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Sick Leave</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{MOCK_TIMEOFF_SUMMARY.sick_leave_days} d</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Comp Off</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{MOCK_TIMEOFF_SUMMARY.comp_off_days} d</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Balance</span>
              <span className="text-lg font-bold text-purple-700 mt-1 block">{MOCK_TIMEOFF_SUMMARY.remaining_balance} d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Module Payroll Engine Integration Card */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
          <Layers className="h-5 w-5 text-purple-700" />
          <span>PeoplePay360 Integrated Payroll Calculation Engine</span>
        </div>
        <p className="text-xs text-purple-800 leading-relaxed max-w-4xl">
          The PeoplePay360 Payroll Engine dynamically aggregates contract terms from <strong className="font-semibold">Employees & Contracts</strong>, daily time tracking from <strong className="font-semibold">Attendance</strong>, leave approvals from <strong className="font-semibold">Time Off</strong>, and shift multipliers from <strong className="font-semibold">Working Schedules</strong> to compute accurate, itemized gross-to-net salary disbursements.
        </p>
      </div>
    </div>
  );
}
