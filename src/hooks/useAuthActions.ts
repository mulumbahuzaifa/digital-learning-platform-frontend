import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authApi } from "../services/api";
import type {
  LoginFormData,
  RegisterFormData,
  User,
  LoginResult,
} from "../types";
import axios from "axios";

// Helper function to check if a token has valid JWT format
const isValidTokenFormat = (token: string | null): boolean => {
  if (!token) return false;

  // Simple JWT format check (3 parts separated by dots)
  const parts = token.split(".");
  return parts.length === 3;
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Current user query
  const currentUser = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        console.log("Fetching current user data");

        // Check if we have a token first
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        // Validate token format before using it
        if (!token || !isValidTokenFormat(token)) {
          console.log("No valid token found, skipping user fetch");
          return null;
        }

        // Make the API call to get current user
        const response = await authApi.getMe();
        console.log("Current user API response:", response.data);

        if (response.data.success && response.data.data) {
          console.log(
            "Current user data retrieved successfully:",
            response.data.data
          );

          // Store user data in query client cache
          queryClient.setQueryData(["currentUser"], response.data.data);

          return response.data.data;
        }

        console.log("Current user API returned success but no data");
        return null;
      } catch (error) {
        console.error("Error fetching current user:", error);

        // If we get a 401 error, it means the token is invalid or expired
        // The interceptor will handle token removal, we just return null here
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log(
            "Unauthorized error when fetching user, token might be invalid"
          );
          // We'll rely on the axios interceptor to handle redirect
        }

        return null;
      }
    },
    enabled: !!(
      localStorage.getItem("token") || sessionStorage.getItem("token")
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once if fails
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Login mutation
  const login = useMutation<LoginResult, Error, LoginFormData>({
    mutationFn: async (credentials: LoginFormData) => {
      // Clear any existing tokens first before login attempt
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      const response = await authApi.login(credentials);
      console.log("Login API response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      const token = response.data.token || "";

      if (!token) {
        throw new Error("No token received from server");
      }

      // Validate the token format
      if (!token.includes(".") || token.split(".").length !== 3) {
        console.error(
          "Invalid token format received:",
          token.substring(0, 10) + "..."
        );
        throw new Error("Invalid token format received from server");
      }

      console.log(
        "Valid token received, storing in " +
          (credentials.remember ? "localStorage" : "sessionStorage")
      );

      // Store token based on remember preference
      if (credentials.remember) {
        localStorage.setItem("token", token); // Persistent storage
      } else {
        sessionStorage.setItem("token", token); // Session storage only
      }

      // Get user data from response - user is directly in the response, not in data property
      const userData = response.data.user || null;
      console.log("User data from login:", userData);

      // Store user data in query client
      if (userData) {
        queryClient.setQueryData(["currentUser"], userData);
      }

      // Return both success status and user data
      return {
        success: true,
        user: userData,
      };
    },
    onError: (error) => {
      // Ensure tokens are cleared on error
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      const response = await authApi.register(userData);
      return response.data.success;
    },
    onSuccess: (success) => {
      if (success) {
        toast.success(
          "Registration successful! Wait for admin to verify your account.",
          { duration: 5000 }
        );
        navigate("/login");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Logout action
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    queryClient.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Verify email mutation - returns Promise<boolean>
  const verifyEmail = useMutation<boolean, Error, string>({
    mutationFn: async (token) => {
      const response = await authApi.verifyEmail(token);
      if (!response.data.success) {
        throw new Error(response.data.message || "Email verification failed");
      }
      return response.data.success;
    },
    onSuccess: (success) => {
      if (success) {
        toast.success("Email verified successfully! You can now log in.");
        // The navigation is handled in the VerifyEmailPage component
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify email. Please try again.");
    },
  });

  // Forgot password mutation
  const forgotPassword = useMutation<
    {
      success: boolean;
      message: string;
      data: {
        email: string;
        timestamp: string;
        emailSent?: boolean;
        token?: string;
      };
    },
    Error,
    string
  >({
    mutationFn: async (email) => {
      const response = await authApi.forgotPassword(email);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send reset link");
      }
      return {
        success: response.data.success,
        message: response.data.message || "Reset link sent successfully",
        data: response.data.data,
      };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      // Navigate to reset password page with the token from the response
      if (data.data.token) {
        navigate(
          `/reset-password?token=${data.data.token}&email=${data.data.email}`
        );
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to send reset link. Please try again."
      );
    },
  });

  // Reset password mutation
  const resetPassword = useMutation<
    {
      success: boolean;
      message: string;
      data: { userId: string; email: string; timestamp: string };
    },
    Error,
    { token: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: async ({ token, newPassword, confirmPassword }) => {
      const response = await authApi.resetPassword(
        token,
        newPassword,
        confirmPassword
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reset password");
      }
      return {
        success: response.data.success,
        message: response.data.message || "Password reset successful",
        data: response.data.data,
      };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      // Navigate to login after successful password reset
      navigate("/login");
    },
    onError: (error) => {
      if (error.message.includes("Invalid or expired token")) {
        toast.error(
          "The password reset link has expired. Please request a new one."
        );
      } else {
        toast.error(
          error.message || "Failed to reset password. Please try again."
        );
      }
    },
  });

  return {
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    currentUser,
    isAuthenticated: !!currentUser.data,
    isAdmin: currentUser.data?.role === "admin",
    isTeacher: currentUser.data?.role === "teacher",
    isStudent: currentUser.data?.role === "student",
    isLoading: currentUser.isLoading || login.isPending || register.isPending,
  };
};
