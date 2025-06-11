import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import LoadingSpinner from "../ui/LoadingSpinner";

/**
 * Component that redirects users to their appropriate dashboard based on their role
 */
export default function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "teacher":
          navigate("/teacher", { replace: true });
          break;
        case "student":
          navigate("/student", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } else if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return <LoadingSpinner fullScreen />;
} 