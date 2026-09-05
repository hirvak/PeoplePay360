import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEFAULT_MOCK_USER = {
  id: 1,
  email: "sarah.johnson@peoplepay360.com",
  name: "Sarah Johnson",
  role: "HR Manager",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_MOCK_USER);
  const [token, setToken] = useState("mock-jwt-token");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    const mockProfile = {
      id: 1,
      email: credentials?.username || "sarah.johnson@peoplepay360.com",
      name: "Sarah Johnson",
      role: "HR Manager",
    };
    setUser(mockProfile);
    setToken("mock-jwt-token");
    return mockProfile;
  };

  const registerUser = async (userData) => {
    const newProfile = {
      id: Date.now(),
      email: userData.email,
      name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "New User",
      role: userData.role || "Employee",
    };
    setUser(newProfile);
    setToken("mock-jwt-token");
    return newProfile;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: true,
    isLoading,
    login,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
