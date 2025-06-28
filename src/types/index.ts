// import { RouteObject } from "react-router-dom";

// User types
export type UserRole = "admin" | "teacher" | "student" | "parent";
export type RegisterableRole = "teacher" | "student";

export type AcademicTerm = "Term 1" | "Term 2" | "Term 3";
export type EnrollmentStatus = "pending" | "approved" | "rejected";
export type EnrollmentType = "new" | "transfer";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
}

export interface UserProfile {
  bio?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  phone?: string;
  address?: {
    district?: string;
    county?: string;
    subCounty?: string;
  };
  currentClass?: string;
  year?: string;
  studentId?: string;
  parentGuardian?: {
    name?: string;
    contact?: string;
    relationship?: string;
  };
  qualifications?: Qualification[];
  teacherId?: string;
  department?: string;
}

export interface Document {
  name: string;
  url: string;
  fileType?: string;
  uploadedAt?: Date;
  description?: string;
}

export interface Qualification {
  subject?: string;
  qualificationLevel?: string;
  yearsOfExperience?: number;
  institution?: string;
  yearObtained?: number;
  documents?: Document[];
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface ClassRequest {
  class: string;
  subject?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  reason?: string;
  roleInClass: "teacher" | "student";
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  profile?: UserProfile;
  isActive?: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User | null;
  message?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<boolean>;
  register: (userData: RegisterFormData) => Promise<boolean>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  redirectPath: string;
  setRedirectPath: (path: string) => void;
  setUser: (user: User | null) => void;
  updateUser: (updatedUser: User) => void;
}

// Form schema types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "teacher";
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface UserCreateFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // 'teacher' | 'student'
}

export interface UserEditFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password?: string;
  isVerified: boolean;
  // updatedAt?: Date;
}

//Class types

export interface ClassTeacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ClassSubjectTeacher {
  _id?: string;
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: UserProfile;
  };
  isLeadTeacher: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface ClassSubject {
  _id?: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  teachers: ClassSubjectTeacher[];
  schedule?: {
    day:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    startTime: string;
    endTime: string;
    venue: string;
  };
}

export interface ClassStudent {
  _id?: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profile?: UserProfile;
  };
  status: EnrollmentStatus;
  enrollmentType: EnrollmentType;
  enrolledBy: string;
  enrollmentDate?: string;
  enrolledAt?: Date;
}

export interface Prefect {
  position: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignedAt: string;
  assignedBy: string;
  _id: string;
}

export interface Class {
  _id: string;
  name: string;
  code: string;
  level: string;
  stream: string;
  description?: string;
  subjects: ClassSubject[];
  classTeacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  prefects: Prefect[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  name: string;
  level: string;
  stream: string;
  description?: string;
  subjects?: Array<{
    subject: string;
    teachers?: Array<{
      teacher: string;
      isLeadTeacher?: boolean;
    }>;
  }>;
}

export interface UpdateClassData {
  name?: string;
  level: string;
  stream: string;
  description?: string;
  subjects?: Array<{
    subject: string;
    teachers?: Array<{
      teacher: string;
      isLeadTeacher?: boolean;
    }>;
  }>;
}

export interface AddSubjectToClassData {
  subject: string;
}

export interface AssignTeacherToSubjectData {
  teacher: string;
  isLeadTeacher?: boolean;
}

export interface AddStudentToClassData {
  student: string;
  status?: EnrollmentStatus;
  enrollmentType?: EnrollmentType;
}

export interface AssignPrefectData {
  student: string;
  position: string;
}

export interface ClassFilterParams {
  teacher?: string;
  student?: string;
  search?: string;
}

// Subject types
export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
  teachers?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  description?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
}

export interface UpdateSubjectData {
  name?: string;
  code?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
}

export interface SubjectFilterParams {
  category?: string;
  subCategory?: string;
  isActive?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SubjectResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Subject[];
}

export interface SingleSubjectResponse {
  success: boolean;
  data: Subject;
}

