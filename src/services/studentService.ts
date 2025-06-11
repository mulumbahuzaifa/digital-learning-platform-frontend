import api from "./api";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  status?: 'active' | 'inactive' | 'approved' | 'pending' | 'rejected';
  phone?: string;
  address?: string;
  enrollmentType?: 'new' | 'transfer';
  enrollmentDate?: string;
  class?: {
    _id: string;
    name: string;
    code: string;
    year: string;
    academicTerm: string;
  };
  classes?: {
    class: {
      _id: string;
      name: string;
      year: string;
      academicTerm: string;
    };
    status: string;
  }[];
  grades?: {
    _id: string;
    assignment: {
      _id: string;
      title: string;
    };
    subject: {
      _id: string;
      name: string;
    };
    score: number;
    totalScore: number;
  }[];
  attendance?: {
    _id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    class: {
      _id: string;
      name: string;
    };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

interface GetStudentsParams {
  class?: string;
  status?: string;
  search?: string;
}

export const studentService = {
  getAllStudents: async (params?: GetStudentsParams): Promise<Student[]> => {
    const response = await api.get("/users/students", { params });
    return response.data.data;
  },

  getStudent: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },

  createStudent: async (studentData: Partial<Student>): Promise<Student> => {
    const response = await api.post("/students", studentData);
    return response.data.data;
  },

  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  // Teacher specific endpoints
  getMyStudents: async (): Promise<Student[]> => {
    try {
      // First, get the teacher's attached classes
      const classResponse = await api.get("/classes/my-classes");
      const myClasses = classResponse.data.data;
      
      if (!myClasses || myClasses.length === 0) {
        return [];
      }
      
      // Collect all students from all classes
      let allStudents: Student[] = [];
      
      // Extract student data from each class
      myClasses.forEach((classData: any) => {
        if (classData.students && classData.students.length > 0) {
          console.log(classData.students);
          // Map students to the expected Student format
          const classStudents = classData.students.map((student: any) => ({
            _id: student.student?._id,
            firstName: student.student?.firstName,
            lastName: student.student?.lastName,
            email: student.student?.email || '',
            status: student.status,
            enrollmentType: student.enrollmentType,
            enrollmentDate: student.enrollmentDate,
            class: {
              _id: classData._id,
              name: classData.name,
              code: classData.code,
              year: classData.year,
              academicTerm: classData.academicTerm
            }
          }));
          
          allStudents = [...allStudents, ...classStudents];
        }
      });
      
      return allStudents;
    } catch (error) {
      console.error("Error fetching my students:", error);
      throw error;
    }
  },

  getStudentGrades: async (studentId: string): Promise<any[]> => {
    const response = await api.get(`/students/${studentId}/grades`);
    return response.data.data;
  },

  getStudentAttendance: async (studentId: string, classId?: string): Promise<any[]> => {
    const params = classId ? { class: classId } : undefined;
    const response = await api.get(`/students/${studentId}/attendance`, { params });
    return response.data.data;
  },

  recordAttendance: async (
    studentId: string,
    classId: string,
    date: string,
    status: 'present' | 'absent' | 'late'
  ): Promise<any> => {
    const response = await api.post(`/students/${studentId}/attendance`, {
      class: classId,
      date,
      status
    });
    return response.data.data;
  }
};