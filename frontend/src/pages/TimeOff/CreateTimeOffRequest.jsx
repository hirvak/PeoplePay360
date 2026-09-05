import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  useTimeOffTypes,
  useEmployees,
  useCreateTimeOffRequest,
} from "@/hooks/useTimeOff";

// Zod Validation Schema
const createRequestSchema = z
  .object({
    employee_id: z.string().min(1, "Employee selection is required"),
    leave_type_id: z.string().min(1, "Time Off Type selection is required"),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End Date cannot be before Start Date",
      path: ["end_date"],
    }
  );

export default function CreateTimeOffRequest() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: leaveTypes = [], isLoading: loadingTypes } = useTimeOffTypes();
  const createMutation = useCreateTimeOffRequest();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      employee_id: "",
      leave_type_id: "",
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Calculate inclusive duration in days
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  const onSubmit = async (data) => {
    setErrorMsg("");
    try {
      const payload = {
        employee_id: parseInt(data.employee_id, 10),
        leave_type_id: parseInt(data.leave_type_id, 10),
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason || "",
        requested_amount: durationDays > 0 ? durationDays : 1,
      };

      await createMutation.mutateAsync(payload);
      navigate("/time-off/requests", {
        state: { message: "Time off request created successfully." },
      });
    } catch (err) {
      console.error("Create request failed:", err);
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit time off request. Please try again."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/time-off/requests")}
          className="text-slate-600 border-slate-200 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Requests
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Time Off Request
        </h1>
        <p className="text-sm text-slate-500">
          Submit a new time off request for an employee.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive" title="Submission Error">
          {errorMsg}
        </Alert>
      )}

      {/* Main Form Card */}
      <Card className="border-slate-200 bg-white shadow-md rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Time Off Details</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Select employee, leave category, and requested date range.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <span>Employee *</span>
                </label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  {...register("employee_id")}
                >
                  <option value="">
                    {loadingEmployees ? "Loading employees..." : "-- Select Employee --"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code || `ID #${emp.id}`})
                    </option>
                  ))}
                </select>
                {errors.employee_id && (
                  <p className="text-xs text-rose-600">{errors.employee_id.message}</p>
                )}
              </div>

              {/* Time Off Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" />
                  <span>Time Off Type *</span>
                </label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  {...register("leave_type_id")}
                >
                  <option value="">
                    {loadingTypes ? "Loading time off types..." : "-- Select Time Off Type --"}
                  </option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} {type.is_paid ? "(Paid)" : "(Unpaid)"}
                    </option>
                  ))}
                </select>
                {errors.leave_type_id && (
                  <p className="text-xs text-rose-600">{errors.leave_type_id.message}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Start Date *
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="text-xs text-rose-600">{errors.start_date.message}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  End Date *
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  {...register("end_date")}
                />
                {errors.end_date && (
                  <p className="text-xs text-rose-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Duration Display Box */}
            <div className="p-3.5 rounded-lg bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-purple-900">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Calculated Duration:</span>
              </div>
              <div className="text-sm font-bold text-purple-700">
                {durationDays > 0 ? `${durationDays} Day${durationDays > 1 ? "s" : ""}` : "—"}
              </div>
            </div>

            {/* Description / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                <span>Reason / Description</span>
              </label>
              <textarea
                rows={3}
                placeholder="Brief description or reason for time off request..."
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-xs text-rose-600">{errors.reason.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/time-off/requests")}
              disabled={isSubmitting || createMutation.isPending}
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
