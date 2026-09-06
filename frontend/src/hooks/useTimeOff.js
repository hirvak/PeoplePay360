import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import timeOffService from "../services/timeOffService";
import employeeService from "../services/employeeService";
import { useAuth } from "../context/AuthContext";

export function useTimeOffRequests() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  return useQuery({
    queryKey: ["timeOffRequests", isEmployee ? "me" : "all"],
    queryFn: isEmployee ? timeOffService.getMyRequests : timeOffService.getAllRequests,
    enabled: Boolean(user),
  });
}

export function useTimeOffTypes() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  return useQuery({
    queryKey: ["timeOffTypes"],
    queryFn: timeOffService.getTypes,
    enabled: Boolean(user) && !isEmployee,
  });
}

export function useTimeOffTypeDetails(id) {
  return useQuery({
    queryKey: ["timeOffType", String(id)],
    queryFn: () => timeOffService.getTypeById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTimeOffType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => timeOffService.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeOffTypes"] });
    },
  });
}

export function useUpdateTimeOffType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timeOffService.updateType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["timeOffTypes"] });
      queryClient.invalidateQueries({ queryKey: ["timeOffType", String(id)] });
    },
  });
}

export function useDeleteTimeOffType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeOffTypes"] });
    },
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

export function useTimeOffRequestDetails(id) {
  return useQuery({
    queryKey: ["timeOffRequest", id],
    queryFn: () => timeOffService.getRequestById(id),
    enabled: Boolean(id),
  });
}

export function useApproveTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.approveRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      queryClient.invalidateQueries({ queryKey: ["timeOffRequest", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
    },
  });
}

export function useRejectTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.rejectRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      queryClient.invalidateQueries({ queryKey: ["timeOffRequest", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
    },
  });
}

export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => timeOffService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
    },
  });
}

export function useLeaveAllocations() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  return useQuery({
    queryKey: ["leaveAllocations", isEmployee ? "me" : "all"],
    queryFn: isEmployee ? timeOffService.getMyBalance : timeOffService.getAllocations,
    enabled: Boolean(user),
  });
}

export function useLeaveAllocationDetails(id) {
  return useQuery({
    queryKey: ["leaveAllocation", String(id)],
    queryFn: () => timeOffService.getAllocationById(id),
    enabled: Boolean(id),
  });
}

export function useCreateLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => timeOffService.createAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
    },
  });
}

export function useUpdateLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timeOffService.updateAllocation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocation", String(id)] });
    },
  });
}

export function useApproveLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.approveAllocation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocation", String(id)] });
    },
  });
}

export function useRejectLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.rejectAllocation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["leaveAllocation", String(id)] });
    },
  });
}

export function useDeleteLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => timeOffService.deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveAllocations"] });
    },
  });
}


