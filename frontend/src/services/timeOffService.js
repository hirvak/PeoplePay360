import api from "./api";

const timeOffService = {
  getAllRequests: async () => {
    const response = await api.get("/leave/requests");
    return response.data;
  },
  getRequestById: async (id) => {
    const response = await api.get(`/leave/requests/${id}`);
    return response.data;
  },
  approveRequest: async (id) => {
    const response = await api.post(`/leave/requests/${id}/approve`);
    return response.data;
  },
  rejectRequest: async (id) => {
    const response = await api.post(`/leave/requests/${id}/reject`);
    return response.data;
  },
  createRequest: async (data) => {
    const response = await api.post("/leave/requests", data);
    return response.data;
  },
  getTypes: async () => {
    const response = await api.get("/leave/types");
    return response.data;
  },
  getTypeById: async (id) => {
    const response = await api.get(`/leave/types/${id}`);
    return response.data;
  },
  createType: async (data) => {
    const response = await api.post("/leave/types", data);
    return response.data;
  },
  updateType: async (id, data) => {
    const response = await api.put(`/leave/types/${id}`, data);
    return response.data;
  },
  deleteType: async (id) => {
    const response = await api.delete(`/leave/types/${id}`);
    return response.data;
  },
  getAllocations: async () => {
    const response = await api.get("/leave/allocations");
    return response.data;
  },
  getAllocationById: async (id) => {
    const response = await api.get(`/leave/allocations/${id}`);
    return response.data;
  },
  approveAllocation: async (id) => {
    const response = await api.post(`/leave/allocations/${id}/approve`);
    return response.data;
  },
  rejectAllocation: async (id) => {
    const response = await api.post(`/leave/allocations/${id}/reject`);
    return response.data;
  },
};

export default timeOffService;
