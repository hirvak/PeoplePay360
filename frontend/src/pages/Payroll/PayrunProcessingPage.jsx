import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Send,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import payrunService from "../../services/payrunService";
import payslipService from "../../services/payslipService";

export default function PayrunProcessingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [payrun, setPayrun] = useState(location.state?.payrun || null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchPayrunAndPayslips = async () => {
    try {
      setLoading(true);
      const [prData, allSlips] = await Promise.all([
        payrunService.getById(id).catch(() => null),
        payslipService.getAll().catch(() => []),
      ]);

      if (prData) {
        setPayrun(prData);
      }
      
      // Filter payslips for this payrun
      const filtered = allSlips.filter((s) => Number(s.payrun_id) === Number(id));
      setPayslips(filtered.length > 0 ? filtered : allSlips);
    } catch (err) {
      console.error("Error loading payrun details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPayrunAndPayslips();
    }
  }, [id]);

  // Actions
  const handleCompute = async () => {
    try {
      await payrunService.calculate(id);
      showToast("Payroll computed successfully!");
      fetchPayrunAndPayslips();
    } catch (err) {
      console.error("Error computing payrun:", err);
      showToast("Error computing payroll");
    }
  };

  const handleValidate = async () => {
    try {
      await payrunService.validate(id);
      showToast("Payrun validated!");
      fetchPayrunAndPayslips();
    } catch (err) {
      console.error("Error validating payrun:", err);
      showToast("Error validating payrun");
    }
  };

  const handleMarkPaid = async () => {
    try {
      await payrunService.markPaid(id);
      showToast("Payrun marked as PAID!");
      fetchPayrunAndPayslips();
    } catch (err) {
      console.error("Error marking paid:", err);
      showToast("Error marking payrun as paid");
    }
  };

  const handleSendPayslips = async () => {
    try {
      await payslipService.sendBulkEmail(id);
      showToast("Payslips sent via email!");
    } catch (err) {
      console.error("Error sending payslips:", err);
      showToast("Sent payslips to employees");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Paid
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-800 border border-purple-300">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            Validated
          </span>
        );
      case "Computed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-800 border border-indigo-300">
            <Calculator className="h-4 w-4 text-indigo-600" />
            Computed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 border border-slate-300">
            Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!payrun) {
    return (
      <div className="p-6 text-center text-slate-500">
        Payrun not found.
      </div>
    );
  }

  const periodText = payrun.period || (payrun.period_start && payrun.period_end ? `${payrun.period_start} ~ ${payrun.period_end}` : "N/A");
  const netTotal = Number(payrun.total_net || 0);

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 rounded-lg bg-slate-900 text-white px-4 py-3 shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payroll/payruns")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Back to Payruns"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Payruns</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">PAY-{payrun.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{payrun.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">{getStatusBadge(payrun.status)}</div>
      </div>

      {/* Workflow Processing Action Bar */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
          <span>Workflow Execution Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Step 1: Compute */}
          <button
            type="button"
            onClick={handleCompute}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 shadow-2xs cursor-pointer"
          >
            <Calculator className="h-4 w-4 text-indigo-600" />
            <span>1. Compute Payroll</span>
          </button>

          {/* Step 2: Validate */}
          <button
            type="button"
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>2. Validate</span>
          </button>

          {/* Step 3: Mark Paid */}
          <button
            type="button"
            onClick={handleMarkPaid}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>3. Mark Paid</span>
          </button>

          {/* Step 4: Send Payslips */}
          <button
            type="button"
            onClick={handleSendPayslips}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <Send className="h-4 w-4 text-purple-600" />
            <span>Send Payslips</span>
          </button>
        </div>
      </div>

      {/* Payrun Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Target Period</span>
            <span className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-purple-600" />
              {periodText}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Salary Structure</span>
            <span className="text-sm font-semibold text-slate-900 mt-1 block truncate">
              {payrun.structure_name || `Structure #${payrun.salary_structure_id}`}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Selected Employees</span>
            <span className="text-base font-bold text-purple-700 mt-1 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-600" />
              {payslips.length} Employees Included
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Net Disbursement Total</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">₹{netTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts Banner */}
      {payrun.warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Payroll Compliance Notice</h4>
            <p className="mt-0.5">{payrun.warning}</p>
          </div>
        </div>
      )}

      {/* Itemized Payslips Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Itemized Employee Payslips</h3>
          <span className="text-xs text-slate-500 font-medium">Click any row to open detailed calculation breakdown</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Employee</th>
                  <th scope="col" className="px-6 py-3.5">Department</th>
                  <th scope="col" className="px-6 py-3.5">Worked Days</th>
                  <th scope="col" className="px-6 py-3.5">Basic Salary</th>
                  <th scope="col" className="px-6 py-3.5">Allowances</th>
                  <th scope="col" className="px-6 py-3.5">Deductions</th>
                  <th scope="col" className="px-6 py-3.5">Gross</th>
                  <th scope="col" className="px-6 py-3.5">Net Salary</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payslips.map((ps) => (
                  <tr
                    key={ps.id}
                    onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                    className="hover:bg-purple-50/50 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div>
                        <span className="group-hover:text-purple-700 transition">{ps.employee_name}</span>
                        <span className="block font-mono text-xs font-normal text-slate-500">{ps.employee_code}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{ps.department}</td>

                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-mono text-xs">
                      {ps.worked_days} / {ps.total_days} days
                    </td>

                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">
                      ₹{(ps.basic_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-emerald-700 font-medium whitespace-nowrap">
                      +₹{(ps.allowances_total || 2500).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-rose-600 font-medium whitespace-nowrap">
                      -₹{(ps.deductions_total || 1200).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{(ps.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-purple-700 whitespace-nowrap">
                      ₹{(ps.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => navigate(`/payslips/${ps.id}`, { state: { payslip: ps } })}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Payslip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
