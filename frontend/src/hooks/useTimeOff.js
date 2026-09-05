import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import timeOffService from "../services/timeOffService";
import employeeService from "../services/employeeService";

export function useTimeOffRequests() {
  return useQuery({
    queryKey: ["timeOffRequests"],
    queryFn: timeOffService.getAllRequests,
  });
}

export function useTimeOffTypes() {
  return useQuery({
    queryKey: ["timeOffTypes"],
    queryFn: timeOffService.getTypes,
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
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.getAll,
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
    },
  });
}

export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => timeOffService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
    },
  });
}

export function useLeaveAllocations() {
  return useQuery({
    queryKey: ["leaveAllocations"],
    queryFn: timeOffService.getAllocations,
  });
}

export function useLeaveAllocationDetails(id) {
  return useQuery({
    queryKey: ["leaveAllocation", id],
    queryFn: () => timeOffService.getAllocationById(id),
    enabled: Boolean(id),
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


