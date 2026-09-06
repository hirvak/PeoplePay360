import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  DollarSign,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  Clock,
  Briefcase,
  User,
  Plus,
  ArrowRight,
  Loader2,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dashboardService from "../../services/dashboardService";
import employeeService from "../../services/employeeService";
import attendanceService from "../../services/attendanceService";
import timeOffService from "../../services/timeOffService";
import payslipService from "../../services/payslipService";
import contractService from "../../services/contractService";
import payrunService from "../../services/payrunService";
import departmentService from "../../services/departmentService";
import { AttendanceWidget } from "../../components/attendance/AttendanceWidget";
import { useAuth } from "../../context/AuthContext";

// Custom Tooltip for Monthly Net Salary Trend Bar Chart
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-3 shadow-md text-xs">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
        <p className="font-semibold text-purple-700 dark:text-purple-300">
          Net Salary: ₹{Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  // HR Dashboard Collections & State
  const [hrSummary, setHrSummary] = useState(null);
  const [salaryByDept, setSalaryByDept] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allPayruns, setAllPayruns] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allAttendances, setAllAttendances] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);

  // Filters State
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Employee Dashboard State
  const [empProfile, setEmpProfile] = useState(null);
  const [empAttendance, setEmpAttendance] = useState([]);
  const [empLeaveBalance, setEmpLeaveBalance] = useState([]);
  const [empLeaveRequests, setEmpLeaveRequests] = useState([]);
  const [empPayslips, setEmpPayslips] = useState([]);
  const [empContracts, setEmpContracts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!hrSummary && !empProfile) setLoading(true);

    try {
      if (isEmployee) {
        // Employee Self-Service Home data fetching using /me endpoints
        const [profRes, attRes, balRes, reqRes, payRes, conRes] = await Promise.allSettled([
          employeeService.getMe(),
          attendanceService.getMyAttendance(),
          timeOffService.getMyBalance(),
          timeOffService.getMyRequests(),
          payslipService.getMyPayslips(),
          contractService.getMyContracts(),
        ]);

        if (profRes.status === "fulfilled") setEmpProfile(profRes.value);
        if (attRes.status === "fulfilled") setEmpAttendance(attRes.value || []);
        if (balRes.status === "fulfilled") setEmpLeaveBalance(balRes.value || []);
        if (reqRes.status === "fulfilled") setEmpLeaveRequests(reqRes.value || []);
        if (payRes.status === "fulfilled") setEmpPayslips(payRes.value || []);
        if (conRes.status === "fulfilled") setEmpContracts(conRes.value || []);
      } else {
        // HR / Admin Enterprise Dashboard Summary & Collections
        const [
          sumRes,
          deptRes,
          trendRes,
          alertRes,
          empRes,
          payrunRes,
          payslipRes,
          deptsListRes,
          attRes,
          leaveReqRes,
        ] = await Promise.allSettled([
          dashboardService.getSummary(),
          dashboardService.getSalaryByDepartment(),
          dashboardService.getMonthlyNetSalary(),
          dashboardService.getAlerts(),
          employeeService.getAll(),
          payrunService.getAll(),
          payslipService.getAll(),
          departmentService.getAll(),
          attendanceService.getAll(),
          timeOffService.getAllRequests(),
        ]);

        if (sumRes.status === "fulfilled") setHrSummary(sumRes.value);
        if (deptRes.status === "fulfilled") setSalaryByDept(Array.isArray(deptRes.value) ? deptRes.value : []);
        if (trendRes.status === "fulfilled") setMonthlyTrend(Array.isArray(trendRes.value) ? trendRes.value : []);
        if (alertRes.status === "fulfilled") {
          const val = alertRes.value;
          setAlerts(Array.isArray(val?.alerts) ? val.alerts : Array.isArray(val) ? val : []);
        }
        if (empRes.status === "fulfilled") setAllEmployees(Array.isArray(empRes.value) ? empRes.value : []);
        if (payrunRes.status === "fulfilled") setAllPayruns(Array.isArray(payrunRes.value) ? payrunRes.value : []);
        if (payslipRes.status === "fulfilled") setAllPayslips(Array.isArray(payslipRes.value) ? payslipRes.value : []);
        if (deptsListRes.status === "fulfilled") setAllDepartments(Array.isArray(deptsListRes.value) ? deptsListRes.value : []);
        if (attRes.status === "fulfilled") setAllAttendances(Array.isArray(attRes.value) ? attRes.value : []);
        if (leaveReqRes.status === "fulfilled") setAllLeaveRequests(Array.isArray(leaveReqRes.value) ? leaveReqRes.value : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh when window regains focus to keep dashboard live
    const handleFocus = () => fetchDashboardData(false);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isEmployee]);

  // Map employee ID -> department name for quick lookups
  const employeeDeptMap = useMemo(() => {
    const map = new Map();
    allEmployees.forEach((emp) => {
      const deptName = emp.department_name || emp.department?.name || "Unassigned";
      map.set(emp.id, deptName);
    });
    return map;
  }, [allEmployees]);

  // Extract distinct payroll periods from payruns & payslips
  const availablePeriods = useMemo(() => {
    const periodSet = new Set();
    allPayruns.forEach((p) => {
      if (p.name) periodSet.add(p.name);
    });
    allPayslips.forEach((ps) => {
      if (ps.period) periodSet.add(ps.period);
    });
    return Array.from(periodSet).sort();
  }, [allPayruns, allPayslips]);

  // Extract department names list
  const availableDepartments = useMemo(() => {
    const deptSet = new Set();
    allDepartments.forEach((d) => {
      if (d.name) deptSet.add(d.name);
    });
    allEmployees.forEach((e) => {
      const dName = e.department_name || e.department?.name;
      if (dName) deptSet.add(dName);
    });
    return Array.from(deptSet).sort();
  }, [allDepartments, allEmployees]);

  // Dynamically Filtered Metrics based on Scope Filters (Period & Department)
  const filteredMetrics = useMemo(() => {
    // 1. Employees Filtered
    let emps = allEmployees;
    if (selectedDepartment !== "all") {
      emps = allEmployees.filter(
        (e) => (e.department_name || e.department?.name || "").toLowerCase() === selectedDepartment.toLowerCase()
      );
    }
    const filteredEmployeeIds = new Set(emps.map((e) => e.id));

    // 2. Payruns Filtered
    let payruns = allPayruns.filter((p) => p.status !== "Cancelled");
    if (selectedPeriod !== "all") {
      payruns = payruns.filter((p) => p.name === selectedPeriod || p.period === selectedPeriod);
    }

    // 3. Payslips Filtered
    let payslips = allPayslips;
    if (selectedPeriod !== "all") {
      payslips = payslips.filter((ps) => ps.period === selectedPeriod);
    }
    if (selectedDepartment !== "all") {
      payslips = payslips.filter((ps) => {
        const empDept = employeeDeptMap.get(ps.employee_id) || "";
        return empDept.toLowerCase() === selectedDepartment.toLowerCase();
      });
    }

    // Total Disbursement
    const disbursement = payslips.reduce(
      (sum, ps) => sum + Number(ps.net_salary || ps.total_net || 0),
      0
    );

    // Fallback disbursement from summary if no filters applied and payslips empty
    const finalDisbursement =
      selectedPeriod === "all" && selectedDepartment === "all" && payslips.length === 0
        ? Number(hrSummary?.total_net_salary_paid ?? hrSummary?.total_net ?? 0)
        : disbursement;

    const totalPayslipsCount =
      selectedPeriod === "all" && selectedDepartment === "all" && payslips.length === 0
        ? (hrSummary?.payslips_generated ?? hrSummary?.total_payslips ?? 0)
        : payslips.length;

    return {
      totalEmployees: emps.length,
      activePayruns: payruns.length,
      totalDisbursement: finalDisbursement,
      totalPayslips: totalPayslipsCount,
    };
  }, [allEmployees, allPayruns, allPayslips, selectedPeriod, selectedDepartment, employeeDeptMap, hrSummary]);

  // Format Monthly Net Salary Trend Data for Bar Chart (MUST show ALL periods chronologically)
  const monthlyChartData = useMemo(() => {
    // Map period / month -> aggregated net salary
    const trendMap = new Map();

    // First populate from allPayslips to capture filtered department data if applicable
    allPayslips.forEach((ps) => {
      const empDept = employeeDeptMap.get(ps.employee_id) || "";
      if (selectedDepartment !== "all" && empDept.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return;
      }
      const periodKey = ps.period || "Unknown";
      const amount = Number(ps.net_salary || 0);
      trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + amount);
    });

    // If no payslips match or no dept filter, also check monthlyTrend from backend
    if (trendMap.size === 0 && monthlyTrend.length > 0) {
      monthlyTrend.forEach((item) => {
        let label = item.month || item.period || "Period";
        const amt = Number(item.net_salary ?? item.total_net ?? item.amount ?? 0);
        trendMap.set(label, amt);
      });
    }

    // Convert to sorted array of objects for Recharts
    const chartList = Array.from(trendMap.entries()).map(([rawLabel, amount]) => {
      let displayLabel = rawLabel;
      if (/^\d{4}-\d{2}$/.test(rawLabel)) {
        const [year, monthNum] = rawLabel.split("-");
        const date = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
        displayLabel = date.toLocaleString("en-US", { month: "short", year: "numeric" });
      }
      return {
        label: displayLabel,
        amount,
        rawLabel,
      };
    });

    // Sort chronologically if possible
    chartList.sort((a, b) => a.rawLabel.localeCompare(b.rawLabel));
    return chartList;
  }, [allPayslips, employeeDeptMap, selectedDepartment, monthlyTrend]);

  // Format Department Overview Table Data
  const departmentTableData = useMemo(() => {
    const map = new Map();

    // Seed from salaryByDept backend summary
    if (Array.isArray(salaryByDept)) {
      salaryByDept.forEach((d) => {
        const name = d.department || d.department_name || d.name || "Unassigned";
        const cost = Number(d.salary_cost ?? d.total_gross ?? d.cost ?? 0);
        map.set(name.toLowerCase(), {
          name,
          cost,
          headcount: 0,
        });
      });
    }

    // Calculate headcount from employees
    if (Array.isArray(allEmployees)) {
      allEmployees.forEach((emp) => {
        const deptName = emp.department_name || emp.department?.name || "Unassigned";
        const key = deptName.toLowerCase();
        if (map.has(key)) {
          map.get(key).headcount += 1;
        } else {
          map.set(key, {
            name: deptName,
            cost: 0,
            headcount: 1,
          });
        }
      });
    }

    // Recalculate cost from payslips if period filter or department filter active
    if (allPayslips.length > 0) {
      // Clear costs and re-aggregate from payslips
      map.forEach((val) => { val.cost = 0; });
      allPayslips.forEach((ps) => {
        if (selectedPeriod !== "all" && ps.period !== selectedPeriod) return;
        const deptName = employeeDeptMap.get(ps.employee_id) || "Unassigned";
        const key = deptName.toLowerCase();
        if (map.has(key)) {
          map.get(key).cost += Number(ps.net_salary || 0);
        } else {
          map.set(key, {
            name: deptName,
            cost: Number(ps.net_salary || 0),
            headcount: 0,
          });
        }
      });
    }

    let rows = Array.from(map.values());
    if (selectedDepartment !== "all") {
      rows = rows.filter((r) => r.name.toLowerCase() === selectedDepartment.toLowerCase());
    }

    return rows;
  }, [salaryByDept, allEmployees, allPayslips, selectedPeriod, selectedDepartment, employeeDeptMap]);

  // Attendance Impact Metrics (HR Overview)
  const attendanceImpact = useMemo(() => {
    let atts = allAttendances;
    if (selectedDepartment !== "all") {
      atts = atts.filter((a) => {
        const empDept = employeeDeptMap.get(a.employee_id) || "";
        return empDept.toLowerCase() === selectedDepartment.toLowerCase();
      });
    }

    const totalLogs = atts.length;
    const checkedIn = atts.filter((a) => a.check_in && !a.check_out).length;
    const completedShifts = atts.filter((a) => a.check_in && a.check_out).length;
    const lateArrivals = atts.filter((a) => a.status === "Late" || a.is_late).length;

    return {
      totalLogs,
      checkedIn,
      completedShifts,
      lateArrivals,
    };
  }, [allAttendances, selectedDepartment, employeeDeptMap]);

  // Time Off Summary Metrics (HR Overview)
  const timeOffSummary = useMemo(() => {
    let reqs = allLeaveRequests;
    if (selectedDepartment !== "all") {
      reqs = reqs.filter((r) => {
        const empDept = employeeDeptMap.get(r.employee_id) || "";
        return empDept.toLowerCase() === selectedDepartment.toLowerCase();
      });
    }

    const total = reqs.length;
    const pending = reqs.filter((r) => r.status === "Pending").length;
    const approved = reqs.filter((r) => r.status === "Approved").length;
    const rejected = reqs.filter((r) => r.status === "Rejected").length;

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [allLeaveRequests, selectedDepartment, employeeDeptMap]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // =========================================================================
  // 1. EMPLOYEE SELF-SERVICE HOME DASHBOARD
  // =========================================================================
  if (isEmployee) {
    const firstName = empProfile?.first_name || user?.first_name || user?.email?.split("@")[0] || "Employee";
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAtt = empAttendance.find((a) => a.attendance_date === todayStr);
    const isCheckedIn = Boolean(todayAtt && todayAtt.check_in && !todayAtt.check_out);
    const isShiftDone = Boolean(todayAtt && todayAtt.check_in && todayAtt.check_out);

    const activeContract = empContracts.find((c) => c.status === "Active" || c.is_active) || empContracts[0];
    const latestPayslip = empPayslips[0];
    const pendingLeaveCount = empLeaveRequests.filter((r) => r.status === "Pending").length;

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {firstName}!
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                Employee Portal
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your self-service overview for attendance, leave, contracts, and payslips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AttendanceWidget buttonVariant="default" buttonSize="md" className="bg-purple-600 text-white hover:bg-purple-700 font-semibold" />
            <Link
              to="/time-off/requests/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Time Off</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Attendance Status */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Attendance</span>
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {isCheckedIn ? "Checked In" : isShiftDone ? "Shift Completed" : "Not Checked In"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {todayAtt?.check_in ? `In: ${todayAtt.check_in.slice(0, 5)}` : "No activity logged today"}
            </p>
          </div>

          {/* 2. Leave Balance */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Leave Requests</span>
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingLeaveCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {empLeaveRequests.length} total leave request(s)
            </p>
          </div>

          {/* 3. Monthly Wage */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Base Salary Rate</span>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{activeContract?.wage ? Number(activeContract.wage).toLocaleString("en-IN") : "N/A"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {activeContract?.job_position || "Current contract rate"}
            </p>
          </div>

          {/* 4. Latest Payslip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Latest Net Salary</span>
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
              ₹{latestPayslip?.net_salary ? Number(latestPayslip.net_salary).toLocaleString("en-IN") : "0.00"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {latestPayslip?.period || "No payslip generated yet"}
            </p>
          </div>
        </div>

        {/* Two Column Layout for Profile Summary & Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">My Profile Summary</h3>
              </div>
              <Link to="/my-profile" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View Full <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Employee Code</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{empProfile?.employee_code || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Position</span>
                <span className="font-bold text-slate-900 dark:text-white">{empProfile?.job_position || "Not assigned"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{empProfile?.department_name || empProfile?.department?.name || empProfile?.department || "Not assigned"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Work Email</span>
                <span className="font-medium text-purple-700 dark:text-purple-400">{empProfile?.work_email || user?.email}</span>
              </div>
            </div>
          </div>

          {/* Active Contract Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Contract</h3>
              </div>
              <Link to="/my-contract" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {activeContract ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Contract ID</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">#{activeContract.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Start Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeContract.start_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Wage</span>
                  <span className="font-extrabold text-purple-700 dark:text-purple-400">₹{Number(activeContract.wage).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Status</span>
                  <span className="font-bold text-emerald-600">{activeContract.status || "Active"}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active contract registered.</p>
            )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">My Time Off Requests</h3>
            <Link to="/time-off" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {empLeaveRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No time off requests submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Leave Type</th>
                    <th className="px-4 py-2.5">Dates</th>
                    <th className="px-4 py-2.5">Days</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {empLeaveRequests.slice(0, 4).map((req) => {
                    const typeName = req.leave_type_name || req.leave_type?.name || req.time_off_type_name || (req.leave_type_id ? `Leave Type #${req.leave_type_id}` : "N/A");
                    const daysVal = req.requested_amount ? Number(req.requested_amount) : (req.number_of_days || 1);
                    const daysDisplay = `${daysVal} ${daysVal === 1 ? "day" : "days"}`;

                    return (
                      <tr key={req.id}>
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                          {typeName}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{req.start_date} ~ {req.end_date}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white">{daysDisplay}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            req.status === "Approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : req.status === "Rejected" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. HR / ADMIN MANAGEMENT DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Header Bar with Interactive Scope Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Enterprise Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of HR operations, workforce management, and real-time payroll.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Filter 1: Payroll Period */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#211D20] border border-slate-300 dark:border-[#40383D] rounded-lg px-3 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Periods</option>
              {availablePeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Filter 2: Department */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#211D20] border border-slate-300 dark:border-[#40383D] rounded-lg px-3 py-1.5 shadow-2xs">
            <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dept:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/payroll"
            className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
          >
            Payroll Hub
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards (Dynamic Live Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Employees</span>
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredMetrics.totalEmployees}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {selectedDepartment !== "all" ? `${selectedDepartment} Dept` : "Active workforce members"}
          </p>
        </div>

        {/* Card 2: Active Payruns */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Payruns</span>
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredMetrics.activePayruns}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {selectedPeriod !== "all" ? selectedPeriod : "Payruns in system"}
          </p>
        </div>

        {/* Card 3: Total Disbursement */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Disbursement</span>
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{filteredMetrics.totalDisbursement.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Net salary disbursed</p>
        </div>

        {/* Card 4: Total Payslips */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Payslips</span>
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredMetrics.totalPayslips}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Itemized payslip records</p>
        </div>
      </div>

      {/* Main Grid: Monthly Net Salary Trend & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Monthly Net Salary Trend Bar Chart (Renders ALL Historical Periods) */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Net Salary Trend</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  <BarChart3 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Bar Chart
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All available historical periods (PostgreSQL live aggregate)
              </p>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-72 w-full pt-2">
              {monthlyChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic">
                  No historical net salary trend data recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      stroke="#94A3B8"
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      stroke="#94A3B8"
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(113, 75, 103, 0.08)" }} />
                    <Bar
                      dataKey="amount"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      fill="#714B67"
                      className="fill-[#714B67] dark:fill-[#A9789A]"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* 2. Department Overview Table */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Workforce headcount & disbursed salary breakdown
                </p>
              </div>
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Department</th>
                    <th scope="col" className="px-4 py-3 text-center">Headcount</th>
                    <th scope="col" className="px-4 py-3 text-right">Disbursed Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departmentTableData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400 italic">
                        No department data recorded yet.
                      </td>
                    </tr>
                  ) : (
                    departmentTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          {row.name}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                            {row.headcount}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                          ₹{Number(row.cost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Attendance Impact & Time Off Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Impact */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Impact</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time attendance logs status</p>
            </div>
            <Clock3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Logs</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{attendanceImpact.totalLogs}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Checked In</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{attendanceImpact.checkedIn}</p>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 border border-purple-100 dark:border-purple-900/40">
              <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300">Completed Shifts</span>
              <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">{attendanceImpact.completedShifts}</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-100 dark:border-amber-900/40">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Late Arrivals</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{attendanceImpact.lateArrivals}</p>
            </div>
          </div>
        </div>

        {/* Time Off Summary */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Time Off Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leave requests breakdown across organization</p>
            </div>
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500">Total Requests</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{timeOffSummary.total}</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-100 dark:border-amber-900/40">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Pending</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{timeOffSummary.pending}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Approved</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{timeOffSummary.approved}</p>
            </div>
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 border border-rose-100 dark:border-rose-900/40">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">Rejected</span>
              <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{timeOffSummary.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts Row */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Enterprise System Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 4).map((alt, idx) => (
              <div key={idx} className="text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${alt.severity === "error" ? "bg-rose-500" : "bg-amber-500"}`} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{alt.title || alt.type}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
