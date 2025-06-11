import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '../services/calendarService';
import toast from 'react-hot-toast';
import { 
  CreateCalendarEventData, 
  UpdateCalendarEventData, 
  UpdateAttendanceStatusData 
} from '../types';

export const useCalendarMutation = () => {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: (data: CreateCalendarEventData) => 
      calendarService.createEvent(data),
    onSuccess: () => {
      toast.success('Event created successfully');
      // Invalidate calendar events query
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateCalendarEventData 
    }) => calendarService.updateEvent(id, data),
    onSuccess: (response) => {
      toast.success('Event updated successfully');
      // Invalidate specific event and events list queries
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEvent', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEvents'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      toast.success('Event deleted successfully');
      // Invalidate calendar events query
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  const updateAttendance = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateAttendanceStatusData 
    }) => calendarService.updateAttendanceStatus(id, data),
    onSuccess: (response) => {
      toast.success('Attendance status updated successfully');
      // Invalidate specific event and events list queries
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEvent', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEvents'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendance status');
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    updateAttendance,
  };
}; 