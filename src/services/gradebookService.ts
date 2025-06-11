import api from './api';
import { 
  Gradebook, 
  CreateGradebookData, 
  UpdateGradebookData, 
  GradebookFilterParams 
} from '../types';

export const gradebookService = {
  async getAllGradebooks(params?: GradebookFilterParams): Promise<Gradebook[]> {
    const response = await api.get('/gradebook', { params });
    return response.data.data;
  },

  async getTeacherGradebooks(params?: GradebookFilterParams): Promise<Gradebook[]> {
    // This will automatically filter for only gradebooks the teacher can access
    // since the backend already handles teacher-specific filtering
    const response = await api.get('/gradebook', { params });
    return response.data.data;
  },

  async getGradebookById(id: string): Promise<Gradebook> {
    const response = await api.get(`/gradebook/${id}`);
    return response.data.data;
  },

  async createGradebook(data: CreateGradebookData): Promise<Gradebook> {
    const response = await api.post('/gradebook', data);
    return response.data.data;
  },

  async updateGradebook(id: string, data: UpdateGradebookData): Promise<Gradebook> {
    const response = await api.put(`/gradebook/${id}`, data);
    return response.data.data;
  },

  async deleteGradebook(id: string): Promise<void> {
    await api.delete(`/gradebook/${id}`);
  },

  async publishGradebook(id: string): Promise<Gradebook> {
    const response = await api.put(`/gradebook/${id}/publish`);
    return response.data.data;
  }
}; 