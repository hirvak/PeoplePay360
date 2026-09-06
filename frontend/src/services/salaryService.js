import api from "./api";

const normalizeRuleType = (type) => {
  if (!type) return "Fixed";
  const t = String(type).toLowerCase();
  if (t.includes("percent")) return "Percentage";
  if (t.includes("formula")) return "Formula";
  return "Fixed";
};

const normalizeCategory = (cat) => {
  if (!cat) return "EARNING";
  if (cat === "Allowance" || cat === "EARNING") return "EARNING";
  return "DEDUCTION";
};

const salaryService = {
  // Salary Structures
  getStructures: async () => {
    const response = await api.get("/salary-structures/");
    return response.data;
  },

  getAllStructures: async () => {
    const response = await api.get("/salary-structures/");
    return response.data;
  },

  getStructureById: async (id) => {
    const response = await api.get(`/salary-structures/${id}`);
    return response.data;
  },

  createStructure: async (data) => {
    const response = await api.post("/salary-structures/", data);
    return response.data;
  },

  updateStructure: async (id, data) => {
    const response = await api.put(`/salary-structures/${id}`, data);
    return response.data;
  },

  deleteStructure: async (id) => {
    const response = await api.delete(`/salary-structures/${id}`);
    return response.data;
  },

  // Salary Rules
  getRules: async () => {
    const response = await api.get("/salary-rules/");
    return response.data;
  },

  getAllRules: async () => {
    const response = await api.get("/salary-rules/");
    return response.data;
  },

  getRuleById: async (id) => {
    const response = await api.get(`/salary-rules/${id}`);
    return response.data;
  },

  createRule: async (data) => {
    const normType = normalizeRuleType(data.rule_type || data.calculation_method);
    const payload = {
      salary_structure_id: Number(data.salary_structure_id),
      name: data.name,
      code: data.code,
      sequence: Number(data.sequence || 1),
      rule_type: normType,
      category: normalizeCategory(data.category),
      base_code: data.base_code || (normType === "Percentage" ? "BASIC" : null),
      amount: data.amount !== undefined && data.amount !== null && data.amount !== "" ? Number(data.amount) : null,
      percentage: data.percentage !== undefined && data.percentage !== null && data.percentage !== "" ? Number(data.percentage) : null,
      formula: data.formula || null,
    };
    const response = await api.post("/salary-rules/", payload);
    return response.data;
  },

  updateRule: async (id, data) => {
    const payload = { ...data };
    if (payload.rule_type || payload.calculation_method) {
      payload.rule_type = normalizeRuleType(payload.rule_type || payload.calculation_method);
    }
    if (payload.category) {
      payload.category = normalizeCategory(payload.category);
    }
    if (payload.rule_type === "Percentage" && !payload.base_code) {
      payload.base_code = "BASIC";
    }
    if (payload.amount !== undefined && payload.amount !== null && payload.amount !== "") {
      payload.amount = Number(payload.amount);
    }
    if (payload.percentage !== undefined && payload.percentage !== null && payload.percentage !== "") {
      payload.percentage = Number(payload.percentage);
    }
    delete payload.category_type;
    delete payload.calculation_method;
    const response = await api.put(`/salary-rules/${id}`, payload);
    return response.data;
  },

  deleteRule: async (id) => {
    const response = await api.delete(`/salary-rules/${id}`);
    return response.data;
  },
};

export default salaryService;
