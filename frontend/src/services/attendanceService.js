import api from "./api";

export const attendanceService = {
  getAll: async () => {
    const response = await api.get("/attendance/");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get("/attendance/me");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/attendance/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

export default attendanceService;
