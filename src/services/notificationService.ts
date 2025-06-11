import api from './api';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/notifications/${id}`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async clearNotifications(): Promise<void> {
    await api.delete('/notifications');
  }
}; 