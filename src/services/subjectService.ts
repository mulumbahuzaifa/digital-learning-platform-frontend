import api from "./api";
import {
  CreateSubjectData,
  UpdateSubjectData,
  SubjectFilterParams,
  SubjectResponse,
  SingleSubjectResponse,
} from "../types";

export const subjectService = {
  // Public routes (authenticated users)
  async getAllSubjects(params?: SubjectFilterParams): Promise<SubjectResponse> {
    const response = await api.get("/subjects", { params });
    return response.data;
  },

  async getSubjectById(id: string): Promise<SingleSubjectResponse> {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  async getSubjectClasses(id: string): Promise<SubjectResponse> {
    const response = await api.get(`/subjects/${id}/classes`);
    return response.data;
  },

  async getSubjectTeachers(id: string): Promise<SubjectResponse> {
    const response = await api.get(`/subjects/${id}/teachers`);
    return response.data;
  },

  async getSubjectStudents(id: string): Promise<SubjectResponse> {
    const response = await api.get(`/subjects/${id}/students`);
    return response.data;
  },

  // Admin only routes
  async createSubject(data: CreateSubjectData): Promise<SingleSubjectResponse> {
    const response = await api.post("/subjects", data);
    return response.data;
  },

  async updateSubject(
    id: string,
    data: UpdateSubjectData
  ): Promise<SingleSubjectResponse> {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  async deleteSubject(id: string): Promise<SingleSubjectResponse> {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
