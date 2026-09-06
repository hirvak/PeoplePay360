import api from "./api";

const adminService = {
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  updateStatus: async (id, is_active) => {
    const response = await api.put(`/admin/users/${id}/status`, { is_active });
    return response.data;
  },
};

export default adminService;
