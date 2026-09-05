import api from "./api";

export const attendanceService = {
  // Get all attendance records
  getAll: async () => {
    const response = await api.get("/attendance/");
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.attendances)) return data.attendances;
    return [];
  },

  // Get single attendance record by ID
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // Create a new attendance record / check-in
  create: async (data) => {
    const response = await api.post("/attendance/", data);
    return response.data;
  },

  // Update / manually correct an attendance record
  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance record
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

export default attendanceService;
