import { useState, useMemo } from "react";
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
} from "lucide-react";
import { MOCK_PAYSLIPS, MOCK_DEPARTMENTS } from "../../data/payrollData";

export default function PayslipsPage() {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState(MOCK_PAYSLIPS);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayslips = useMemo(() => {
    return payslips.filter((ps) => {
      if (periodFilter !== "all" && ps.period !== periodFilter) return false;
      if (departmentFilter !== "all" && ps.department !== departmentFilter) return false;
      if (statusFilter !== "all" && ps.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        ps.employee_name.toLowerCase().includes(term) ||
        ps.employee_code.toLowerCase().includes(term) ||
        ps.payrun_name.toLowerCase().includes(term) ||
        ps.id.toLowerCase().includes(term)
      );
    });
  }, [payslips, searchTerm, periodFilter, departmentFilter, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            Validated
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
            Computed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payslips</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {filteredPayslips.length} Payslips
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse all itemized employee payslips, salary computations, and print payment vouchers.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, code, payslip ID..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-hidden shadow-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-600 focus:outline-hidden shadow-xs"
          >
            <option value="all">All Periods</option>
            <option value="February 2026">February 2026</option>
            <option value="January 2026">January 2026</option>
            <option value="December 2025">December 2025</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-600 focus:outline-hidden shadow-xs"
          >
            <option value="all">All Departments</option>
            {MOCK_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-600 focus:outline-hidden shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="validated">Validated</option>
            <option value="paid">Paid</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredPayslips.map((ps) => (
                <tr
                  key={ps.id}
                  onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                  className="hover:bg-purple-50/50 transition cursor-pointer group"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-xs">
                        {`${ps.employee_name[0] || ""}${ps.employee_name.split(" ")[1]?.[0] || ""}`}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 transition">
                          {ps.employee_name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">{ps.employee_code} • {ps.department}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap text-xs max-w-[160px] truncate">
                    {ps.payrun_name}
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap text-xs font-medium">
                    {ps.period}
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap text-xs font-mono">
                    {ps.worked_days} / {ps.total_days} d
                  </td>

                  <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">
                    ${(ps.basic_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 text-slate-900 font-bold whitespace-nowrap">
                    ${(ps.gross_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 font-extrabold text-purple-700 whitespace-nowrap">
                    ${(ps.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ps.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View & Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
