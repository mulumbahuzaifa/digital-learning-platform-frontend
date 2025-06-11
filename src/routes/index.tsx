import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Import route configurations
import authRoutes from "./auth/AuthRoutes";
import adminRoutes from "./admin/AdminRoutes";
import studentRoutes from "./student/StudentRoutes";
import teacherRoutes from "./teacher/TeacherRoutes";

// Lazy load public pages
const HomePage = lazy(() => import("../pages/HomePage"));
const CoursesPage = lazy(() => import("../pages/CoursesPage"));
const FeaturesPage = lazy(() => import("../pages/FeaturesPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Lazy load content pages
const ContentList = lazy(() => import("../pages/content/ContentList"));
const CreateContent = lazy(() => import("../pages/content/CreateContent"));
const ContentDetail = lazy(() => import("../pages/content/ContentDetail"));
const EditContent = lazy(() => import("../pages/content/EditContent"));

// Content routes (shared across user types)
export const contentRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/content",
    element: <ContentList />,
  },
  {
    path: "/content/create",
    element: <CreateContent />,
  },
  {
    path: "/content/:id",
    element: <ContentDetail />,
  },
  {
    path: "/content/edit/:id",
    element: <EditContent />,
  },
];

// Public routes
export const publicRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/courses",
    element: <CoursesPage />,
  },
  {
    path: "/features",
    element: <FeaturesPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Combine all routes
export const allRoutes: (RouteObject & { roles?: string[] })[] = [
  ...authRoutes,
  ...adminRoutes,
  ...studentRoutes,
  ...teacherRoutes,
  ...contentRoutes,
  ...publicRoutes,
];
