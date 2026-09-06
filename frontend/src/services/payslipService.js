import api from "./api";

const payslipService = {
  getAll: async () => {
    const response = await api.get("/payslips/");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payslips/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/payslips/", data);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/payslips/${id}`);
    return response.data;
  },

  getMyPayslips: async () => {
    const response = await api.get("/payslips/me");
    return response.data;
  },

  downloadPdf: async (id) => {
    const response = await api.get(`/payslips/${id}/pdf`, {
      responseType: "blob",
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `payslip_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  downloadMyPdf: async (id) => {
    const response = await api.get(`/payslips/me/${id}/pdf`, {
      responseType: "blob",
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `my_payslip_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  sendPayrunPayslips: async (payrunId) => {
    const response = await api.post(`/payslips/payrun/${payrunId}/send-payslips`);
    return response.data;
  },

  sendBulkEmail: async (payrunId) => {
    const response = await api.post(`/payslips/payrun/${payrunId}/send-payslips`);
    return response.data;
  },
};

export default payslipService;
