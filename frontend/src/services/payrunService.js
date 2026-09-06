import api from "./api";

const payrunService = {
  getAll: async () => {
    const response = await api.get("/payruns/");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payruns/${id}`);
    return response.data;
  },

  getEligibleEmployees: async (salaryStructureId, periodStart, periodEnd) => {
    const response = await api.get("/payruns/eligible-employees", {
      params: {
        salary_structure_id: salaryStructureId,
        period_start: periodStart,
        period_end: periodEnd,
      },
    });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/payruns/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/payruns/${id}`, data);
    return response.data;
  },

  calculate: async (id) => {
    const response = await api.post(`/payruns/${id}/calculate`);
    return response.data;
  },

  validate: async (id) => {
    const response = await api.post(`/payruns/${id}/validate`);
    return response.data;
  },

  finalize: async (id) => {
    const response = await api.post(`/payruns/${id}/finalize`);
    return response.data;
  },

  markPaid: async (id) => {
    const response = await api.post(`/payruns/${id}/mark-paid`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/payruns/${id}`);
    return response.data;
  },
};

export default payrunService;
