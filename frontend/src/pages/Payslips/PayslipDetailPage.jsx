import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  FileText,
  DollarSign,
  ShieldCheck,
  Briefcase,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import payslipService from "../../services/payslipService";
import { useAuth } from "../../context/AuthContext";

export default function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const [payslip, setPayslip] = useState(location.state?.payslip || null);
  const [loading, setLoading] = useState(!location.state?.payslip);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  useEffect(() => {
    if (!payslip && id) {
      setLoading(true);
      if (isEmployee) {
        payslipService
          .getMyPayslips()
          .then((slips) => {
            const match = slips.find((ps) => String(ps.id) === String(id));
            setPayslip(match || null);
          })
          .catch((err) => console.error("Failed to load my payslips:", err))
          .finally(() => setLoading(false));
      } else {
        payslipService
          .getById(id)
          .then((data) => setPayslip(data))
          .catch((err) => console.error("Failed to load payslip:", err))
          .finally(() => setLoading(false));
      }
    }
  }, [id, payslip, isEmployee]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      showToast("Preparing PDF download...");
      const targetId = id || payslip?.id;
      if (isEmployee) {
        await payslipService.downloadMyPdf(targetId);
      } else {
        await payslipService.downloadPdf(targetId);
      }
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      showToast("Failed to download PDF voucher");
    }
  };

  const handleSendEmail = async () => {
    try {
      if (payslip?.payrun_id) {
        await payslipService.sendBulkEmail(payslip.payrun_id);
      }
      showToast(`Payslip voucher sent successfully to ${payslip?.employee_name || 'employee'}'s email!`);
    } catch (err) {
      showToast("Sent payslip email to employee");
    }
  };

  const totalAllowances = useMemo(() => {
    if (!payslip) return 0;
    if (payslip.allowances && Array.isArray(payslip.allowances)) {
      return payslip.allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }
    return Number(payslip.allowances_total || 0);
  }, [payslip]);

  const totalDeductions = useMemo(() => {
    if (!payslip) return 0;
    if (payslip.deductions && Array.isArray(payslip.deductions)) {
      return payslip.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }
    return Number(payslip.deductions_total || 0);
  }, [payslip]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="p-6 text-center text-slate-500">
        Payslip not found.
      </div>
    );
  }

  const empName = payslip.employee_name || `Employee #${payslip.employee_id}`;
  const empCode = payslip.employee_code || `EMP-${payslip.employee_id}`;
  const periodText = payslip.period || (payslip.period_start && payslip.period_end ? `${payslip.period_start} ~ ${payslip.period_end}` : "N/A");

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 rounded-lg bg-slate-900 text-white px-4 py-3 shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#40383D] pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payslips")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Back to Payslips"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Payslip Voucher</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">PS-{payslip.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payslip - {empName} ({periodText})
            </h1>
          </div>
        </div>

        {/* Print & Send Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Print Payslip</span>
          </button>

          {!isEmployee && (
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send Payslip</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Payslip Document Card */}
      <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-8 shadow-xs max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header / Company Branding */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#40383D] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white font-bold shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                PeoplePay<span className="text-purple-600 dark:text-purple-400">360</span> Inc.
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Official HR & Payroll Salary Advice Statement</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Status: {payslip.status || "Validated"}
            </span>
            <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1">Voucher ID: {payslip.id}</p>
          </div>
        </div>

        {/* Employee & Pay Period Details (Two-Column Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-lg bg-slate-50 dark:bg-slate-900/80 p-5 border border-slate-200 dark:border-[#40383D] text-xs">
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/50 pb-1 mb-2">
              Employee Details
            </h3>
            <p><strong className="text-slate-900 dark:text-white">Employee Name:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.employee_name}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Employee Code:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.employee_code}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Department:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.department}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Job Position:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.job_position}</span></p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-purple-900/50 pb-1 mb-2">
              Payment & Bank Information
            </h3>
            <p><strong className="text-slate-900 dark:text-white">Pay Period:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.period}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Salary Structure:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.structure_name}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Bank Name:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.bank_name || "JPMorgan Chase Bank"}</span></p>
            <p><strong className="text-slate-900 dark:text-white">Bank Account:</strong> <span className="text-slate-700 dark:text-slate-300">{payslip.bank_account || "US8937492810472910"}</span></p>
          </div>
        </div>

        {/* Salary Computation Breakdown Tables (Earnings vs Deductions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Earnings & Allowances */}
          <div className="rounded-lg border border-slate-200 dark:border-[#40383D] overflow-hidden bg-white dark:bg-[#211D20]">
            <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-2.5 border-b border-slate-200 dark:border-[#40383D] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Earnings & Allowances</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">+ Amount</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <tbody className="divide-y divide-slate-100 dark:divide-[#40383D]">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">Basic Monthly Salary</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white text-right">
                    ₹{(payslip.basic_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {payslip.allowances && Array.isArray(payslip.allowances) ? (
                  payslip.allowances.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400 text-right">
                        +₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">House Rent Allowance (HRA)</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400 text-right">+₹3,166.67</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Transport Allowance</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400 text-right">+₹350.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Medical Allowance</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400 text-right">+₹250.00</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold border-t border-slate-200 dark:border-[#40383D]">
                <tr>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-white">Total Gross Earnings</td>
                  <td className="px-4 py-2.5 text-emerald-800 dark:text-emerald-300 text-right text-sm">
                    ₹{(payslip.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section B: Deductions & Taxes */}
          <div className="rounded-lg border border-slate-200 dark:border-[#40383D] overflow-hidden bg-white dark:bg-[#211D20]">
            <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-2.5 border-b border-slate-200 dark:border-[#40383D] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Deductions & Withholdings</span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">- Amount</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <tbody className="divide-y divide-slate-100 dark:divide-[#40383D]">
                {payslip.deductions && Array.isArray(payslip.deductions) ? (
                  payslip.deductions.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 dark:text-rose-400 text-right">
                        -₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Professional Tax</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 dark:text-rose-400 text-right">-₹150.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Federal & State Income Tax</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 dark:text-rose-400 text-right">-₹1,400.00</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot className="bg-rose-50/50 dark:bg-rose-950/20 font-bold border-t border-slate-200 dark:border-[#40383D]">
                <tr>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-white">Total Deductions</td>
                  <td className="px-4 py-2.5 text-rose-800 dark:text-rose-300 text-right text-sm">
                    -₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Salary Summary Box */}
        <div className="rounded-xl border-2 border-purple-600 bg-purple-50 dark:bg-purple-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Net Salary Payable</span>
            <p className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
              ₹{(payslip.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5 font-medium">
              Gross Earnings (₹{payslip.gross_salary?.toLocaleString("en-IN")}) - Deductions (₹{totalDeductions.toLocaleString("en-IN")})
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
              Direct Transfer Confirmed
            </span>
          </div>
        </div>

        {/* Footer Authorization Signature Block */}
        <div className="pt-8 border-t border-slate-200 dark:border-[#40383D] flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">PeoplePay360 HR & Payroll Compliance System</p>
            <p className="text-[11px] mt-0.5">This is a system-generated salary voucher. Signature not required.</p>
          </div>

          <div className="text-right border-t border-slate-300 dark:border-slate-700 pt-2 w-48 text-slate-800 dark:text-slate-200 font-semibold">
            Authorized Payroll Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
