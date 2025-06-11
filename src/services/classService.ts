import { Class, StudentClass, TeacherClass } from "../types/class";
import api from "./api";
import {
  CreateClassData,
  UpdateClassData,
  AddSubjectToClassData,
  AssignTeacherToSubjectData,
  AssignPrefectData,
} from "../types";

export const classService = {
  async getAllClasses(): Promise<Class[]> {
    const response = await api.get("/classes");
    return response.data.data;
  },

  async getClassById(id: string): Promise<StudentClass> {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  },

  async getStudentClasses(): Promise<StudentClass[]> {
    const response = await api.get("/classes/student");
    return response.data.data;
  },

  async getTeacherClasses(): Promise<TeacherClass[]> {
    const response = await api.get("/classes/teacher");
    return response.data.data;
  },

  createClass: async (data: CreateClassData): Promise<Class> => {
    const response = await api.post("/classes", data);
    return response.data.data;
  },

  updateClass: async (id: string, data: UpdateClassData): Promise<Class> => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data.data;
  },

  deleteClass: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },

  addSubjectToClass: async (
    classId: string,
    data: AddSubjectToClassData
  ): Promise<Class> => {
    const response = await api.post(`/classes/${classId}/subjects`, data);
    return response.data.data;
  },

  removeSubjectFromClass: async (
    classId: string,
    subjectId: string
  ): Promise<Class> => {
    const response = await api.delete(
      `/classes/${classId}/subjects/${subjectId}`
    );
    return response.data.data;
  },

  assignTeacherToSubject: async (
    classId: string,
    subjectId: string,
    data: AssignTeacherToSubjectData
  ): Promise<Class> => {
    const response = await api.post(
      `/classes/${classId}/subjects/${subjectId}/teachers`,
      data
    );
    return response.data.data;
  },

  removeTeacherFromSubject: async (
    classId: string,
    subjectId: string,
    teacherId: string
  ): Promise<Class> => {
    const response = await api.delete(
      `/classes/${classId}/subjects/${subjectId}/teachers/${teacherId}`
    );
    return response.data.data;
  },

  assignPrefect: async (
    classId: string,
    data: AssignPrefectData
  ): Promise<Class> => {
    const response = await api.post(`/classes/${classId}/prefects`, data);
    return response.data.data;
  },

  removePrefect: async (classId: string, prefectId: string): Promise<Class> => {
    const response = await api.delete(
      `/classes/${classId}/prefects/${prefectId}`
    );
    return response.data.data;
  },

  getMyClasses: async (): Promise<StudentClass[] | TeacherClass[]> => {
    const response = await api.get("/classes/my-classes");
    return response.data.data;
  },
};
