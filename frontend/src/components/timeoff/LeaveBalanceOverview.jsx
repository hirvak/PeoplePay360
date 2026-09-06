import { useLeaveAllocations } from "@/hooks/useTimeOff";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, ShieldCheck } from "lucide-react";

export function LeaveBalanceOverview({ className = "" }) {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  const {
    data: myBalance = [],
    isLoading,
    isError,
    error,
  } = useLeaveAllocations();

  return (
    <Card className={`p-5 border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] shadow-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Time Off Overview & Leave Balance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEmployee ? "Your approved leave allocations and available balance" : "Employee leave quota balances"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/40 text-[11px] font-semibold">
          <ShieldCheck className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
          Live Backend Balance
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Alert variant="destructive" title="Error">
          {error?.response?.data?.detail || error?.message || "Unable to load leave balance."}
        </Alert>
      ) : !Array.isArray(myBalance) || myBalance.length === 0 ? (
        <div className="py-6 text-center text-slate-500 dark:text-slate-400">
          <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            No approved leave allocation available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBalance.map((alloc) => {
            const typeName = alloc.leave_type?.name || `Leave Allocation #${alloc.id}`;
            const unitRaw = alloc.leave_type?.unit || "Days";
            const unitStr = unitRaw.toLowerCase();
            const allocatedVal = Number(alloc.allocated_amount || 0);
            const usedVal = Number(alloc.used_amount || 0);
            const availableVal =
              alloc.remaining_amount !== undefined && alloc.remaining_amount !== null
                ? Number(alloc.remaining_amount)
                : Math.max(0, allocatedVal - usedVal);

            // Unit helper
            const formatAmount = (val) => {
              const formattedVal = val % 1 === 0 ? val : val.toFixed(1);
              return `${formattedVal} ${val === 1 ? unitStr.replace(/s$/, "") : unitStr}`;
            };

            return (
              <div
                key={alloc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-purple-200 dark:hover:border-purple-800 transition"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {typeName}
                  </span>
                  {alloc.start_date && alloc.end_date && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {alloc.start_date} → {alloc.end_date}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Allocated
                    </span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatAmount(allocatedVal)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Used
                    </span>
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                      {formatAmount(usedVal)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Available
                    </span>
                    <span className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">
                      {formatAmount(availableVal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default LeaveBalanceOverview;
