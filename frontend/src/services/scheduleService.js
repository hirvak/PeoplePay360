import api from "./api";

const scheduleService = {
  getAll: async () => {
    const response = await api.get("/schedules/");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  getMySchedule: async () => {
    const response = await api.get("/schedules/me");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/schedules/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

export default scheduleService;
