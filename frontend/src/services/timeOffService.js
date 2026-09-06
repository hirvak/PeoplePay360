import api from "./api";

const timeOffService = {
  // Employee Self-Service
  getMyRequests: async () => {
    const response = await api.get("/leave/my-requests");
    return response.data;
  },

  getMyBalance: async () => {
    const response = await api.get("/leave/my-balance");
    return response.data;
  },

  createMyRequest: async (data) => {
    const response = await api.post("/leave/my-requests", data);
    return response.data;
  },

  // HR Time Off Types
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

  // HR Leave Allocations
  getAllocations: async () => {
    const response = await api.get("/leave/allocations");
    return response.data;
  },

  getAllocationById: async (id) => {
    const response = await api.get(`/leave/allocations/${id}`);
    return response.data;
  },

  createAllocation: async (data) => {
    const response = await api.post("/leave/allocations", data);
    return response.data;
  },

  updateAllocation: async (id, data) => {
    const response = await api.put(`/leave/allocations/${id}`, data);
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

  deleteAllocation: async (id) => {
    const response = await api.delete(`/leave/allocations/${id}`);
    return response.data;
  },

  // HR Leave Requests Management
  getAllRequests: async () => {
    const response = await api.get("/leave/requests");
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/leave/requests/${id}`);
    return response.data;
  },

  createRequest: async (data) => {
    const response = await api.post("/leave/requests", data);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await api.put(`/leave/requests/${id}`, data);
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
};

export default timeOffService;
