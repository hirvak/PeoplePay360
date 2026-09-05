import api from "./api";

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
  const response = await api.post("/auth/login", credentials);
  const data = response.data;

  if (data.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }

  return data;
};


const getMe = async () => {
  const response = await api.get("/auth/me");
  const user = response.data;

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  return user;
};


const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
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