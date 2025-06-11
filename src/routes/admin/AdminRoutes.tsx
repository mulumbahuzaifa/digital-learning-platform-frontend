// src/routes/AdminRoutes.tsx
import { RouteObject } from "react-router-dom";
import AdminLayout from "../../components/layouts/AdminLayout";

// Dashboard
import AdminDashboard from "../../pages/admin/dashboard/AdminDashboard";
// const AdminDashboard = lazy(() => import("../../pages/admin/dashboard/AdminDashboard"));

// Users
import UserManagement from "../../pages/admin/users/UserManagement";
import UserCreate from "../../pages/admin/users/UserCreate";
import UserEdit from "../../pages/admin/users/UserEdit";

// Teachers
import TeacherManagement from "../../pages/admin/teachers/TeacherManagement";
import QualificationsManagement from "../../pages/admin/teachers/QualificationsManagement";

// Classes
import ClassManagement from "../../pages/admin/classes/ClassManagement";
import ClassCreate from "../../pages/admin/classes/ClassCreate";
import ClassView from "../../pages/admin/classes/ClassView";
import ClassEdit from "../../pages/admin/classes/ClassEdit";
import AddSubjectToClass from "../../pages/admin/classes/AddSubjectToClass";
import AddStudentToClass from "../../pages/admin/classes/AddStudentToClass";
import AssignTeacherToSubject from "../../pages/admin/classes/AssignTeacherToSubject";
import AssignPrefect from "../../pages/admin/classes/AssignPrefect";

// Class Requests
import ClassRequestManagement from "../../pages/admin/class-requests/ClassRequestManagement";

// Subjects
import SubjectManagement from "../../pages/admin/subjects/SubjectManagement";
import CreateSubject from "../../pages/admin/subjects/CreateSubject";
import SubjectDetail from "../../pages/admin/subjects/SubjectDetail";
import EditSubject from "../../pages/admin/subjects/EditSubject";

// Content
import ContentList from "../../pages/content/ContentList";
import CreateContent from "../../pages/content/CreateContent";
import ContentDetail from "../../pages/content/ContentDetail";
import EditContent from "../../pages/content/EditContent";

// Assignments
import AssignmentManagement from "../../pages/admin/assignments/AssignmentManagement";
import AssignmentCreate from "../../pages/admin/assignments/AssignmentCreate";
import AssignmentEdit from "../../pages/admin/assignments/AssignmentEdit";
import AssignmentSubmissions from "../../pages/admin/assignments/AssignmentSubmissions";
import SubmissionDetails from "../../pages/admin/assignments/SubmissionDetails";
import AllSubmissions from "../../pages/admin/assignments/AllSubmissions";

// Communications
import FeedbackManagement from "../../pages/admin/feedback/FeedbackManagement";
import FeedbackCreate from "../../pages/admin/feedback/FeedbackCreate";
import FeedbackView from "../../pages/admin/feedback/FeedbackView";
import FeedbackEdit from "../../pages/admin/feedback/FeedbackEdit";
import FeedbackRespond from "../../pages/admin/feedback/FeedbackRespond";
import MessageManagement from "../../pages/admin/messages/MessageManagement";
import MessageCreate from "../../pages/admin/messages/MessageCreate";
import MessageView from "../../pages/admin/messages/MessageView";
import MessageEdit from "../../pages/admin/messages/MessageEdit";
import NotificationManagement from "../../pages/admin/notifications/NotificationManagement";

// Placeholder for routes that don't have components yet
import PlaceholderPage from "../../components/ui/PlaceholderPage";
import ManageRolesPage from "../../pages/admin/users/ManageRolesPage";
import GradebookManagement from "../../pages/admin/gradebook/GradebookManagement";
import GradebookCreate from "../../pages/admin/gradebook/GradebookCreate";
import GradebookView from "../../pages/admin/gradebook/GradebookView";
import GradebookEdit from "../../pages/admin/gradebook/GradebookEdit";
import AttendanceManagement from "../../pages/admin/attendance/AttendanceManagement";
import AttendanceCreate from "../../pages/admin/attendance/AttendanceCreate";
import AttendanceView from "../../pages/admin/attendance/AttendanceView";
import AttendanceEdit from "../../pages/admin/attendance/AttendanceEdit";

// Calendar
import CalendarManagement from "../../pages/admin/calendar/CalendarManagement";
import CalendarEventCreate from "../../pages/admin/calendar/CalendarEventCreate";
import CalendarEventEdit from "../../pages/admin/calendar/CalendarEventEdit";

// New imports
import AdminProfile from "../../pages/admin/profile/AdminProfile";
import AdminSettings from "../../pages/admin/settings/AdminSettings";
import AdminReports from "../../pages/admin/reports/AdminReports";

// Function to create placeholder components with custom titles
const createPlaceholder = (title: string) => (
  <PlaceholderPage
    title={title}
    description={`The ${title} feature is currently in development. Check back soon!`}
  />
);

const adminRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/admin",
    element: <AdminLayout />,
    roles: ["admin"],
    children: [
      // Dashboard
      {
        index: true,
        path: "/admin",
        element: <AdminDashboard />,
      },

      // Profile & Settings
      {
        path: "/admin/profile",
        element: <AdminProfile />,
      },
      {
        path: "/admin/settings",
        element: <AdminSettings />,
      },
      {
        path: "/admin/reports",
        element: <AdminReports />,
      },

      // User Management
      {
        path: "/admin/users",
        element: <UserManagement />,
      },
      {
        path: "/admin/users/create",
        element: <UserCreate />,
      },
      {
        path: "/admin/users/:id/edit",
        element: <UserEdit />,
      },
      {
        path: "/admin/users/roles",
        element: <ManageRolesPage />,
      },

      // Teacher Management
      {
        path: "/admin/teachers",
        element: <TeacherManagement />,
      },
      {
        path: "/admin/qualifications",
        element: <QualificationsManagement />,
      },

      // Class Management
      {
        path: "/admin/classes",
        element: <ClassManagement />,
      },
      {
        path: "/admin/classes/create",
        element: <ClassCreate />,
      },
      {
        path: "/admin/classes/:id",
        element: <ClassView />,
      },
      {
        path: "/admin/classes/:id/edit",
        element: <ClassEdit />,
      },
      {
        path: "/admin/classes/:id/add-subject",
        element: <AddSubjectToClass />,
      },
      {
        path: "/admin/classes/:id/add-student",
        element: <AddStudentToClass />,
      },
      {
        path: "/admin/classes/:id/subjects/:subjectId/add-teacher",
        element: <AssignTeacherToSubject />,
      },
      {
        path: "/admin/classes/:id/assign-prefect",
        element: <AssignPrefect />,
      },

      // Class Requests
      {
        path: "/admin/class-requests",
        element: <ClassRequestManagement />,
      },

      // Subject Management
      {
        path: "/admin/subjects",
        element: <SubjectManagement />,
      },
      {
        path: "/admin/subjects/create",
        element: <CreateSubject />,
      },
      {
        path: "/admin/subjects/:id",
        element: <SubjectDetail />,
      },
      {
        path: "/admin/subjects/:id/edit",
        element: <EditSubject />,
      },

      // Assignment Management
      {
        path: "/admin/assignments",
        element: <AssignmentManagement />,
      },
      {
        path: "/admin/assignments/create",
        element: <AssignmentCreate />,
      },
      {
        path: "/admin/assignments/:id/edit",
        element: <AssignmentEdit />,
      },
      {
        path: "/admin/assignments/:id/submissions",
        element: <AssignmentSubmissions />,
      },
      {
        path: "/admin/assignments/:id/submissions/:submissionId",
        element: <SubmissionDetails />,
      },
      {
        path: "/admin/submissions",
        element: <AllSubmissions />,
      },

      // Academics
      {
        path: "/admin/gradebook",
        element: <GradebookManagement />,
      },
      {
        path: "/admin/gradebook/create",
        element: <GradebookCreate />,
      },
      {
        path: "/admin/gradebook/:id",
        element: <GradebookView />,
      },
      {
        path: "/admin/gradebook/:id/edit",
        element: <GradebookEdit />,
      },
      {
        path: "/admin/attendance",
        element: <AttendanceManagement />,
      },
      {
        path: "/admin/attendance/create",
        element: <AttendanceCreate />,
      },
      {
        path: "/admin/attendance/:id",
        element: <AttendanceView />,
      },
      {
        path: "/admin/attendance/:id/edit",
        element: <AttendanceEdit />,
      },

      // Learning Content
      {
        path: "/admin/content",
        element: <ContentList />,
      },
      {
        path: "/admin/content/create",
        element: <CreateContent />,
      },
      {
        path: "/admin/content/:id",
        element: <ContentDetail />,
      },
      {
        path: "/admin/content/edit/:id",
        element: <EditContent />,
      },
      {
        path: "/admin/content/categories",
        element: createPlaceholder("Content Categories"),
      },

      // Communication
      {
        path: "/admin/calendar",
        element: <CalendarManagement />,
      },
      {
        path: "/admin/calendar/create",
        element: <CalendarEventCreate />,
      },
      {
        path: "/admin/calendar/:id/edit",
        element: <CalendarEventEdit />,
      },
      {
        path: "/admin/messages",
        element: <MessageManagement />,
      },
      {
        path: "/admin/messages/create",
        element: <MessageCreate />,
      },
      {
        path: "/admin/messages/:id",
        element: <MessageView />,
      },
      {
        path: "/admin/messages/:id/edit",
        element: <MessageEdit />,
      },
      {
        path: "/admin/notifications",
        element: <NotificationManagement />,
      },
      {
        path: "/admin/feedback",
        element: <FeedbackManagement />,
      },
      {
        path: "/admin/feedback/create",
        element: <FeedbackCreate />,
      },
      {
        path: "/admin/feedback/:id",
        element: <FeedbackView />,
      },
      {
        path: "/admin/feedback/:id/edit",
        element: <FeedbackEdit />,
      },
      {
        path: "/admin/feedback/:id/respond",
        element: <FeedbackRespond />,
      },

      // System
      {
        path: "/admin/settings",
        element: createPlaceholder("Settings"),
      },
      {
        path: "/admin/reports",
        element: createPlaceholder("Reports"),
      },

      // Catch-all redirect
      // {
      //   path: "*",
      //   element: <Navigate to="/admin" replace />,
      // }
    ],
  },
];

export default adminRoutes;
