import { useState, useMemo } from "react";
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
} from "lucide-react";
import { MOCK_PAYSLIPS } from "../../data/payrollData";

export default function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const payslip = useMemo(() => {
    if (location.state?.payslip) return location.state.payslip;
    return MOCK_PAYSLIPS.find((p) => p.id === id) || MOCK_PAYSLIPS[0];
  }, [id, location.state]);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    showToast(`Payslip voucher sent successfully to ${payslip.employee_name}'s email address!`);
  };

  const totalAllowances = useMemo(() => {
    if (payslip.allowances && Array.isArray(payslip.allowances)) {
      return payslip.allowances.reduce((sum, item) => sum + item.amount, 0);
    }
    return payslip.allowances_total || 2500;
  }, [payslip]);

  const totalDeductions = useMemo(() => {
    if (payslip.deductions && Array.isArray(payslip.deductions)) {
      return payslip.deductions.reduce((sum, item) => sum + item.amount, 0);
    }
    return payslip.deductions_total || 1200;
  }, [payslip]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/payslips")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Back to Payslips"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Payslip Voucher</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-mono font-medium text-slate-500">{payslip.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Payslip - {payslip.employee_name} ({payslip.period})
            </h1>
          </div>
        </div>

        {/* Print & Send Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>Print Payslip</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Send Payslip</span>
          </button>
        </div>
      </div>

      {/* Main Printable Payslip Document Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header / Company Branding */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white font-bold shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                PeoplePay<span className="text-purple-600">360</span> Inc.
              </h2>
              <p className="text-xs font-semibold text-slate-500">Official HR & Payroll Salary Advice Statement</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              Status: {payslip.status || "Validated"}
            </span>
            <p className="text-xs font-mono font-medium text-slate-500 mt-1">Voucher ID: {payslip.id}</p>
          </div>
        </div>

        {/* Employee & Pay Period Details (Two-Column Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-lg bg-slate-50 p-5 border border-slate-200 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-purple-700 border-b border-purple-100 pb-1 mb-2">
              Employee Details
            </h3>
            <p><strong className="text-slate-900">Employee Name:</strong> {payslip.employee_name}</p>
            <p><strong className="text-slate-900">Employee Code:</strong> {payslip.employee_code}</p>
            <p><strong className="text-slate-900">Department:</strong> {payslip.department}</p>
            <p><strong className="text-slate-900">Job Position:</strong> {payslip.job_position}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-purple-700 border-b border-purple-100 pb-1 mb-2">
              Payment & Bank Information
            </h3>
            <p><strong className="text-slate-900">Pay Period:</strong> {payslip.period}</p>
            <p><strong className="text-slate-900">Salary Structure:</strong> {payslip.structure_name}</p>
            <p><strong className="text-slate-900">Bank Name:</strong> {payslip.bank_name || "JPMorgan Chase Bank"}</p>
            <p><strong className="text-slate-900">Bank Account:</strong> {payslip.bank_account || "US8937492810472910"}</p>
          </div>
        </div>

        {/* Salary Computation Breakdown Tables (Earnings vs Deductions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Earnings & Allowances */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Earnings & Allowances</span>
              <span className="text-xs font-bold text-emerald-700">+ Amount</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900">Basic Monthly Salary</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 text-right">
                    ${(payslip.basic_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {payslip.allowances && Array.isArray(payslip.allowances) ? (
                  payslip.allowances.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-slate-700">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 text-right">
                        +${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">House Rent Allowance (HRA)</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 text-right">+$3,166.67</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">Transport Allowance</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 text-right">+$350.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">Medical Allowance</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700 text-right">+$250.00</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot className="bg-emerald-50/50 font-bold border-t border-slate-200">
                <tr>
                  <td className="px-4 py-2.5 text-slate-900">Total Gross Earnings</td>
                  <td className="px-4 py-2.5 text-emerald-800 text-right text-sm">
                    ${(payslip.gross_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section B: Deductions & Taxes */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Deductions & Withholdings</span>
              <span className="text-xs font-bold text-rose-700">- Amount</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <tbody className="divide-y divide-slate-100">
                {payslip.deductions && Array.isArray(payslip.deductions) ? (
                  payslip.deductions.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-slate-700">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 text-right">
                        -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">Professional Tax</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 text-right">-$150.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">Federal & State Income Tax</td>
                      <td className="px-4 py-2.5 font-semibold text-rose-600 text-right">-$1,400.00</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot className="bg-rose-50/50 font-bold border-t border-slate-200">
                <tr>
                  <td className="px-4 py-2.5 text-slate-900">Total Deductions</td>
                  <td className="px-4 py-2.5 text-rose-800 text-right text-sm">
                    -${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Salary Summary Box */}
        <div className="rounded-xl border-2 border-purple-600 bg-purple-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Net Salary Payable</span>
            <p className="text-3xl font-extrabold text-purple-900 mt-1">
              ${(payslip.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-purple-700 mt-0.5 font-medium">
              Gross Earnings (${payslip.gross_salary?.toLocaleString()}) - Deductions (${totalDeductions.toLocaleString()})
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
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">PeoplePay360 HR & Payroll Compliance System</p>
            <p className="text-[11px] mt-0.5">This is a system-generated salary voucher. Signature not required.</p>
          </div>

          <div className="text-right border-t border-slate-300 pt-2 w-48 text-slate-800 font-semibold">
            Authorized Payroll Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
