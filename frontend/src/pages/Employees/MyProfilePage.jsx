import { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase, Building2, Calendar, ShieldCheck, Clock, Award, AlertCircle, Loader2 } from "lucide-react";
import employeeService from "../../services/employeeService";
import { useAuth } from "../../context/AuthContext";

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadMyProfile() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await employeeService.getMe();
        setProfile(data);
      } catch (err) {
        console.error("Error loading employee profile:", err);
        setErrorMsg(err?.response?.data?.detail || err.message || "Failed to load employee profile.");
      } finally {
        setLoading(false);
      }
    }
    loadMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (errorMsg && !profile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your official personal, organizational, and employment profile details.
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Unable to Load Profile</h3>
              <p className="text-sm mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = profile?.first_name || user?.first_name || "";
  const lastName = profile?.last_name || user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Employee";
  const initials = `${firstName[0] || "E"}${lastName[0] || ""}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your official personal, organizational, and employment profile details.
        </p>
      </div>

      {/* Main Profile Summary Header Card */}
      <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-2xl font-extrabold text-white shadow-md">
          {initials}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              {profile?.is_active !== false ? "Active Employee" : "Inactive"}
            </span>
          </div>

          <p className="text-sm text-purple-700 dark:text-purple-400 font-semibold">
            {profile?.job_position || profile?.job_title || "Not assigned"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-purple-600" />
              {profile?.department?.name || profile?.department || "Not assigned"}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Award className="h-3.5 w-3.5 text-purple-600" />
              Code: {profile?.employee_code || (profile?.id ? `EMP-${profile.id}` : "N/A")}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal & Contact Information */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Personal Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{firstName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{lastName || "Not assigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Work Email</span>
              <span className="font-medium text-purple-700 dark:text-purple-400">{profile?.work_email || user?.email || "Not assigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile Phone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.mobile_phone || profile?.phone || "Not assigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Status</span>
              <span className="font-semibold text-emerald-600">{profile?.is_active !== false ? "Active & Verified" : "Inactive"}</span>
            </div>
          </div>
        </div>

        {/* Employment & Organizational Information */}
        <div className="rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Briefcase className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Employment & Organization</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Position</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile?.job_position || profile?.job_title || "Not assigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile?.department?.name || profile?.department || "Unassigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Manager</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.manager_name || profile?.manager || "Not assigned"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Working Schedule</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.working_hours || profile?.schedule_name || "Standard (40 hrs/wk)"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee Role</span>
              <span className="font-bold text-purple-700 dark:text-purple-400">{user?.role || "Employee"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
