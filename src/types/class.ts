export interface Student {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  status: "approved" | "pending" | "rejected";
  enrollmentType: "new" | "transfer";
  enrollmentDate: string;
  enrolledBy: string;
  _id: string;
}

// Import and re-export with different names to avoid conflicts
import type { ClassStudent as IndexClassStudent } from "../types";
export type StudentFromIndex = IndexClassStudent;

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClassSubject {
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  teachers: {
    teacher: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    status: "pending" | "approved" | "rejected";
    approvedAt?: Date;
    isLeadTeacher: boolean;
    assignedBy: string;
  }[];
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

// Types for student's view of a class
export interface StudentClass extends Omit<Class, "subjects"> {
  code: string;
  level: string;
  subjects: {
    subject: {
      _id: string;
      name: string;
      code: string;
      isActive: boolean;
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
    }[];
    teachers: {
      teacher: {
        _id: string;
        firstName: string;
        lastName: string;
      };
      status: "pending" | "approved" | "rejected";
      approvedAt?: Date;
      isLeadTeacher: boolean;
      assignedBy: string;
    }[];
  }[];
  enrollmentDate: string;
  students?: {
    student: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    }[];
    enrollmentDate: string;
  }[];
}

// Types for teacher's view of a class
export interface TeacherClass extends Omit<Class, "subjects"> {
  subjects: {
    _id: string;
    name: string;
    code: string;
  }[];
  currentEnrollments: {
    student: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    academicYear: string;
    term: string;
    subjects: {
      subject: {
        _id: string;
        name: string;
        code: string;
      };
      status: string;
    }[];
  }[];
}

export type AcademicTerm = "Term 1" | "Term 2" | "Term 3";
