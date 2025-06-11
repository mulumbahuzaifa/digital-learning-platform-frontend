import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import toast from 'react-hot-toast';
import { CreateAttendanceData, UpdateAttendanceData } from '../types';

export const useAttendanceMutation = () => {
  const queryClient = useQueryClient();

  const createAttendance = useMutation({
    mutationFn: (data: CreateAttendanceData) => 
      attendanceService.createAttendance(data),
    onSuccess: () => {
      toast.success('Attendance record created successfully');
      // Invalidate attendance list queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create attendance record');
    },
  });

  const updateAttendance = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateAttendanceData 
    }) => attendanceService.updateAttendance(id, data),
    onSuccess: (response) => {
      toast.success('Attendance record updated successfully');
      // Invalidate specific attendance and attendance list queries
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['attendance'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendance record');
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: (id: string) => attendanceService.deleteAttendance(id),
    onSuccess: () => {
      toast.success('Attendance record deleted successfully');
      // Invalidate attendance list queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance record');
    },
  });

  const submitAttendance = useMutation({
    mutationFn: (id: string) => attendanceService.submitAttendance(id),
    onSuccess: (response) => {
      toast.success('Attendance record submitted successfully');
      // Invalidate specific attendance and attendance list queries
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['attendance'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit attendance record');
    },
  });

  const verifyAttendance = useMutation({
    mutationFn: (id: string) => attendanceService.verifyAttendance(id),
    onSuccess: (response) => {
      toast.success('Attendance record verified successfully');
      // Invalidate specific attendance and attendance list queries
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['attendance'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify attendance record');
    },
  });

  return {
    createAttendance,
    updateAttendance,
    deleteAttendance,
    submitAttendance,
    verifyAttendance,
  };
}; 