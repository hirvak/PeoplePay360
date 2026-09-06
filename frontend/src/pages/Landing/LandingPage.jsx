import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  UserCheck,
  Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-purple-500 selection:text-white">
      {/* Background Decorators */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-300/30 dark:bg-purple-800/15 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              PeoplePay<span className="text-purple-600 dark:text-purple-400">360</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-400 leading-none">
              HR & PAYROLL SUITE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Landing Sections */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 space-y-24 py-16">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Next-Generation HR & Payroll Automation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Manage Your People. <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Simplify Your Payroll.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PeoplePay360 brings workforce management, employment contracts, attendance tracking, leave requests, and automated multi-tier payroll processing into one unified, enterprise-grade platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Login to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/register"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-7 py-3.5 text-sm font-bold shadow-xs transition-all"
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Complete HR & Payroll Capabilities
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Everything your organization needs to manage employees, track attendance, and compute accurate payroll runs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Employee Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Centralized workforce profiles, department hierarchies, role assignments, and personal records management.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contracts & Schedules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track employment contracts, wage agreements, active vs historical states, and custom working schedules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance & Time Off</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitor daily check-ins/outs, worked hours, leave allocations, balance tracking, and manager approval flows.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Salary Structures & Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Configure earnings, allowances, tax deductions, fixed rates, percentages, and formula-based rule engines.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payroll Processing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-stage payrun lifecycle (Draft → Calculated → Validated → Finalized → Paid) with real backend computation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payslips & Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Itemized payslip generation, instant binary PDF voucher downloads, and automated bulk email delivery.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How PeoplePay360 Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              A seamless automated workflow connecting employee onboarding to payroll payout.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: "01", title: "Employees", desc: "Workforce directory" },
              { step: "02", title: "Contracts", desc: "Wages & schedules" },
              { step: "03", title: "Attendance", desc: "Time & leave tracking" },
              { step: "04", title: "Salary Rules", desc: "Earnings & deductions" },
              { step: "05", title: "Payruns", desc: "Compute & validate" },
              { step: "06", title: "Payslips", desc: "PDF & email delivery" },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center space-y-2 shadow-2xs"
              >
                <span className="inline-block text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                  STEP {s.step}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ROLE-BASED PLATFORM SECTION */}
        <section className="space-y-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-purple-50/50 via-white to-transparent dark:from-purple-950/20 dark:via-slate-900 dark:to-transparent p-8 sm:p-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Role-Based Enterprise Security
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Granular access control tailored specifically to each team member's role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { role: "Employee", desc: "View personal profile, submit time off requests, check attendance, download payslips." },
              { role: "HR Manager", desc: "Manage workforce profiles, department structures, contracts, schedules, and leave approvals." },
              { role: "HR Payroll User", desc: "Process payruns, view payslips, and inspect salary structures with read-only protection." },
              { role: "HR Payroll Manager", desc: "Configure salary structures & rules, compute payruns, validate, finalize, and disburse paid runs." },
              { role: "Admin", desc: "Complete platform access, platform configuration, and user role administration." },
            ].map((r) => (
              <div key={r.role} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <UserCheck className="h-4 w-4" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{r.role}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="text-center space-y-6 py-8 rounded-3xl bg-purple-600 dark:bg-purple-900 text-white p-8 sm:p-12 shadow-xl shadow-purple-600/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to simplify HR & Payroll?
          </h2>
          <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto">
            Experience the automated workforce suite built for modern organizations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="rounded-xl bg-white text-purple-700 hover:bg-slate-100 px-6 py-3 text-sm font-bold shadow-md transition-all"
            >
              Login Now
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-purple-400/60 bg-purple-700/50 hover:bg-purple-700 text-white px-6 py-3 text-sm font-bold shadow-xs transition-all"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-slate-800 dark:text-slate-200">PeoplePay360</span>
          <span>— HR & Payroll Suite</span>
        </div>
        <p>© {new Date().getFullYear()} PeoplePay360 Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
