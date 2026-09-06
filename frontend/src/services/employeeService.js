import api from "./api";

const employeeService = {
  getAll: async () => {
    const response = await api.get("/employees/");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/employees/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/employees/me");
    return response.data;
  },
};

export default employeeService;