import { Class, StudentClass, TeacherClass } from "../types/class";
import api from "./api";
import {
  CreateClassData,
  UpdateClassData,
  AddSubjectToClassData,
  AssignTeacherToSubjectData,
  AssignPrefectData,
} from "../types";

export interface ClassResponse<T> {
  role: "teacher" | "student";
  data: T[];
}

class ClassService {
  async getAllClasses(): Promise<Class[]> {
    const response = await api.get("/classes");
    return response.data.data;
  }

  async getClassById(id: string): Promise<StudentClass> {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  }

  async createClass(data: CreateClassData): Promise<Class> {
    const response = await api.post("/classes", data);
    return response.data.data;
  }

  async updateClass(id: string, data: UpdateClassData): Promise<Class> {
    const response = await api.put(`/classes/${id}`, data);
    return response.data.data;
  }

  async deleteClass(id: string): Promise<void> {
    await api.delete(`/classes/${id}`);
  }

  async addSubjectToClass(
    classId: string,
    data: AddSubjectToClassData
  ): Promise<Class> {
    const response = await api.post(`/classes/${classId}/subjects`, data);
    return response.data.data;
  }

  async removeSubjectFromClass(
    classId: string,
    subjectId: string
  ): Promise<Class> {
    const response = await api.delete(
      `/classes/${classId}/subjects/${subjectId}`
    );
    return response.data.data;
  }

  async assignTeacherToSubject(
    classId: string,
    subjectId: string,
    data: AssignTeacherToSubjectData
  ): Promise<Class> {
    const response = await api.post(
      `/classes/${classId}/subjects/${subjectId}/teachers`,
      data
    );
    return response.data.data;
  }

  async removeTeacherFromSubject(
    classId: string,
    subjectId: string,
    teacherId: string
  ): Promise<Class> {
    const response = await api.delete(
      `/classes/${classId}/subjects/${subjectId}/teachers/${teacherId}`
    );
    return response.data.data;
  }

  async assignPrefect(
    classId: string,
    data: AssignPrefectData
  ): Promise<Class> {
    const response = await api.post(`/classes/${classId}/prefects`, data);
    return response.data.data;
  }

  async removePrefect(classId: string, prefectId: string): Promise<Class> {
    const response = await api.delete(
      `/classes/${classId}/prefects/${prefectId}`
    );
    return response.data.data;
  }

  async getMyClasses(): Promise<StudentClass[] | TeacherClass[]> {
    const response = await api.get<ClassResponse<StudentClass | TeacherClass>>(
      "/classes/my-classes"
    );

    // Check the role in the response to determine the correct type
    if (response.data.role === "teacher") {
      return response.data.data as TeacherClass[];
    } else {
      return response.data.data as StudentClass[];
    }
  }
}

export const classService = new ClassService();
