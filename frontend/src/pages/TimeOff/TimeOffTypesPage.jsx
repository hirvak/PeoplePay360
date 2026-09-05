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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Time Off Types
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
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
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner("")}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search & Refresh */}
      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search time off types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
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
              className="text-slate-600 hover:text-slate-900 border-slate-200"
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
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Time Off Types Found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
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
            <TableHeader className="bg-slate-50/70">
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                <TableHead className="font-semibold text-slate-700">Unit</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Allocation Required</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Approval Required</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Paid</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTypes.map((type) => (
                <TableRow
                  key={type.id}
                  onClick={() => navigate(`/time-off/types/${type.id}`)}
                  className="hover:bg-purple-50/40 border-slate-100 transition cursor-pointer"
                >
                  {/* Name */}
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <span className="hover:text-purple-600 hover:underline">{type.name}</span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="text-slate-600 text-sm max-w-xs truncate">
                    {type.description || "-"}
                  </TableCell>

                  {/* Unit */}
                  <TableCell className="text-slate-700 font-medium capitalize">
                    {type.unit || "days"}
                  </TableCell>

                  {/* Allocation Required */}
                  <TableCell className="text-center">
                    {type.requires_allocation ? (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 font-medium">
                        No
                      </Badge>
                    )}
                  </TableCell>

                  {/* Approval Required */}
                  <TableCell className="text-center">
                    {type.requires_approval ? (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 font-medium">
                        No
                      </Badge>
                    )}
                  </TableCell>

                  {/* Paid */}
                  <TableCell className="text-center">
                    {type.is_paid ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-medium">
                        Unpaid
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    {getStatusBadge(type.is_active)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/time-off/types/${type.id}`)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/time-off/types/${type.id}/edit`)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Edit Type"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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

