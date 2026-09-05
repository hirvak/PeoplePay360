import { useState, useMemo } from "react";
import { X, ArrowRight, ArrowLeft, Check, Users, DollarSign, Calendar, FileText, Search } from "lucide-react";
import { MOCK_EMPLOYEES, MOCK_SALARY_STRUCTURES } from "../../data/payrollData";

export default function PayrunWizardModal({ isOpen, onClose, onCreatePayrun }) {
  const [step, setStep] = useState(1); // 1 = Scope Selection, 2 = Employee Selection

  // Step 1 State
  const [selectedStructureId, setSelectedStructureId] = useState("STR-001");
  const [selectedPeriod, setSelectedPeriod] = useState("March 2026");

  // Step 2 State
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(["1", "2", "3"]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const selectedStructure = useMemo(() => {
    return MOCK_SALARY_STRUCTURES.find((s) => s.id === selectedStructureId) || MOCK_SALARY_STRUCTURES[0];
  }, [selectedStructureId]);

  // Filtered employees for Step 2
  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      if (!employeeSearch.trim()) return true;
      const term = employeeSearch.toLowerCase();
      return (
        emp.first_name.toLowerCase().includes(term) ||
        emp.last_name.toLowerCase().includes(term) ||
        emp.employee_code.toLowerCase().includes(term) ||
        emp.department_name.toLowerCase().includes(term)
      );
    });
  }, [employeeSearch]);

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

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2); // Step 1 does NOT create the payrun; it advances to Step 2
  };

  const handleCreatePayrunSubmit = () => {
    if (selectedEmployeeIds.length === 0) return;

    const selectedEmps = MOCK_EMPLOYEES.filter((emp) => selectedEmployeeIds.includes(emp.id));
    const totalGross = selectedEmps.reduce((sum, emp) => sum + (emp.monthly_basic * 1.45), 0);
    const totalDeductions = selectedEmps.reduce((sum, emp) => sum + (emp.monthly_basic * 0.18), 0);
    const totalNet = totalGross - totalDeductions;

    const newPayrun = {
      id: `PAY-2026-0${Math.floor(Math.random() * 90) + 10}`,
      name: `${selectedPeriod} Payroll Run`,
      period: selectedPeriod,
      structure_name: selectedStructure.name,
      employee_count: selectedEmps.length,
      selected_employee_ids: selectedEmployeeIds,
      total_gross: Math.round(totalGross),
      total_deductions: Math.round(totalDeductions),
      total_net: Math.round(totalNet),
      status: "Draft",
      created_at: new Date().toISOString().split("T")[0],
      warning: null,
    };

    onCreatePayrun(newPayrun);
  };

  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every((emp) => selectedEmployeeIds.includes(emp.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl my-8 transition-all">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                Step {step} of 2
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase">Payrun Creation Wizard</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {step === 1 ? "Step 1: Payroll Scope & Structure" : "Step 2: Select Employees"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-purple-600" : "bg-slate-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-purple-600" : "bg-slate-200"}`} />
        </div>

        {/* STEP 1: Payroll Scope */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Salary Structure *
              </label>
              <select
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                {MOCK_SALARY_STRUCTURES.map((struct) => (
                  <option key={struct.id} value={struct.id}>
                    {struct.name} ({struct.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">{selectedStructure.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Payroll Period *
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-hidden"
              >
                <option value="March 2026">March 2026 (Upcoming)</option>
                <option value="February 2026">February 2026</option>
                <option value="January 2026">January 2026</option>
                <option value="December 2025">December 2025</option>
              </select>
            </div>

            <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Selected Configuration Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-700">
                <div>Structure: <strong className="text-purple-700">{selectedStructure.name}</strong></div>
                <div>Target Period: <strong className="text-purple-700">{selectedPeriod}</strong></div>
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
                  Selected: {selectedEmployeeIds.length} of {MOCK_EMPLOYEES.length}
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
                    <th scope="col" className="p-3">Department</th>
                    <th scope="col" className="p-3">Working Schedule</th>
                    <th scope="col" className="p-3">Base Salary</th>
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
                          <span className="block font-mono text-[10px] font-normal text-slate-500">{emp.employee_code}</span>
                        </td>
                        <td className="p-3 text-slate-600">{emp.department_name}</td>
                        <td className="p-3 text-slate-600">{emp.schedule_name}</td>
                        <td className="p-3 font-bold text-emerald-700">${emp.base_salary.toLocaleString()} / yr</td>
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
                disabled={selectedEmployeeIds.length === 0}
                onClick={handleCreatePayrunSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Create Payrun ({selectedEmployeeIds.length} Selected)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
