import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import { createPlaceholder } from "../../utils/placeholders";

// Dashboard
import StudentDashboard from "../../pages/student/dashboard/StudentDashboard";

// Classes
import StudentClasses from "../../pages/student/classes/StudentClasses";
import StudentClassView from "../../pages/student/classes/StudentClassView";

// Assignments
import StudentAssignments from "../../pages/student/assignments/StudentAssignments";
import StudentAssignmentView from "../../pages/student/assignments/StudentAssignmentView";
import StudentAssignmentSubmit from "../../pages/student/assignments/StudentAssignmentSubmit";
import StudentSubmissionView from "../../pages/student/assignments/StudentSubmissionView";
import StudentSubmittedAssignments from "../../pages/student/assignments/StudentSubmittedAssignments";
import StudentSubmissions from "../../pages/student/assignments/StudentSubmissions";

// Content
import StudentContent from "../../pages/student/content/StudentContent";
import StudentContentView from "../../pages/student/content/StudentContentView";

// Grades
import StudentGrades from "../../pages/student/grades/StudentGrades";
import StudentGradeReport from "../../pages/student/grades/StudentGradeReport";
import StudentGradeDetails from "../../pages/student/grades/StudentGradeDetails";

// Calendar
import StudentCalendar from "../../pages/student/calendar/StudentCalendar";

// Profile
import StudentProfile from "../../pages/student/profile/StudentProfile";
import ComposeMessage from "../../pages/student/messages/ComposeMessage";
import MessageDetail from "../../pages/student/messages/MessageDetail";
import StudentMessages from "../../pages/student/messages/StudentMessages";

// Live Session pages
import StudentLiveSessions from "../../pages/student/live-sessions/StudentLiveSessions";
import StudentLiveSessionDetail from "../../pages/student/live-sessions/StudentLiveSessionDetail";

// Import other student pages
// These are placeholders, you'll need to create these components
// or replace with actual imports when components are ready
const StudentAttendance = lazy(
  () => import("../../pages/student/attendance/StudentAttendance")
);
const StudentResources = createPlaceholder("Resources");
const StudentAnnouncements = createPlaceholder("Announcements");
const StudentSettings = createPlaceholder("Student Settings");

const studentRoutes: (RouteObject & { roles?: string[] })[] = [
  {
    path: "/student",
    element: <StudentLayout />,
    roles: ["student"],
    children: [
      // Dashboard (index route)
      {
        index: true,
        path: "/student",
        element: <StudentDashboard />,
      },

      // Classes
      {
        path: "/student/classes",
        element: <StudentClasses />,
      },
      {
        path: "/student/classes/:id",
        element: <StudentClassView />,
      },

      // Assignments
      {
        path: "/student/assignments",
        element: <StudentAssignments />,
      },
      {
        path: "/student/assignments/:id",
        element: <StudentAssignmentView />,
      },
      {
        path: "/student/assignments/:id/submit",
        element: <StudentAssignmentSubmit />,
      },
      {
        path: "/student/assignments/:id/my-submission",
        element: <StudentSubmissionView />,
      },
      {
        path: "/student/assignments/submitted",
        element: <StudentSubmittedAssignments />,
      },
      {
        path: "/student/submissions",
        element: <StudentSubmissions />,
      },

      // Content
      {
        path: "/student/content",
        element: <StudentContent />,
      },
      {
        path: "/student/content/:id",
        element: <StudentContentView />,
      },

      // Grades
      {
        path: "/student/grades",
        element: <StudentGrades />,
      },
      {
        path: "/student/grades/report",
        element: <StudentGradeReport />,
      },
      {
        path: "/student/grades/:id",
        element: <StudentGradeDetails />,
      },

      // Attendance
      {
        path: "/student/attendance",
        element: <StudentAttendance />,
      },

      // Learning Materials
      {
        path: "/student/resources",
        element: <StudentResources />,
      },

      // Live Sessions
      {
        path: "/student/live-sessions",
        element: <StudentLiveSessions />,
      },
      {
        path: "/student/live-sessions/:id",
        element: <StudentLiveSessionDetail />,
      },
      {
        path: "/student/live-sessions/:id/join",
        element: <StudentLiveSessionDetail />,
      },

      // Calendar
      {
        path: "/student/calendar",
        element: <StudentCalendar />,
      },

      // Messages
      {
        path: "/student/messages",
        element: <StudentMessages />,
      },
      {
        path: "/student/messages/compose",
        element: <ComposeMessage />,
      },
      {
        path: "/student/messages/:id",
        element: <MessageDetail />,
      },
      {
        path: "/student/announcements",
        element: <StudentAnnouncements />,
      },

      // Account
      {
        path: "/student/profile",
        element: <StudentProfile />,
      },
      {
        path: "/student/settings",
        element: <StudentSettings />,
      },
    ],
  },
];

export default studentRoutes;
