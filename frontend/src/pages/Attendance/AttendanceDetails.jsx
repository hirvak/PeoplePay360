import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Clock,
  User,
  Building2,
  Edit3,
  FileText,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  useAttendanceDetails,
  useEmployees,
  useDepartments,
  useUpdateAttendance,
  useDeleteAttendance,
} from "@/hooks/useAttendance";

// Zod Validation Schema for Manual Correction
const correctionSchema = z
  .object({
    attendance_date: z.string().min(1, "Attendance date is required"),
    check_in: z.string().nullable().optional(),
    check_out: z.string().nullable().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.check_in && data.check_out) {
        return data.check_out >= data.check_in;
      }
      return true;
    },
    {
      message: "Check-out time cannot be earlier than check-in time",
      path: ["check_out"],
    }
  );

export default function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { data: attendance, isLoading, isError, error, refetch } = useAttendanceDetails(id);
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();

  const updateMutation = useUpdateAttendance();
  const deleteMutation = useDeleteAttendance();

  // Find related employee & department details
  const employee = employees.find((e) => e.id === attendance?.employee_id);
  const manager = employees.find((e) => e.id === employee?.manager_id);
  const department = departments.find((d) => d.id === employee?.department_id);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(correctionSchema),
  });

  // Populate form state when record loads or modal opens
  useEffect(() => {
    if (attendance) {
      reset({
        attendance_date: attendance.attendance_date || "",
        check_in: attendance.check_in ? attendance.check_in.slice(0, 5) : "",
        check_out: attendance.check_out ? attendance.check_out.slice(0, 5) : "",
        notes: notes || "System-generated from check-in/check-out or manually corrected by an authorized user.",
      });
    }
  }, [attendance, reset, editModalOpen]);

  const handleCorrectionSubmit = async (formData) => {
    setSubmitError("");
    setSuccessMessage("");

    try {
      await updateMutation.mutateAsync({
        id: attendance.id,
        data: {
          attendance_date: formData.attendance_date,
          check_in: formData.check_in ? `${formData.check_in}:00` : null,
          check_out: formData.check_out ? `${formData.check_out}:00` : null,
        },
      });

      if (formData.notes) {
        setNotes(formData.notes);
      }

      setSuccessMessage("Attendance record manually corrected successfully!");
      setEditModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Failed to update attendance record.";
      setSubmitError(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(attendance.id);
      navigate("/attendance");
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Failed to delete attendance record.";
      setSubmitError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !attendance) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Alert variant="destructive" title="Attendance Record Not Found">
          <p className="mt-1">
            {error?.response?.data?.detail || "The requested attendance record could not be loaded."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/attendance")}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Attendance List
            </Button>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const employeeName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : `Employee #${attendance.employee_id}`;

  const managerName = manager
    ? `${manager.first_name} ${manager.last_name}`
    : "—";

  const departmentName = department ? department.name : "Unassigned";

  // Overtime Calculation (standard 8.0 hr workday threshold)
  const workedHours = attendance.worked_hours || 0;
  const overtimeHours = workedHours > 8.0 ? (workedHours - 8.0).toFixed(2) : "0.00";
  const isPresent = attendance.status === "Present" || Boolean(attendance.check_in);

  // Formatted date for header (e.g. 02-Sep-2026)
  const formattedDate = new Date(attendance.attendance_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Link to="/attendance" className="hover:text-purple-700 transition">
              Attendance
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-700 font-semibold">{employeeName}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">{formattedDate}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Attendance / {employeeName} / {formattedDate}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Form view of one attendance record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/attendance")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          <Button
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1" />
            Manual Correction
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="px-2.5"
            title="Delete Record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" title="Updated">
          {successMessage}
        </Alert>
      )}

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <Card className="border-slate-200 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Attendance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {/* Employee */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</span>
              <div className="flex items-center gap-2 text-right">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                  {employee ? `${employee.first_name[0]}${employee.last_name[0]}` : "EM"}
                </div>
                <span className="text-sm font-bold text-slate-900">{employeeName}</span>
              </div>
            </div>

            {/* Check In */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</span>
              <span className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                {attendance.check_in ? attendance.check_in.slice(0, 5) : "—"}
              </span>
            </div>

            {/* Check Out */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</span>
              <span className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                {attendance.check_out ? attendance.check_out.slice(0, 5) : "—"}
              </span>
            </div>

            {/* Worked Hours */}
            <div className="flex items-center justify-between py-3 bg-purple-50/60 rounded-lg px-3 border border-purple-100">
              <div>
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">Worked Hours</span>
                <span className="text-[11px] text-purple-600">Influence payroll calculation</span>
              </div>
              <span className="text-xl font-extrabold text-purple-700">
                {workedHours.toFixed(2)} hrs
              </span>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN */}
        <Card className="border-slate-200 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Organizational Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {/* Department */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
              <span className="text-sm font-semibold text-slate-800">{departmentName}</span>
            </div>

            {/* Manager */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager</span>
              <span className="text-sm font-medium text-slate-700">{managerName}</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              {isPresent ? (
                <Badge variant="success">Present</Badge>
              ) : (
                <Badge variant="destructive">Absent</Badge>
              )}
            </div>

            {/* Overtime */}
            <div className="flex items-center justify-between py-3 bg-amber-50/60 rounded-lg px-3 border border-amber-200/70">
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Overtime</span>
                <span className="text-[11px] text-amber-700">Hours exceeding 8.0 hr standard shift</span>
              </div>
              <span className={`text-xl font-extrabold ${Number(overtimeHours) > 0 ? "text-amber-700" : "text-slate-400"}`}>
                {overtimeHours} hrs
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOTES SECTION */}
      <Card className="border-slate-200 shadow-2xs">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
            {notes || (
              <span className="text-slate-600">
                System-generated from check-in/check-out or manually corrected by an authorized user.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Correction Dialog */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Manual Attendance Correction</DialogTitle>
              <DialogDescription>Modify check-in, check-out, date or notes for this employee</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCorrectionSubmit)} className="space-y-4 my-2">
          {/* Attendance Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Attendance Date *</label>
            <Input type="date" {...register("attendance_date")} />
            {errors.attendance_date && (
              <p className="text-xs text-rose-600">{errors.attendance_date.message}</p>
            )}
          </div>

          {/* Check In & Check Out */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Check In Time</label>
              <Input type="time" {...register("check_in")} />
              {errors.check_in && (
                <p className="text-xs text-rose-600">{errors.check_in.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Check Out Time</label>
              <Input type="time" {...register("check_out")} />
              {errors.check_out && (
                <p className="text-xs text-rose-600">{errors.check_out.message}</p>
              )}
            </div>
          </div>

          {/* Correction Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Correction Notes / Reason</label>
            <textarea
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs transition-colors placeholder:text-slate-400 focus-visible:outline-hidden focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20"
              placeholder="e.g. Manually corrected due to scanner malfunction."
              {...register("notes")}
            />
          </div>

          {submitError && (
            <Alert variant="destructive" title="Error">
              {submitError}
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-purple-600 text-white">
              {updateMutation.isPending ? "Saving..." : "Save Correction"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Delete Attendance Record</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this attendance record for {employeeName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Record"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
