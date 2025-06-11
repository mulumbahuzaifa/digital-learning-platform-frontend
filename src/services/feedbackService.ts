import api from './api';
import {
  Feedback,
  CreateFeedbackData,
  UpdateFeedbackData,
  FeedbackResponseData,
  FeedbackFilterParams
} from '../types';

export const feedbackService = {
  async getFeedback(params?: FeedbackFilterParams): Promise<Feedback[]> {
    const response = await api.get('/feedback', { params });
    return response.data.data;
  },

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await api.get(`/feedback/${id}`);
    return response.data.data;
  },

  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    const response = await api.post('/feedback', data);
    return response.data.data;
  },

  async updateFeedback(id: string, data: UpdateFeedbackData): Promise<Feedback> {
    const response = await api.put(`/feedback/${id}`, data);
    return response.data.data;
  },

  async deleteFeedback(id: string): Promise<void> {
    await api.delete(`/feedback/${id}`);
  },

  async respondToFeedback(id: string, data: FeedbackResponseData): Promise<Feedback> {
    const response = await api.put(`/feedback/${id}/respond`, data);
    return response.data.data;
  }
}; 