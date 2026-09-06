import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import attendanceService from "../services/attendanceService";
import employeeService from "../services/employeeService";
import departmentService from "../services/departmentService";
import { useAuth } from "../context/AuthContext";

export function useAttendances() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  return useQuery({
    queryKey: ["attendances", isEmployee ? "me" : "all"],
    queryFn: isEmployee ? attendanceService.getMyAttendance : attendanceService.getAll,
    enabled: Boolean(user),
  });
}

export function useAttendanceDetails(id) {
  return useQuery({
    queryKey: ["attendance", String(id)],
    queryFn: () => attendanceService.getById(id),
    enabled: Boolean(id),
  });
}

export function useEmployees() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  return useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.getAll,
    enabled: Boolean(user) && !isEmployee,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getAll,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => attendanceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", String(variables.id)] });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}

