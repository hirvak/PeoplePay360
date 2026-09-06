import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCachedUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const loginData = {
      email: credentials.email || credentials.username,
      password: credentials.password,
    };
    await authService.login(loginData);
    const profile = await authService.getMe();
    setUser(profile);
    setToken(authService.getToken());
    return profile;
  };

  const registerUser = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    role: user?.role || "",
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    registerUser,
    logout,
    hasRole,
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

