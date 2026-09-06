import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Download,
  Loader2,
} from "lucide-react";
import payslipService from "../../services/payslipService";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";
import { useAuth } from "../../context/AuthContext";

export default function PayslipsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const [payslips, setPayslips] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeesMap, setEmployeesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayslipsAndDepts = async () => {
    try {
      setLoading(true);
      if (isEmployee) {
        const [slips, myEmp] = await Promise.all([
          payslipService.getMyPayslips().catch(() => []),
          employeeService.getMe().catch(() => null),
        ]);
        setPayslips(slips || []);
        setDepartments([]);
        const map = new Map();
        if (myEmp) {
          map.set(myEmp.id, myEmp);
        }
        setEmployeesMap(map);
      } else {
        const [slips, depts, emps] = await Promise.all([
          payslipService.getAll().catch(() => []),
          departmentService.getAll().catch(() => []),
          employeeService.getAll().catch(() => []),
        ]);
        setPayslips(slips || []);
        setDepartments(depts || []);
        const map = new Map();
        if (Array.isArray(emps)) {
          emps.forEach((emp) => map.set(emp.id, emp));
        }
        setEmployeesMap(map);
      }
    } catch (err) {
      console.error("Failed to load payslips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslipsAndDepts();
  }, [isEmployee]);

  const availablePeriods = useMemo(() => {
    const periodSet = new Set();
    payslips.forEach((ps) => {
      if (ps.period_start) {
        const d = new Date(ps.period_start);
        if (!isNaN(d.getTime())) {
          periodSet.add(d.toLocaleString("en-US", { month: "long", year: "numeric" }));
        }
      }
    });
    ["February 2026", "January 2026", "December 2025"].forEach((p) => periodSet.add(p));
    return Array.from(periodSet);
  }, [payslips]);

  const handleDownloadPdf = async (id, e) => {
    e.stopPropagation();
    try {
      if (isEmployee) {
        await payslipService.downloadMyPdf(id);
      } else {
        await payslipService.downloadPdf(id);
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const filteredPayslips = useMemo(() => {
    return payslips.filter((ps) => {
      const emp = employeesMap.get(ps.employee_id);
      const empName = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : (ps.employee_name || `Employee #${ps.employee_id}`);
      const empCode = emp?.employee_code || ps.employee_code || `EMP-${ps.employee_id}`;
      const deptName = emp?.department?.name || emp?.department_name || ps.department || "N/A";

      if (periodFilter !== "all") {
        const psPeriod = ps.period_start ? new Date(ps.period_start).toLocaleString("en-US", { month: "long", year: "numeric" }) : ps.period;
        if (psPeriod !== periodFilter) return false;
      }

      if (departmentFilter !== "all" && deptName.toLowerCase() !== departmentFilter.toLowerCase()) {
        return false;
      }

      if (statusFilter !== "all" && ps.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        empName.toLowerCase().includes(term) ||
        empCode.toLowerCase().includes(term) ||
        deptName.toLowerCase().includes(term) ||
        (ps.payrun_name && ps.payrun_name.toLowerCase().includes(term)) ||
        String(ps.id).includes(term) ||
        String(ps.payrun_id).includes(term)
      );
    });
  }, [payslips, employeesMap, searchTerm, periodFilter, departmentFilter, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Paid
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Validated
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {status || "Computed"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payslips</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredPayslips.length} Payslips
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse all itemized employee payslips, salary computations, and print payment vouchers.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, code, payslip ID..."
            className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-purple-600 focus:outline-hidden shadow-xs [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
          >
            <option value="all">All Periods</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-purple-600 focus:outline-hidden shadow-xs [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-purple-600 focus:outline-hidden shadow-xs [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="calculated">Calculated</option>
            <option value="validated">Validated</option>
            <option value="finalized">Finalized</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#40383D]">
              <tr>
                <th scope="col" className="px-6 py-3.5">Employee</th>
                <th scope="col" className="px-6 py-3.5">Payrun</th>
                <th scope="col" className="px-6 py-3.5">Period</th>
                <th scope="col" className="px-6 py-3.5">Worked Days</th>
                <th scope="col" className="px-6 py-3.5">Basic Salary</th>
                <th scope="col" className="px-6 py-3.5">Gross Salary</th>
                <th scope="col" className="px-6 py-3.5">Net Salary</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#40383D] bg-white dark:bg-[#211D20]">
              {filteredPayslips.map((ps) => {
                const emp = employeesMap.get(ps.employee_id);
                const empName = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : (ps.employee_name || `Employee #${ps.employee_id}`);
                const empCode = emp?.employee_code || ps.employee_code || `EMP-${ps.employee_id}`;
                const dept = emp?.department?.name || emp?.department_name || ps.department || "N/A";
                const periodText = ps.period || (ps.period_start && ps.period_end ? `${ps.period_start} ~ ${ps.period_end}` : "N/A");
                const basicVal = Number(ps.basic_wage ?? ps.basic_salary ?? 0);
                const grossVal = Number(ps.gross_amount ?? ps.gross_salary ?? 0);
                const netVal = Number(ps.net_amount ?? ps.net_salary ?? 0);
                const workedDaysDisplay = ps.worked_days ? `${ps.worked_days} / ${ps.total_days || 22} d` : "Not specified";

                return (
                <tr
                  key={ps.id}
                  onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                  className="hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition cursor-pointer group"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-xs">
                        {`${empName[0] || ""}${empName.split(" ")[1]?.[0] || ""}`}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                          {empName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{empCode} • {dept}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs max-w-[160px] truncate">
                    {ps.payrun_name || `Payrun #${ps.payrun_id}`}
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs font-medium">
                    {periodText}
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs font-mono">
                    {workedDaysDisplay}
                  </td>

                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">
                    ₹{basicVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 text-slate-900 dark:text-white font-bold whitespace-nowrap">
                    ₹{grossVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 font-extrabold text-purple-700 dark:text-purple-400 whitespace-nowrap">
                    ₹{netVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ps.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadPdf(ps.id, e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    </div>
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

