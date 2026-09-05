const API_BASE_URL = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("peoplepay360_token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};


const getAll = async () => {
  const response = await fetch(
    `${API_BASE_URL}/employees/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to fetch employees"
    );
  }

  return await response.json();
};


const getById = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/employees/${id}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to fetch employee"
    );
  }

  return await response.json();
};


const employeeService = {
  getAll,
  getById,
};

export default employeeService;