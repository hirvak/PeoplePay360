import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, FileSignature, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useContracts, useEmployees } from "@/hooks/useContracts";

export default function ContractsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: contracts = [], isLoading, isError, error, refetch } = useContracts();
  const { data: employees = [] } = useEmployees();

  // Create employee lookup map
  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(emp.id, emp);
    });
    return map;
  }, [employees]);

  // Helper to derive normalized status and display status
  const getDerivedStatus = (contract) => {
    const rawStatus = (contract.status || (contract.is_active ? "Running" : "Draft")).trim();
    const rawLower = rawStatus.toLowerCase();

    // Check if end_date has passed for date-based expired classification
    let isExpiredByDate = false;
    if (contract.end_date) {
      const endDate = new Date(contract.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (endDate < today && !["closed", "terminated", "cancelled", "draft"].includes(rawLower)) {
        isExpiredByDate = true;
      }
    }

    if (isExpiredByDate || rawLower === "expired") {
      return { key: "expired", label: "Expired", badgeVariant: "destructive" };
    }
    if (["running", "active"].includes(rawLower)) {
      return { key: "running", label: "Running", badgeVariant: "success" };
    }
    if (rawLower === "draft") {
      return { key: "draft", label: "Draft", badgeVariant: "secondary" };
    }
    if (["closed", "terminated", "cancelled"].includes(rawLower)) {
      return { key: "closed", label: "Closed", badgeVariant: "outline" };
    }

    return { key: rawLower, label: rawStatus, badgeVariant: "default" };
  };

  // Filter contracts by search query and status filter
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const emp = employeeMap.get(contract.employee_id);
      const empName = emp
        ? emp.first_name
          ? `${emp.first_name} ${emp.last_name || ""}`.trim()
          : emp.name || `Employee #${contract.employee_id}`
        : `Employee #${contract.employee_id}`;
      const empCode = emp?.employee_code || "";
      const position = contract.job_position || "";
      const refName = contract.reference || contract.name || contract.contract_ref || `CON/2026/${String(contract.id).padStart(3, "0")}`;

      const { key: statusKey, label: statusLabel } = getDerivedStatus(contract);

      // Filter by Status
      if (statusFilter !== "all") {
        if (statusFilter === "running" && statusKey !== "running") return false;
        if (statusFilter === "draft" && statusKey !== "draft") return false;
        if (statusFilter === "expired" && statusKey !== "expired") return false;
        if (statusFilter === "closed" && statusKey !== "closed") return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          empName.toLowerCase().includes(q) ||
          empCode.toLowerCase().includes(q) ||
          refName.toLowerCase().includes(q) ||
          position.toLowerCase().includes(q) ||
          statusLabel.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [contracts, employeeMap, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Contracts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">List view of employee contracts</p>
        </div>

        <div>
          <Button
            onClick={() => navigate("/contracts/new")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 bg-white dark:bg-[#211D20] shadow-2xs border-slate-200 dark:border-[#40383D]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="closed">Closed</option>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 self-start md:self-auto"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table / State Container */}
      {isError ? (
        <Alert variant="destructive" title="Failed to load contracts">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span>{error?.response?.data?.detail || error?.message || "Could not connect to contracts API."}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="w-fit">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <Card className="overflow-hidden shadow-2xs border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/80">
                <TableHead className="font-semibold">Contract</TableHead>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Start</TableHead>
                <TableHead className="font-semibold">End</TableHead>
                <TableHead className="font-semibold text-right">Wage / Month</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContracts.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={6} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 dark:text-slate-500 py-8">
                      <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-500 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                        <FileSignature className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                          {hasActiveFilters ? "No matching contracts found" : "No contract records found"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                          {hasActiveFilters
                            ? "No contracts match your search query or selected status filter."
                            : "There are currently no employment contracts registered in the system."}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 text-xs">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Contracts Data Rows
                filteredContracts.map((contract) => {
                  const emp = employeeMap.get(contract.employee_id);
                  const empName = emp
                    ? emp.first_name
                      ? `${emp.first_name} ${emp.last_name || ""}`.trim()
                      : emp.name || `Employee #${contract.employee_id}`
                    : `Employee #${contract.employee_id}`;
                  const empCode = emp?.employee_code || "";

                  const refCode =
                    contract.reference ||
                    contract.name ||
                    contract.contract_ref ||
                    `CON/2026/${String(contract.id).padStart(3, "0")}`;

                  const { label: statusLabel, badgeVariant } = getDerivedStatus(contract);

                  const wageValue = contract.wage ?? contract.salary ?? contract.basic_salary;
                  const formattedSalary =
                    wageValue !== undefined && wageValue !== null && !isNaN(Number(wageValue))
                      ? `₹${Number(wageValue).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "—";

                  return (
                    <TableRow
                      key={contract.id}
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                      className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                    >
                      {/* 1. Contract Reference Column */}
                      <TableCell className="font-mono text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline">
                        {refCode}
                      </TableCell>

                      {/* 2. Employee Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0">
                            {emp?.first_name ? `${emp.first_name[0]}${emp.last_name ? emp.last_name[0] : ""}` : "CT"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">{empName}</div>
                            {empCode && <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{empCode}</div>}
                          </div>
                        </div>
                      </TableCell>

                      {/* 3. Start Date Column */}
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {contract.start_date || "—"}
                      </TableCell>

                      {/* 4. End Date Column */}
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {contract.end_date ? (
                          contract.end_date
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">—</span>
                        )}
                      </TableCell>

                      {/* 5. Wage / Month Column */}
                      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                        {formattedSalary}
                      </TableCell>

                      {/* 6. Status Column */}
                      <TableCell>
                        <Badge variant={badgeVariant} className="capitalize">
                          {statusLabel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}



