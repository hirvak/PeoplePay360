import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  Tag,
  ShieldCheck,
  DollarSign,
  Layers,
  Power,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTimeOffTypeDetails,
  useUpdateTimeOffType,
} from "@/hooks/useTimeOff";

// Zod Validation Schema
const editTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  unit: z.enum(["days", "hours"], {
    required_error: "Unit selection is required",
  }),
  requires_allocation: z.boolean(),
  requires_approval: z.boolean(),
  is_paid: z.boolean(),
  is_active: z.boolean(),
  description: z.string().optional(),
});

export default function EditTimeOffType() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    data: timeOffType,
    isLoading: loadingDetails,
    isError: fetchError,
    error: fetchErrorData,
  } = useTimeOffTypeDetails(typeId);

  const updateMutation = useUpdateTimeOffType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editTypeSchema),
    defaultValues: {
      name: "",
      unit: "days",
      requires_allocation: true,
      requires_approval: true,
      is_paid: true,
      is_active: true,
      description: "",
    },
  });

  // Pre-fill form when backend data is loaded
  useEffect(() => {
    if (timeOffType) {
      reset({
        name: timeOffType.name || "",
        unit: timeOffType.unit || "days",
        requires_allocation: Boolean(timeOffType.requires_allocation),
        requires_approval: Boolean(timeOffType.requires_approval),
        is_paid: Boolean(timeOffType.is_paid),
        is_active: Boolean(timeOffType.is_active),
        description: timeOffType.description || "",
      });
    }
  }, [timeOffType, reset]);

  const onSubmit = async (data) => {
    setErrorMsg("");
    try {
      const payload = {
        name: data.name.trim(),
        unit: data.unit,
        requires_allocation: Boolean(data.requires_allocation),
        requires_approval: Boolean(data.requires_approval),
        is_paid: Boolean(data.is_paid),
        is_active: Boolean(data.is_active),
        description: data.description ? data.description.trim() : null,
      };

      await updateMutation.mutateAsync({ id: typeId, data: payload });
      navigate("/time-off/types", {
        state: { message: `Time off type "${data.name}" updated successfully.` },
      });
    } catch (err) {
      console.error("Update time off type failed:", err);
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update time off type. Please try again."
      );
    }
  };

  if (loadingDetails) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (fetchError || !timeOffType) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/time-off/types")}
          className="text-slate-600 border-slate-200 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Time Off Types
        </Button>

        <Alert variant="destructive" title="Time Off Type Not Found">
          {fetchErrorData?.response?.data?.detail ||
            "The requested time off type could not be loaded or does not exist."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/time-off/types/${typeId}`)}
          className="text-slate-600 border-slate-200 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Cancel & Back to Details
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit Time Off Type: {timeOffType.name}
        </h1>
        <p className="text-sm text-slate-500">
          Update configuration parameters and policies for this leave type.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive" title="Update Error">
          {errorMsg}
        </Alert>
      )}

      {/* Main Form Card */}
      <Card className="border-slate-200 bg-white shadow-md rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-600" />
              <span>Time Off Type Settings</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Modify time off properties, allocation requirement, and active status.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* General Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" />
                  <span>Time Off Type Name *</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Paid Time Off, Sick Leave"
                  className="bg-white"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600">{errors.name.message}</p>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-600" />
                  <span>Take Time Off In (Unit) *</span>
                </label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  {...register("unit")}
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                </select>
                {errors.unit && (
                  <p className="text-xs text-rose-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Rules & Status Card */}
            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Rules, Approvals & Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Allocation Required */}
                <label className="flex items-start gap-2.5 p-3 rounded-md bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500"
                    {...register("requires_allocation")}
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">Requires Allocation</span>
                    <span className="text-slate-500 text-[10px]">Needs allocated days</span>
                  </div>
                </label>

                {/* Approval Required */}
                <label className="flex items-start gap-2.5 p-3 rounded-md bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500"
                    {...register("requires_approval")}
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-amber-600" />
                      Requires Approval
                    </span>
                    <span className="text-slate-500 text-[10px]">Needs HR approval</span>
                  </div>
                </label>

                {/* Paid Time Off */}
                <label className="flex items-start gap-2.5 p-3 rounded-md bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500"
                    {...register("is_paid")}
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-emerald-600" />
                      Paid Leave
                    </span>
                    <span className="text-slate-500 text-[10px]">Paid time off</span>
                  </div>
                </label>

                {/* Status: Active / Inactive */}
                <label className="flex items-start gap-2.5 p-3 rounded-md bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500"
                    {...register("is_active")}
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block flex items-center gap-1">
                      <Power className="h-3 w-3 text-purple-600" />
                      Active Status
                    </span>
                    <span className="text-slate-500 text-[10px]">Available for selection</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                <span>Description / Usage Policy</span>
              </label>
              <textarea
                rows={3}
                placeholder="Description of leave policy..."
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-rose-600">{errors.description.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/time-off/types/${typeId}`)}
              disabled={isSubmitting || updateMutation.isPending}
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
            >
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
