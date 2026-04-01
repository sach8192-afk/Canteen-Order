import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, AuthUser } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string, role?: "customer" | "kitchen") => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const savedToken = authService.getToken();
    const savedUser = authService.getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, role: "customer" | "kitchen" = "customer") => {
    try {
      setError(null);
      const response = await authService.register(name, email, password, role);
      authService.saveToken(response.token);
      authService.saveUser(response.user);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const message = err.message || "Registration failed";
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      authService.saveToken(response.token);
      authService.saveUser(response.user);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const message = err.message || "Login failed";
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
