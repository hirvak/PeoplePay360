import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import contractService from "../services/contractService";
import employeeService from "../services/employeeService";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: contractService.getAll,
  });
}

export function useContractDetails(id) {
  return useQuery({
    queryKey: ["contract", id],
    queryFn: () => contractService.getById(id),
    enabled: Boolean(id),
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.getAll,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => contractService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => contractService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract", variables.id] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => contractService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
