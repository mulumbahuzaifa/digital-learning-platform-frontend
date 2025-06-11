import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./components/auth/RoleRedirect";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { allRoutes } from "./routes";
import { UserRole } from "./types";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Role-based redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            {/* All other routes */}
            {allRoutes.map((route) => {
              // If the route has children, render them
              if (route.children) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      route.element && (
                        <ProtectedRoute roles={route.roles as UserRole[]}>
                          {route.element}
                        </ProtectedRoute>
                      )
                    }
                  >
                    {route.children.map((child) => (
                      <Route
                        key={child.path}
                        path={child.path}
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            {child.element}
                          </Suspense>
                        }
                      />
                    ))}
                  </Route>
                );
              }

              // For routes without children
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {route.element}
                    </Suspense>
                  }
                />
              );
            })}
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