// User related service params
export interface GetAllUsersParams {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

// Assignment types
export type AssignmentStatus = "draft" | "published" | "closed";
export type AssignmentType =
  | "homework"
  | "classwork"
  | "test"
  | "exam"
  | "project";
export type DifficultyLevel = "easy" | "moderate" | "challenging";
export type SubmissionType = "text" | "file" | "both";

export interface AssignmentAttachment {
  type: "file" | "link";
  name: string;
  description?: string;
  // File-specific fields
  filename?: string;
  originalname?: string;
  mimetype?: string;
  size?: number;
  path?: string;
  // Link-specific fields
  url?: string;
  urlType?: "document" | "video" | "website" | "other";
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  totalMarks: number;
  weighting?: number;
  class: string | Class;
  className?: string;
  subject: string | Subject;
  subjectName?: string;
  createdBy: string | User;
  attachments?: AssignmentAttachment[];
  submissionType: SubmissionType;
  allowedFormats?: string[];
  allowLateSubmission: boolean;
  latePenalty: number;
  assignmentType: AssignmentType;
  difficultyLevel: DifficultyLevel;
  estimatedTime?: number;
  learningObjectives?: string[];
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  // Additional fields from student view
  academicYear?: string;
  term?: AcademicTerm;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  totalMarks: number;
  weighting?: number;
  class: string;
  subject: string;
  attachments?: AssignmentAttachment[];
  submissionType?: SubmissionType;
  allowedFormats?: string[];
  allowLateSubmission?: boolean;
  latePenalty?: number;
  assignmentType: AssignmentType;
  difficultyLevel?: DifficultyLevel;
  estimatedTime?: number;
  learningObjectives?: string[];
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  totalMarks?: number;
  weighting?: number;
  class?: string;
  subject?: string;
  attachments?: AssignmentAttachment[];
  submissionType?: SubmissionType;
  allowedFormats?: string[];
  allowLateSubmission?: boolean;
  latePenalty?: number;
  assignmentType?: AssignmentType;
  difficultyLevel?: DifficultyLevel;
  estimatedTime?: number;
  learningObjectives?: string[];
  status?: AssignmentStatus;
}

export interface AssignmentFilterParams {
  class?: string;
  subject?: string;
  status?: AssignmentStatus;
  type?: AssignmentType;
  search?: string;
}

// Submission types
export interface SubmissionFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface Submission {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    totalMarks: number;
    subjectName: string;
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  enrollment: {
    _id: string;
    academicYear: string;
    term: AcademicTerm;
  };
  textSubmission: string;
  files: SubmissionFile[];
  submitDate: string;
  isLate: boolean;
  lateDays: number;
  marksAwarded?: number;
  grade?: string;
  feedback?: string;
  gradedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  gradedAt?: string;
  submissionMethod: "online" | "offline";
  submissionNotes?: string;
  resubmissionCount: number;
  lastResubmissionDate?: string;
  plagiarismScore?: number;
  plagiarismReport?: string;
  studentComments?: string;
  teacherComments?: string;
  parentFeedback?: string;
  parentFeedbackDate?: string;
  status:
    | "submitted"
    | "graded"
    | "resubmitted"
    | "overdue"
    | "returned"
    | "approved";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionData {
  assignment: string;
  textSubmission: string;
  submissionType: "text" | "file" | "both";
  submissionMethod?: "online" | "offline";
  submissionNotes?: string;
  studentComments?: string;
  attachments?: File[];
}

export interface UpdateSubmissionData {
  textSubmission?: string;
  attachments?: File[];
}

export interface GradeSubmissionData {
  grade: number;
  feedback: string;
}

export interface RequestResubmissionData {
  reason: string;
  deadline: string;
}

export interface SubmissionFilterParams {
  assignment?: string;
  student?: string;
  status?: string;
}

// Content types
export type ContentType =
  | "note"
  | "assignment"
  | "slide"
  | "video"
  | "audio"
  | "document"
  | "link"
  | "quiz";
export type AccessLevel = "class" | "school" | "public";

export interface Content {
  _id: string;
  title: string;
  description?: string;
  type: ContentType;
  fileUrl?: string;
  thumbnail?: string;
  fileSize?: number;
  fileType?: string;
  class: string | Class;
  subject: string | Subject;
  uploadedBy: string | User;
  tags?: string[];
  isPublic: boolean;
  accessLevel: AccessLevel;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentData {
  title: string;
  description?: string;
  type: ContentType;
  class: string;
  subject: string;
  file?: File;
  tags?: string[];
  isPublic?: boolean;
  accessLevel?: AccessLevel;
}

export interface UpdateContentData {
  title?: string;
  description?: string;
  type?: ContentType;
  class?: string;
  subject?: string;
  tags?: string[];
  isPublic?: boolean;
  accessLevel?: AccessLevel;
}

export interface ContentFilterParams {
  class?: string;
  subject?: string;
  type?: ContentType;
  isPublic?: boolean;
  accessLevel?: AccessLevel;
  search?: string;
}

// Gradebook types
export interface GradebookAssignment {
  assignment: string | Assignment;
  marks: number;
  grade?: string;
  weight?: number;
  feedback?: string;
}

export interface GradebookTest {
  name: string;
  marks: number;
  date: string | Date;
  weight?: number;
}

export interface GradebookExam {
  name: string;
  marks: number;
  date: string | Date;
  weight?: number;
}

export interface Gradebook {
  _id: string;
  student: string | User;
  class: string | Class;
  subject: string | Subject;
  teacher: string | User;
  assignments?: GradebookAssignment[];
  tests?: GradebookTest[];
  exams?: GradebookExam[];
  totalMarks?: number;
  finalGrade?: "A" | "B" | "C" | "D" | "F";
  positionInClass?: number;
  remarks?: string;
  academicYear: string;
  term: "Term 1" | "Term 2" | "Term 3";
  isPublished: boolean;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateGradebookData {
  student: string;
  class: string;
  subject: string;
  assignments?: Omit<GradebookAssignment, "assignment">[] &
    { assignment: string }[];
  tests?: Omit<GradebookTest, "date">[] & { date: string }[];
  exams?: Omit<GradebookExam, "date">[] & { date: string }[];
  remarks?: string;
  academicYear: string;
  totalMarks?: number;
  finalGrade?: "A" | "B" | "C" | "D" | "F";
  term: "Term 1" | "Term 2" | "Term 3";
}

export interface UpdateGradebookData {
  student?: string;
  class?: string;
  subject?: string;
  teacher?: string;
  assignments?: Omit<GradebookAssignment, "assignment">[] &
    { assignment: string }[];
  tests?: Omit<GradebookTest, "date">[] & { date: string }[];
  exams?: Omit<GradebookExam, "date">[] & { date: string }[];
  totalMarks?: number;
  finalGrade?: "A" | "B" | "C" | "D" | "F";
  positionInClass?: number;
  remarks?: string;
  academicYear?: string;
  term?: "Term 1" | "Term 2" | "Term 3";
}

export interface GradebookFilterParams {
  class?: string;
  subject?: string;
  student?: string;
  academicYear?: string;
  term?: string;
  isPublished?: boolean;
}

// Attendance types
export type AttendanceSession = "morning" | "afternoon" | "full-day";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  student: string | User;
  status: AttendanceStatus;
  remark?: string;
  timeIn?: string;
  timeOut?: string;
}

export interface Attendance {
  _id: string;
  class: string | Class;
  subject?: string | Subject;
  date: string | Date;
  session: AttendanceSession;
  recordedBy: string | User;
  records: AttendanceRecord[];
  notes?: string;
  isVerified: boolean;
  verifiedBy?: string | User;
  verifiedAt?: string | Date;
  isSubmitted: boolean;
  submittedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAttendanceData {
  class: string;
  subject?: string;
  date: string;
  session: AttendanceSession;
  records: Omit<AttendanceRecord, "student">[] & { student: string }[];
  notes?: string;
}

export interface AttendanceFilterParams {
  class?: string;
  student?: string;
  month?: string;
  date?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

// Calendar Event types
export type EventType =
  | "class"
  | "exam"
  | "assignment"
  | "holiday"
  | "meeting"
  | "school"
  | "personal";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type EventAttendanceStatus = "pending" | "accepted" | "declined";

export interface EventAttendee {
  user: string | User;
  status: EventAttendanceStatus;
}

export interface RecurringEventSettings {
  isRecurring: boolean;
  frequency?: RecurringFrequency;
  endRecurring?: string | Date;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  allDay: boolean;
  location?: string;
  eventType: EventType;
  class?: string | Class;
  subject?: string | Subject;
  attendees?: EventAttendee[];
  recurring?: RecurringEventSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  eventType: EventType;
  class?: string;
  subject?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: RecurringFrequency;
    endRecurring?: string;
  };
  attendees?: Array<{
    user: string;
    status: EventAttendanceStatus;
  }>;
}

export interface UpdateCalendarEventData {
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  location?: string;
  eventType?: EventType;
  class?: string;
  subject?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: RecurringFrequency;
    endRecurring?: string;
  };
  attendees?: Array<{
    user: string;
    status: EventAttendanceStatus;
  }>;
}

export interface UpdateAttendanceStatusData {
  status: "present" | "absent" | "late" | "excused";
}

export interface CalendarEventFilterParams {
  startDate?: string;
  endDate?: string;
  type?: string;
}

// Live Session types
export type LiveSessionStatus = "scheduled" | "live" | "ended";

export interface LiveSessionParticipant {
  user: string | User;
  joinedAt: string;
}

export interface LiveSessionChatMessage {
  user: string | User;
  message: string;
  timestamp: string;
}

export interface LiveSessionSettings {
  enableChat: boolean;
  enableRecording: boolean;
  enableScreenSharing: boolean;
}

export interface LiveSession {
  _id: string;
  title: string;
  description?: string;
  teacher: string | User;
  class: string | Class;
  subject: string | Subject;
  startTime: string;
  duration: number;
  status: LiveSessionStatus;
  meetingId: string;
  meetingPassword: string;
  meetingUrl?: string;
  participants: LiveSessionParticipant[];
  recordingUrl?: string;
  chat: LiveSessionChatMessage[];
  settings: LiveSessionSettings;
  createdAt: string;
  updatedAt: string;
  endTime?: string;
  isActive?: boolean;
}

export interface CreateLiveSessionData {
  title: string;
  description?: string;
  class: string;
  subject: string;
  startTime: string;
  duration: number;
  settings?: {
    enableChat?: boolean;
    enableRecording?: boolean;
    enableScreenSharing?: boolean;
  };
}

export interface UpdateLiveSessionData {
  title?: string;
  description?: string;
  startTime?: string;
  duration?: number;
  settings?: {
    enableChat?: boolean;
    enableRecording?: boolean;
    enableScreenSharing?: boolean;
  };
}

export interface LiveSessionFilterParams {
  class?: string;
  subject?: string;
  status?: LiveSessionStatus;
  teacher?: string;
  startDate?: string;
  endDate?: string;
}

export interface AddChatMessageData {
  message: string;
}

// Feedback types
export type FeedbackType =
  | "teacher"
  | "student"
  | "content"
  | "assignment"
  | "platform"
  | "system";
export type FeedbackStatus = "submitted" | "reviewed" | "actioned" | "resolved";

export interface Feedback {
  _id: string;
  content: string;
  rating?: number;
  fromUser: string | User;
  toUser?: string | User;
  class?: string | Class;
  subject?: string | Subject;
  contentItem?: string | Content;
  feedbackType: FeedbackType;
  isAnonymous: boolean;
  status: FeedbackStatus;
  response?: string;
  respondedBy?: string | User;
  respondedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateFeedbackData {
  content: string;
  rating?: number;
  toUser?: string;
  class?: string;
  subject?: string;
  contentItem?: string;
  feedbackType: FeedbackType;
  isAnonymous?: boolean;
}

export interface FeedbackResponseData {
  response: string;
  status?: FeedbackStatus;
}

export interface FeedbackFilterParams {
  type?: FeedbackType;
  status?: FeedbackStatus;
  toUser?: string;
  fromUser?: string;
  class?: string;
  subject?: string;
  contentItem?: string;
}

// Notification types
export interface Notification {
  _id: string;
  user: string | User;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedModel?: string;
  relatedId?: string;
  createdAt: string | Date;
}

// Message types
export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
  };
  recipient?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
  };
  class?: {
    _id: string;
    name: string;
    code: string;
    level: string;
    stream: string;
  };
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  isGroupMessage: boolean;
  group?: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  content: string;
  recipient?: string;
  class?: string;
  subject?: string;
  isGroupMessage?: boolean;
  group?: string;
  attachments?: MessageAttachment[];
}

export interface UpdateMessageData {
  content: string;
}

export interface MessageFilterParams {
  recipient?: string;
  class?: string;
  subject?: string;
  status?: "read" | "unread";
  search?: string;
}

// Add this type definition to the appropriate section in the types/index.ts file
export interface LoginResult {
  success: boolean;
  user: User | null;
}

// Extend RouteObject to include roles
// export interface AppRouteObject extends RouteObject {
//   roles?: string[];
//   children?: AppRouteObject[];
// }

export interface UpdateAttendanceData {
  status?: AttendanceStatus;
  remarks?: string;
  records?: Array<{
    student: string;
    status: AttendanceStatus;
    remark?: string;
  }>;
  notes?: string;
}
