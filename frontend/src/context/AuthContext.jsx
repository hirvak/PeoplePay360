import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCachedUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    async function initAuth() {
      const currentToken = authService.getToken();
      if (currentToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          setToken(currentToken);
        } catch (err) {
          console.warn("Token validation failed:", err);
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
    const data = await authService.login(credentials);
    const profile = await authService.getMe();
    setUser(profile);
    setToken(data.access_token);
    return profile;
  };

  const registerUser = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
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
