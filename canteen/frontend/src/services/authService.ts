const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "kitchen";
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export const authService = {
  register: async (name: string, email: string, password: string, role: "customer" | "kitchen" = "customer"): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  getMe: async (token: string): Promise<{ success: boolean; user: AuthUser }> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    return response.json();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  saveToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  saveUser: (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
