import api from './api';
import { 
  Attendance, 
  CreateAttendanceData, 
  UpdateAttendanceData, 
  AttendanceFilterParams 
} from '../types';

export const attendanceService = {
  // Get all attendance records with optional filters
  getAllAttendance: async (params?: AttendanceFilterParams): Promise<Attendance[]> => {
    const response = await api.get('/attendance', { params });
    return response.data.data;
  },

  // Get teacher's attendance records
  getTeacherAttendance: async (params?: AttendanceFilterParams): Promise<Attendance[]> => {
    try {
      console.log('Requesting attendance data with params:', params);
      const response = await api.get('/attendance', { params });
      console.log('API response:', response);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  },

  // Get a single attendance record by ID
  getAttendanceById: async (id: string): Promise<Attendance> => {
    const response = await api.get(`/attendance/${id}`);
    return response.data.data;
  },

  // Create a new attendance record
  createAttendance: async (data: CreateAttendanceData): Promise<Attendance> => {
    try {
      console.log('Creating attendance with data:', data);
      console.log('Records structure:', data.records);
      const response = await api.post('/attendance', data);
      console.log('API response:', response);
      return response.data.data;
    } catch (err) {
      const error = err as any;
      console.error('Error in createAttendance service:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update an existing attendance record
  updateAttendance: async (id: string, data: UpdateAttendanceData): Promise<Attendance> => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data.data;
  },

  // Submit an attendance record
  submitAttendance: async (id: string): Promise<Attendance> => {
    const response = await api.put(`/attendance/${id}/submit`, {});
    return response.data.data;
  },

  // Delete an attendance record
  deleteAttendance: async (id: string): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  async verifyAttendance(id: string): Promise<Attendance> {
    const response = await api.put(`/attendance/${id}/verify`);
    return response.data.data;
  }
}; 