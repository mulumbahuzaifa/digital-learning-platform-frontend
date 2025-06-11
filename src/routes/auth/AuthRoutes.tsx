import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PublicOnlyRoute from "../../components/auth/PublicOnlyRoute";

// Lazy load auth pages
const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../../pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../../pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(
  () => import("../../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(
  () => import("../../pages/auth/ResetPasswordPage")
);

const authRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/verify-email/:token",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },
];

export default authRoutes;
