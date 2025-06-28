import { RouteObject } from "react-router-dom";
import TeacherLayout from "../../components/layouts/TeacherLayout";

// Dashboard
import TeacherDashboard from "../../pages/teacher/dashboard/TeacherDashboard";

// Teacher pages
import TeacherProfile from "../../pages/teacher/profile/TeacherProfile";
import TeacherSettings from "../../pages/teacher/settings/TeacherSettings";
import TeacherClasses from "../../pages/teacher/classes/TeacherClasses";
import TeacherAttendance from "../../pages/teacher/attendance/TeacherAttendance";

// Class Management
import ClassDetail from "../../pages/teacher/classes/detail/ClassDetail";
import ClassCreate from "../../pages/teacher/classes/create/ClassCreate";
import ClassStudents from "../../pages/teacher/classes/students/ClassStudents";
import ClassSubjects from "../../pages/teacher/classes/subjects/ClassSubjects";
import ClassAssignments from "../../pages/teacher/classes/assignments/ClassAssignments";
import ClassAttendance from "../../pages/teacher/classes/attendance/ClassAttendance";

// Student Management
import StudentEnrollment from "../../pages/teacher/students/enrollment/StudentEnrollment";
import StudentDetail from "../../pages/teacher/students/detail/StudentDetail";

// Assignment pages
import TeacherAssignmentManagement from "../../pages/teacher/assignments/TeacherAssignmentManagement";
import AssignmentCreate from "../../pages/teacher/assignments/AssignmentCreate";
import AssignmentEdit from "../../pages/teacher/assignments/AssignmentEdit";
import AssignmentSubmissions from "../../pages/teacher/assignments/AssignmentSubmissions";
import SubmissionDetails from "../../pages/teacher/assignments/SubmissionDetails";
import AllSubmissions from "../../pages/teacher/assignments/AllSubmissions";

// Content pages
import TeacherContentManagement from "../../pages/teacher/content/TeacherContentManagement";
import CreateTeacherContent from "../../pages/teacher/content/CreateTeacherContent";
import EditTeacherContent from "../../pages/teacher/content/EditTeacherContent";
import ViewTeacherContent from "../../pages/teacher/content/ViewTeacherContent";

// Gradebook pages
import TeacherGradebook from "../../pages/teacher/gradebook/TeacherGradebookManagement";
import GradebookCreate from "../../pages/teacher/gradebook/GradebookCreate";
import GradebookEdit from "../../pages/teacher/gradebook/GradebookEdit";
import GradebookDetail from "../../pages/teacher/gradebook/GradebookDetail";

// Calendar and Messages
import TeacherCalendar from "../../pages/teacher/calendar/TeacherCalendar";
import CalendarEventCreate from "../../pages/teacher/calendar/CalendarEventCreate";
import CalendarEventEdit from "../../pages/teacher/calendar/CalendarEventEdit";
import TeacherMessages from "../../pages/teacher/messages/TeacherMessages";

// Live Session pages
import LiveSessionManagement from "../../pages/teacher/live-sessions/LiveSessionManagement";
import CreateLiveSession from "../../pages/teacher/live-sessions/CreateLiveSession";
import EditLiveSession from "../../pages/teacher/live-sessions/EditLiveSession";
import LiveSessionDetail from "../../pages/teacher/live-sessions/LiveSessionDetail";

// Placeholder components for features to be implemented
const TeacherAnnouncements = () => <div>Announcements Page</div>;

const teacherRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/teacher",
    element: <TeacherLayout />,
    roles: ["teacher"],
    children: [
      // Dashboard (index route)
      {
        index: true,
        path: "/teacher",
        element: <TeacherDashboard />,
      },

      // Classes
      {
        path: "/teacher/classes",
        element: <TeacherClasses />,
      },
      {
        path: "/teacher/classes/create",
        element: <ClassCreate />,
      },
      {
        path: "/teacher/classes/:id",
        element: <ClassDetail />,
      },
      {
        path: "/teacher/classes/:id/subjects",
        element: <ClassSubjects />,
      },
      {
        path: "/teacher/classes/:id/attendance",
        element: <ClassAttendance />,
      },
      {
        path: "/teacher/classes/:id/assignments",
        element: <ClassAssignments />,
      },
      
      // Students
      {
        path: "/teacher/students",
        element: <ClassStudents />,
      },
      {
        path: "/teacher/students/enroll",
        element: <StudentEnrollment />,
      },
      {
        path: "/teacher/students/:id",
        element: <StudentDetail />,
      },

      // Assignments
      {
        path: "/teacher/assignments",
        element: <TeacherAssignmentManagement />,
      },
      {
        path: "/teacher/assignments/create",
        element: <AssignmentCreate />,
      },
      {
        path: "/teacher/assignments/:id/edit",
        element: <AssignmentEdit />,
      },
      {
        path: "/teacher/assignments/submissions/:id",
        element: <AssignmentSubmissions />,
      },
      {
        path: "/teacher/assignments/submissions/:id/:submissionId",
        element: <SubmissionDetails />,
      },
      {
        path: "/teacher/submissions",
        element: <AllSubmissions />,
      },

      // Gradebook
      {
        path: "/teacher/gradebook",
        element: <TeacherGradebook />,
      },
      {
        path: "/teacher/gradebook/create",
        element: <GradebookCreate />,
      },
      {
        path: "/teacher/gradebook/:id",
        element: <GradebookDetail />,
      },
      {
        path: "/teacher/gradebook/:id/edit",
        element: <GradebookEdit />,
      },

      // Attendance
      {
        path: "/teacher/attendance",
        element: <TeacherAttendance />,
      },

      // Content
      {
        path: "/teacher/content",
        element: <TeacherContentManagement />,
      },
      {
        path: "/teacher/content/create",
        element: <CreateTeacherContent />,
      },
      {
        path: "/teacher/content/edit/:id",
        element: <EditTeacherContent />,
      },
      {
        path: "/teacher/content/:id",
        element: <ViewTeacherContent />,
      },

      // Live Sessions
      {
        path: "/teacher/live-sessions",
        element: <LiveSessionManagement />,
      },
      {
        path: "/teacher/live-sessions/create",
        element: <CreateLiveSession />,
      },
      {
        path: "/teacher/live-sessions/:id",
        element: <LiveSessionDetail />,
      },
      {
        path: "/teacher/live-sessions/:id/edit",
        element: <EditLiveSession />,
      },
      {
        path: "/teacher/live-sessions/:id/join",
        element: <LiveSessionDetail />,
      },

      // Calendar
      {
        path: "/teacher/calendar",
        element: <TeacherCalendar />,
      },
      {
        path: "/teacher/calendar/create",
        element: <CalendarEventCreate />,
      },
      {
        path: "/teacher/calendar/:id/edit",
        element: <CalendarEventEdit />,
      },

      // Messages
      {
        path: "/teacher/messages",
        element: <TeacherMessages />,
      },

      // Announcements
      {
        path: "/teacher/announcements",
        element: <TeacherAnnouncements />,
      },

      // Account
      {
        path: "/teacher/profile",
        element: <TeacherProfile />,
      },
      {
        path: "/teacher/settings",
        element: <TeacherSettings />,
      },
    ],
  },
];

export default teacherRoutes;
