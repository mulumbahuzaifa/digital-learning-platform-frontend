import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { UserRole } from "../../types";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  roles = [],
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, redirectPath, setRedirectPath } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for token existence
  const hasToken =
    !!localStorage.getItem("token") || !!sessionStorage.getItem("token");

  useEffect(() => {
    // Save the attempted URL for redirecting after login
    if (!isAuthenticated && !isLoading) {
      console.log("Saving redirect path:", location.pathname);
      setRedirectPath(location.pathname);
    }
  }, [isAuthenticated, isLoading, location.pathname, setRedirectPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log("Authentication check in progress, showing loading spinner");
    return <LoadingSpinner />;
  }

  // Redirect to login if no token or not authenticated
  if (!hasToken || !isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to login");
    // Store the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user role permissions
  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log(
      `User role ${user.role} not in allowed roles: ${roles.join(", ")}`
    );

    // Redirect to appropriate dashboard based on role
    const dashboardPath =
      user.role === "admin"
        ? "/admin"
        : user.role === "teacher"
        ? "/teacher"
        : "/student";

    console.log(`Redirecting to ${dashboardPath}`);
    return <Navigate to={dashboardPath} replace />;
  }

  // User is authenticated and has the required role
  console.log("Authentication check passed, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
