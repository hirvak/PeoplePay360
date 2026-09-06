import { useState, useEffect, useMemo } from "react";
import { X, ArrowRight, ArrowLeft, Check, FileText, Search, Loader2 } from "lucide-react";
import salaryService from "../../services/salaryService";
import payrunService from "../../services/payrunService";
import employeeService from "../../services/employeeService";

export default function PayrunWizardModal({ isOpen, onClose, onCreatePayrun }) {
  const [step, setStep] = useState(1);
  const [structures, setStructures] = useState([]);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("March 2026 Payroll");
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [periodStart, setPeriodStart] = useState("2026-03-01");
  const [periodEnd, setPeriodEnd] = useState("2026-03-31");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoadingStructures(true);
      salaryService
        .getAllStructures()
        .then((data) => {
          setStructures(data);
          if (data.length > 0) {
            setSelectedStructureId(data[0].id);
          }
        })
        .catch((err) => console.error("Error fetching structures:", err))
        .finally(() => setLoadingStructures(false));
    }
  }, [isOpen]);

  const selectedStructure = useMemo(() => {
    return structures.find((s) => Number(s.id) === Number(selectedStructureId)) || structures[0];
  }, [structures, selectedStructureId]);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStep(2);
    setLoadingEmployees(true);
    try {
      // Try fetching eligible employees for selected structure & period
      const eligible = await payrunService
        .getEligibleEmployees(selectedStructureId, periodStart, periodEnd)
        .catch(() => null);

      if (eligible && Array.isArray(eligible) && eligible.length > 0) {
        setEligibleEmployees(eligible);
        setSelectedEmployeeIds(eligible.map((e) => e.id));
      } else {
        // Fallback to all employees if eligible list is empty or fails
        const allEmps = await employeeService.getAll();
        setEligibleEmployees(allEmps);
        setSelectedEmployeeIds(allEmps.map((e) => e.id));
      }
    } catch (err) {
      console.error("Error loading eligible employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return eligibleEmployees.filter((emp) => {
      if (!employeeSearch.trim()) return true;
      const term = employeeSearch.toLowerCase();
      const firstName = emp.first_name || "";
      const lastName = emp.last_name || "";
      const code = emp.employee_code || "";
      return (
        firstName.toLowerCase().includes(term) ||
        lastName.toLowerCase().includes(term) ||
        code.toLowerCase().includes(term)
      );
    });
  }, [eligibleEmployees, employeeSearch]);

  if (!isOpen) return null;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCreatePayrunSubmit = async () => {
    if (selectedEmployeeIds.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        name: name || `Payroll Run ${periodStart} - ${periodEnd}`,
        period_start: periodStart,
        period_end: periodEnd,
        salary_structure_id: Number(selectedStructureId),
        selected_employee_ids: selectedEmployeeIds.map((id) => Number(id)),
      };
      const created = await payrunService.create(payload);
      if (onCreatePayrun) {
        onCreatePayrun(created);
      }
      onClose();
    } catch (err) {
      console.error("Error creating payrun:", err);
      alert(err.response?.data?.detail || "Failed to create payrun");
    } finally {
      setSubmitting(false);
    }
  };

  const isAllSelected =
    filteredEmployees.length > 0 && filteredEmployees.every((emp) => selectedEmployeeIds.includes(emp.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] text-slate-800 dark:text-slate-100 p-6 shadow-xl my-8 transition-all">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                Step {step} of 2
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Payrun Creation Wizard</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {step === 1 ? "Step 1: Payroll Scope & Structure" : "Step 2: Select Employees"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-purple-600 dark:bg-purple-500" : "bg-slate-200 dark:bg-slate-800"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-purple-600 dark:bg-purple-500" : "bg-slate-200 dark:bg-slate-800"}`} />
        </div>

        {/* STEP 1: Payroll Scope */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payrun Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. March 2026 Payroll"
                className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Select Salary Structure *
              </label>
              {loadingStructures ? (
                <div className="p-2 text-xs text-slate-400">Loading structures...</div>
              ) : (
                <select
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                >
                  {structures.map((struct) => (
                    <option key={struct.id} value={struct.id}>
                      {struct.name} ({struct.code})
                    </option>
                  ))}
                </select>
              )}
              {selectedStructure && (
                <p className="text-xs text-slate-500 mt-1">{selectedStructure.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Period Start *
                </label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Period End *
                </label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Selected Configuration Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-700">
                <div>Structure: <strong className="text-purple-700">{selectedStructure?.name || "N/A"}</strong></div>
                <div>Target Period: <strong className="text-purple-700">{periodStart} to {periodEnd}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 shadow-xs cursor-pointer"
              >
                <span>Continue to Select Employees</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Employee Selection */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            {loadingEmployees ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* Search & Selection Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Search eligible employees by name, code..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                      Selected: {selectedEmployeeIds.length} of {eligibleEmployees.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIds([])}
                      className="text-slate-500 hover:text-slate-800 underline text-xs font-medium cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                {/* Selectable Employee Table */}
                <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="sticky top-0 bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th scope="col" className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </th>
                        <th scope="col" className="p-3">Employee</th>
                        <th scope="col" className="p-3">Code</th>
                        <th scope="col" className="p-3">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEmployees.map((emp) => {
                        const isChecked = selectedEmployeeIds.includes(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            onClick={() => handleToggleEmployee(emp.id)}
                            className={`hover:bg-purple-50/50 transition cursor-pointer ${isChecked ? "bg-purple-50/30" : ""}`}
                          >
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleEmployee(emp.id)}
                                className="rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {emp.first_name} {emp.last_name}
                            </td>
                            <td className="p-3 font-mono text-slate-600">{emp.employee_code || `EMP-${emp.id}`}</td>
                            <td className="p-3 text-slate-600">{emp.work_email || emp.email || "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedEmployeeIds.length === 0 && (
                  <p className="text-xs text-rose-500 font-medium">Please select at least 1 employee to include in this payrun.</p>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Step 1</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedEmployeeIds.length === 0 || submitting}
                    onClick={handleCreatePayrunSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Create Payrun ({selectedEmployeeIds.length} Selected)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

