import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileSignature, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

import contractService from "@/services/contractService";
import employeeService from "@/services/employeeService";
import departmentService from "@/services/departmentService";
import scheduleService from "@/services/scheduleService";
import salaryService from "@/services/salaryService";

export default function CreateContractPage() {
  const navigate = useNavigate();

  // Dropdown options data from backend APIs
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);

  // Page state
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form Fields
  const [formData, setFormData] = useState({
    employee_id: "",
    job_position: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    wage: "",
    department_id: "",
    schedule_id: "",
    salary_structure_id: "",
    status: "Active",
  });

  // Load dropdown options from backend
  useEffect(() => {
    async function loadFormOptions() {
      setIsLoadingDropdowns(true);
      setErrorMessage("");
      try {
        const [empRes, deptRes, schedRes, structRes] = await Promise.all([
          employeeService.getAll().catch(() => []),
          departmentService.getAll().catch(() => []),
          scheduleService.getAll().catch(() => []),
          salaryService.getAllStructures().catch(() => []),
        ]);

        const empList = Array.isArray(empRes) ? empRes : [];
        setEmployees(empList);
        setDepartments(Array.isArray(deptRes) ? deptRes : []);
        setSchedules(Array.isArray(schedRes) ? schedRes : []);
        setSalaryStructures(Array.isArray(structRes) ? structRes : []);

        if (empList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            employee_id: empList[0].id,
            job_position: empList[0].job_position || empList[0].title || "Software Developer",
            department_id: empList[0].department_id || "",
          }));
        }
      } catch (err) {
        console.error("Error loading dropdown data:", err);
        setErrorMessage("Failed to load required options from server. Please try refreshing.");
      } finally {
        setIsLoadingDropdowns(false);
      }
    }

    loadFormOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-fill job position/department when employee changes if not filled
      if (name === "employee_id") {
        const selectedEmp = employees.find((emp) => String(emp.id) === String(value));
        if (selectedEmp) {
          if (selectedEmp.job_position) updated.job_position = selectedEmp.job_position;
          if (selectedEmp.department_id) updated.department_id = selectedEmp.department_id;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.employee_id) {
      setErrorMessage("Please select an employee.");
      return;
    }

    if (!formData.job_position.trim()) {
      setErrorMessage("Please enter a job position.");
      return;
    }

    if (!formData.start_date) {
      setErrorMessage("Please select a start date.");
      return;
    }

    if (!formData.wage || isNaN(Number(formData.wage)) || Number(formData.wage) <= 0) {
      setErrorMessage("Please enter a valid wage amount greater than 0.");
      return;
    }

    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      setErrorMessage("End date cannot be prior to start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        employee_id: Number(formData.employee_id),
        job_position: formData.job_position.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date ? formData.end_date : null,
        wage: Number(formData.wage),
        department_id: formData.department_id ? Number(formData.department_id) : null,
        schedule_id: formData.schedule_id ? Number(formData.schedule_id) : null,
        salary_structure_id: formData.salary_structure_id ? Number(formData.salary_structure_id) : null,
        status: formData.status || "Active",
      };

      await contractService.create(payload);
      setSuccessMessage("Contract created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/contracts");
      }, 1200);
    } catch (err) {
      console.error("Failed to create contract:", err);
      const backendError = err?.response?.data?.detail;
      if (Array.isArray(backendError)) {
        setErrorMessage(backendError.map((e) => e.msg).join(", "));
      } else if (typeof backendError === "string") {
        setErrorMessage(backendError);
      } else {
        setErrorMessage(err.message || "Failed to create contract. Please check form values.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            to="/contracts"
            className="inline-flex items-center text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Contracts
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            New Contract
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create a new employment contract and specify compensation details.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <Alert variant="destructive" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {/* Form Container */}
      <Card className="shadow-2xs border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20]">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Contract Information
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {isLoadingDropdowns ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-purple-700 dark:text-purple-400 mb-2" />
                <span className="text-sm">Loading options from server...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Employee Selection */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="employee_id"
                    required
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => {
                      const empName = emp.first_name
                        ? `${emp.first_name} ${emp.last_name || ""}`.trim()
                        : emp.name || `Employee #${emp.id}`;
                      const empCode = emp.employee_code ? ` (${emp.employee_code})` : "";
                      return (
                        <option key={emp.id} value={emp.id}>
                          {empName}
                          {empCode}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Job Position */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Job Position <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="job_position"
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.job_position}
                    onChange={handleChange}
                    className="bg-white dark:bg-[#211D20]"
                  />
                </div>

                {/* 3. Wage / Salary */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Wage / Monthly Salary (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="wage"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 5000.00"
                    value={formData.wage}
                    onChange={handleChange}
                    className="bg-white dark:bg-[#211D20] font-mono"
                  />
                </div>

                {/* 4. Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className="bg-white dark:bg-[#211D20]"
                  />
                </div>

                {/* 5. End Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    End Date <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="bg-white dark:bg-[#211D20]"
                  />
                </div>

                {/* 6. Department */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Department <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name || dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Working Schedule */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Working Schedule <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="schedule_id"
                    value={formData.schedule_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="">-- Select Schedule --</option>
                    {schedules.map((sched) => (
                      <option key={sched.id} value={sched.id}>
                        {sched.name} ({sched.hours_per_week || 40} hrs/week)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Salary Structure */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Salary Structure <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="salary_structure_id"
                    value={formData.salary_structure_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="">-- Select Salary Structure --</option>
                    {salaryStructures.map((struct) => (
                      <option key={struct.id} value={struct.id}>
                        {struct.name} ({struct.type || "Standard"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 9. Contract Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-[#40383D] bg-white dark:bg-[#211D20] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-hidden [&>option]:bg-white [&>option]:dark:bg-[#211D20]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80 p-4 bg-slate-50/50 dark:bg-slate-900/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/contracts")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isLoadingDropdowns}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Contract"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
