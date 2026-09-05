import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MOCK_ATTENDANCES = [
  {
    id: 1,
    employee_name: "John Smith",
    employee_code: "EMP-001",
    date: "2024-03-01",
    check_in: "09:00 AM",
    check_out: "05:00 PM",
    work_hours: "8h 00m",
    status: "Present",
  },
  {
    id: 2,
    employee_name: "Sarah Johnson",
    employee_code: "EMP-002",
    date: "2024-03-01",
    check_in: "08:55 AM",
    check_out: "05:15 PM",
    work_hours: "8h 20m",
    status: "Present",
  },
  {
    id: 3,
    employee_name: "Michael Brown",
    employee_code: "EMP-003",
    date: "2024-03-01",
    check_in: "09:15 AM",
    check_out: "05:00 PM",
    work_hours: "7h 45m",
    status: "Late",
  },
];

const MOCK_EMPLOYEES = [
  { id: 1, first_name: "John", last_name: "Smith", employee_code: "EMP-001" },
  { id: 2, first_name: "Sarah", last_name: "Johnson", employee_code: "EMP-002" },
  { id: 3, first_name: "Michael", last_name: "Brown", employee_code: "EMP-003" },
];

const MOCK_DEPARTMENTS = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Human Resources" },
  { id: 3, name: "Finance & Payroll" },
];

export function useAttendances() {
  return useQuery({
    queryKey: ["attendances"],
    queryFn: async () => MOCK_ATTENDANCES,
  });
}

export function useAttendanceDetails(id) {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => MOCK_ATTENDANCES.find((a) => String(a.id) === String(id)) || MOCK_ATTENDANCES[0],
    enabled: Boolean(id),
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => MOCK_EMPLOYEES,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => MOCK_DEPARTMENTS,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => ({ id, ...data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.id] });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => id,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}
