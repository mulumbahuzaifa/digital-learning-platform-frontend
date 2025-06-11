import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, redirectPath, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;

  return isAuthenticated ? <Navigate to={redirectPath} replace /> : children;
}