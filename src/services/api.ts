import axios from "axios";
import { LoginFormData, RegisterFormData, ApiResponse, User } from "../types";

// Vite uses import.meta.env instead of process.env
const API_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Get token from storage (either localStorage or sessionStorage)
const getToken = () => {
  return (
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );
};

// Helper function to check if a token is valid JWT format
const isValidTokenFormat = (token: string): boolean => {
  if (!token) return false;

  // Simple JWT format check (3 parts separated by dots)
  const parts = token.split(".");
  return parts.length === 3;
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && isValidTokenFormat(token)) {
    // Ensure headers object exists
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    console.log(
      "Token found but invalid format, not adding to request headers"
    );
    // Invalid token format - don't use it, but don't clear it here
    // Another process will handle cleaning up invalid tokens
  } else {
    console.log("No token found for request");
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for unauthorized error
    if (error.response?.status === 401) {
      console.log("Received 401 Unauthorized error from API");

      // Clear tokens from storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Don't redirect if we're already on the login page to avoid loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        console.log("Redirecting to login page due to 401 error");
        // Use a small timeout to avoid potential redirection loop issues
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods (typed)
export const authApi = {
  register: (userData: RegisterFormData) =>
    api.post<ApiResponse<User>>("/auth/register", userData),

  login: (credentials: LoginFormData) =>
    api.post<{
      success: boolean;
      token: string;
      user: User | null;
      message?: string;
    }>("/auth/login", credentials),

  getMe: () => api.get<ApiResponse<User>>("/auth/me"),
  verifyEmail: (token: string) =>
    api.get<ApiResponse<{ verified: boolean }>>(`/auth/verify-email/${token}`),

  forgotPassword: (email: string) =>
    api.post<
      ApiResponse<{
        email: string;
        timestamp: string;
        emailSent?: boolean;
        token?: string;
      }>
    >(`/auth/forgotpassword`, { email }),

  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) =>
    api.post<
      ApiResponse<{
        userId: string;
        email: string;
        timestamp: string;
      }>
    >(`/auth/resetpassword`, {
      token,
      newPassword,
      confirmPassword,
    }),
};

export default api;
