import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Tag,
  Check,
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useTimeOffTypes } from "@/hooks/useTimeOff";

export default function TimeOffTypesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [successBanner, setSuccessBanner] = useState(location.state?.message || "");

  const {
    data: timeOffTypes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTimeOffTypes();

  // Search filtering based on actual backend fields: name, description, unit
  const filteredTypes = useMemo(() => {
    return timeOffTypes.filter((type) => {
      const name = type.name || "";
      const description = type.description || "";
      const unit = type.unit || "";

      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        unit.toLowerCase().includes(query)
      );
    });
  }, [timeOffTypes, searchQuery]);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium">
        <XCircle className="h-3 w-3 mr-1 text-slate-500" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Time Off Types
            </h1>
            <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border-purple-200 dark:border-purple-800">
              {timeOffTypes.length}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage the different types of time off available to employees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition cursor-pointer"
            onClick={() => navigate("/time-off/types/new")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Time Off Type
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner("")}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search & Refresh */}
      <Card className="p-4 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search time off types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-[#40383D]"
              title="Refresh time off types"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* UI States & Time Off Types Table */}
      <Card className="border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs overflow-hidden">
        {/* Error State */}
        {isError && (
          <div className="p-6">
            <Alert variant="destructive" title="Failed to load time off types">
              {error?.response?.data?.detail ||
                error?.message ||
                "An unexpected error occurred while fetching time off types."}
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isError && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredTypes.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 mb-3">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No Time Off Types Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No time off types matching "${searchQuery}". Try clearing search.`
                : "There are no time off types defined in the system yet."}
            </p>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && filteredTypes.length > 0 && (
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-900/80">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Description</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Unit</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Allocation Required</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Approval Required</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Paid</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTypes.map((type) => (
                <TableRow
                  key={type.id}
                  onClick={() => navigate(`/time-off/types/${type.id}`)}
                  className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 border-slate-100 dark:border-slate-800 transition cursor-pointer"
                >
                  {/* Name */}
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <span className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline">{type.name}</span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm max-w-xs truncate">
                    {type.description || "-"}
                  </TableCell>

                  {/* Unit */}
                  <TableCell className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                    {type.unit || "days"}
                  </TableCell>

                  {/* Allocation Required */}
                  <TableCell className="text-center">
                    {type.requires_allocation ? (
                      <Badge className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-medium">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                        No
                      </Badge>
                    )}
                  </TableCell>

                  {/* Approval Required */}
                  <TableCell className="text-center">
                    {type.requires_approval ? (
                      <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-medium">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                        No
                      </Badge>
                    )}
                  </TableCell>

                  {/* Paid */}
                  <TableCell className="text-center">
                    {type.is_paid ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium">
                        Unpaid
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    {getStatusBadge(type.is_active)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center justify-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/time-off/types/${type.id}`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/time-off/types/${type.id}/edit`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        title="Edit Type"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

