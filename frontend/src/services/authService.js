const API_BASE_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "peoplepay360_token";
const USER_KEY = "peoplepay360_user";


const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};


const getCachedUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};


const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Login failed"
    );
  }

  const data = await response.json();

  localStorage.setItem(
    TOKEN_KEY,
    data.access_token
  );

  return data;
};


const getMe = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Authentication token is invalid");
  }

  const user = await response.json();

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  return user;
};


const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Registration failed"
    );
  }

  return await response.json();
};


const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};


const authService = {
  getToken,
  getCachedUser,
  login,
  getMe,
  register,
  logout,
};

export default authService;