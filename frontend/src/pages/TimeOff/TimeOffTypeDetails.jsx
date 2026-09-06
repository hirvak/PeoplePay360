import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  DollarSign,
  Layers,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTimeOffTypeDetails,
  useDeleteTimeOffType,
} from "@/hooks/useTimeOff";

export default function TimeOffTypeDetails() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const {
    data: timeOffType,
    isLoading,
    isError,
    error,
  } = useTimeOffTypeDetails(typeId);

  const deleteMutation = useDeleteTimeOffType();

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteMutation.mutateAsync(typeId);
      navigate("/time-off/types", {
        state: { message: "Time off type deleted successfully." },
      });
    } catch (err) {
      console.error("Delete time off type failed:", err);
      setDeleteError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete time off type."
      );
      setDeleteConfirm(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </Card>
      </div>
    );
  }

  if (isError || !timeOffType) {
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
          {error?.response?.data?.detail ||
            "The requested time off type could not be loaded or does not exist."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/time-off/types")}
          className="text-slate-600 border-slate-200 hover:bg-slate-100 w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Time Off Types
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/time-off/types/${typeId}/edit`)}
            className="text-purple-700 border-purple-200 hover:bg-purple-50 font-medium"
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit
          </Button>

          {!deleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="text-rose-700 border-rose-200 hover:bg-rose-50 font-medium"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1.5" />
                )}
                Confirm Delete
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Error Alert */}
      {deleteError && (
        <Alert variant="destructive" title="Deletion Error">
          {deleteError}
        </Alert>
      )}

      {/* Main Details Card */}
      <Card className="border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-md rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {timeOffType.name}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Type ID: #{timeOffType.id}
              </p>
            </div>
          </div>

          <div>
            {timeOffType.is_active ? (
              <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold px-3 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold px-3 py-1 text-xs">
                <XCircle className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                Inactive
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Unit */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Measurement Unit</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {timeOffType.unit || "days"}
              </span>
            </div>

            {/* Allocation Requirement */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Allocation Required</span>
              </div>
              <div>
                {timeOffType.requires_allocation ? (
                  <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-medium">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                    No
                  </Badge>
                )}
              </div>
            </div>

            {/* Approval Requirement */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Approval Required</span>
              </div>
              <div>
                {timeOffType.requires_approval ? (
                  <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-medium">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                    No
                  </Badge>
                )}
              </div>
            </div>

            {/* Paid Status */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Paid Time Off</span>
              </div>
              <div>
                {timeOffType.is_paid ? (
                  <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium">
                    Paid
                  </Badge>
                ) : (
                  <Badge className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium">
                    Unpaid
                  </Badge>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Created At</span>
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(timeOffType.created_at)}
              </span>
            </div>

            {/* Last Updated */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Last Updated</span>
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(timeOffType.updated_at)}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Description / Usage Policy</span>
            </h3>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {timeOffType.description || "No description provided for this time off type."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
