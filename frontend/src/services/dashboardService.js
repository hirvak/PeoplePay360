import api from "./api";

const dashboardService = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getSalaryByDepartment: async () => {
    const response = await api.get("/dashboard/salary-by-department");
    return response.data;
  },

  getMonthlyNetSalary: async () => {
    const response = await api.get("/dashboard/monthly-net-salary");
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get("/dashboard/alerts");
    return response.data;
  },
};

export default dashboardService;
