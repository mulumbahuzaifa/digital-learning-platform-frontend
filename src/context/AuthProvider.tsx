import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type {
  User,
  AuthContextType,
  UserRole,
  RegisterFormData,
  LoginFormData,
} from "../types";
import { useAuthActions } from "../hooks/useAuthActions";
import { useJwt } from "react-jwt";

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create and export the useAuth hook separately to ensure consistency for Fast Refresh
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// Helper function to check if a token is valid (not expired)
const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Get the payload part of the JWT (second part)
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    // Decode base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    // Parse the JSON
    const payload = JSON.parse(jsonPayload);
    
    // Check if token has exp claim and it's not expired
    if (payload.exp) {
      // exp is in seconds, Date.now() is in milliseconds
      return payload.exp * 1000 > Date.now();
    }
    
    return true; // If no exp claim, assume it's valid
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// The AuthProvider component 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  });
  
  const navigate = useNavigate();
  // We're not using these directly anymore, we have our own token validator
  // const { decodedToken, isExpired } = useJwt(token);

  const {
    currentUser,
    isAuthenticated: queryIsAuthenticated,
    isAdmin: queryIsAdmin,
    isTeacher: queryIsTeacher,
    isStudent: queryIsStudent,
    isLoading: authLoading,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    verifyEmail: verifyEmailAction,
    forgotPassword: forgotPasswordAction,
    resetPassword: resetPasswordAction,
  } = useAuthActions();

  // Update token state when localStorage/sessionStorage changes
  const updateTokenFromStorage = useCallback(() => {
    const newToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    setToken(newToken);
  }, []);

  // Sync user state with currentUser query
  useEffect(() => {
    // First check if we have a token
    if (token) {
      // Use our custom function to check if token is expired
      const tokenValid = isTokenValid(token);
      
      if (!tokenValid) {
        console.log('Token validation failed, clearing session');
        // Token is invalid or expired, clear it
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
        setToken('');
        setUser(null);
        
        // Show a message to the user (but only if not on the login page)
        if (window.location.pathname !== '/login') {
          toast.error("Your session has expired. Please log in again.");
          // Redirect to login
          navigate('/login');
        }
      } else {
        // Token is valid
        console.log('Token validation passed, token is valid');
        }
      }

    // If the user data is loaded from the query, update the state
    if (currentUser.data) {
      console.log('Setting user from currentUser query:', currentUser.data);
      setUser(currentUser.data);
      
      // If we have user data but haven't redirected yet, do it now
      if (currentUser.data && redirectPath === "/") {
        const path = getDefaultPath(currentUser.data.role);
        console.log('Redirecting to path based on role:', path);
        setRedirectPath(path);
        navigate(path, { replace: true });
      }
    }
  }, [currentUser.data, token, navigate, redirectPath]);

  // Add a storage event listener to sync token across tabs
  useEffect(() => {
    window.addEventListener('storage', updateTokenFromStorage);
    return () => {
      window.removeEventListener('storage', updateTokenFromStorage);
    };
  }, [updateTokenFromStorage]);

  const getDefaultPath = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
        return "/student";
      default:
        return "/";
    }
  };

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      console.log("Attempting login with credentials:", credentials.email);
      
      // Clear any existing user data and tokens before login attempt
      setUser(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      const result = await loginAction.mutateAsync(credentials);
      console.log("Login result:", result);
      
      if (result.success) {
        // Check if user is verified
        if (result.user && !result.user.isVerified) {
          toast.error("Your account has not been verified yet. Please wait for admin approval or contact support.", {
            duration: 6000,
            icon: '⚠️',
          });
          return false;
        }

        // Update token state after login first thing
        console.log("Login successful, updating token in storage");
        
        // Wait a bit for the token to be stored before updating
        setTimeout(() => {
          updateTokenFromStorage();
        }, 100);
        
        if (result.user) {
          console.log("Setting user in state:", result.user);
          setUser(result.user);
          
          const path = getDefaultPath(result.user.role);
          setRedirectPath(path);
          
          // Show success message
          toast.success(`Welcome back, ${result.user.firstName}!`);
          
          // Navigate after everything is set up
          console.log(`Navigating to ${path} after successful login`);
          navigate(path, { replace: true });
          return true;
        } else {
          // If we have a token but no user data, try to fetch it
          console.log("Login succeeded but no user data received, fetching from /me endpoint");
          
          try {
            // Give the token a moment to be stored and validated
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Force refetch current user data
            const { data: userData } = await currentUser.refetch();
            
            if (userData) {
              // Check if user is verified
              if (!userData.isVerified) {
                toast.error("Your account has not been verified yet. Please wait for admin approval or contact support.", {
                  duration: 6000,
                  icon: '⚠️',
                });
                // Clear tokens since user shouldn't be logged in
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                setToken('');
                setUser(null);
                return false;
              }

              console.log("Successfully fetched user data:", userData);
              setUser(userData);
              
              const path = getDefaultPath(userData.role);
              setRedirectPath(path);
              
              toast.success(`Welcome back, ${userData.firstName}!`);
              console.log(`Navigating to ${path} after fetching user data`);
              navigate(path, { replace: true });
            } else {
              console.log("Still could not get user data after refetch");
              toast.success("Login successful!");
              console.log("Navigating to home page");
              navigate("/"); // Navigate to a default page, will be redirected once user data loads
            }
          } catch (fetchError) {
            console.error("Error fetching user after login:", fetchError);
            toast.success("Login successful!");
            navigate("/");
          }
          
          return true;
        }
      } else {
        console.log("Login API returned success: false");
        toast.error("Login failed. Please check your credentials.");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return false;
    }
  };

  const register = async (userData: RegisterFormData): Promise<boolean> => {
    try {
      return await registerAction.mutateAsync(userData);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      return await verifyEmailAction.mutateAsync(token);
    } catch (error) {
      toast.error("Email verification failed.");
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      return await forgotPasswordAction.mutateAsync(email);
    } catch (error) {
      toast.error("Failed to send reset link.");
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      return await resetPasswordAction.mutateAsync({ token, newPassword });
    } catch (error) {
      toast.error("Password reset failed.");
      return false;
    }
  };

  const logout = () => {
    logoutAction();
    setToken('');
    setUser(null);
    navigate("/login");
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    isLoading: currentUser.isLoading || authLoading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
    isTeacher: !!user && user.role === 'teacher',
    isStudent: !!user && user.role === 'student',
    setUser,
    redirectPath,
    setRedirectPath,
  }), [
    user,
    currentUser.isLoading,
    authLoading,
    redirectPath,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setUser,
    setRedirectPath
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {currentUser.isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
