import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '../services/feedbackService';
import toast from 'react-hot-toast';
import { 
  CreateFeedbackData, 
  UpdateFeedbackData, 
  FeedbackResponseData 
} from '../types';

export const useFeedbackMutation = () => {
  const queryClient = useQueryClient();

  const createFeedback = useMutation({
    mutationFn: (data: CreateFeedbackData) => 
      feedbackService.createFeedback(data),
    onSuccess: () => {
      toast.success('Feedback submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit feedback');
    },
  });

  const updateFeedback = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateFeedbackData 
    }) => feedbackService.updateFeedback(id, data),
    onSuccess: (response) => {
      toast.success('Feedback updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['feedback'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update feedback');
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: (id: string) => feedbackService.deleteFeedback(id),
    onSuccess: () => {
      toast.success('Feedback deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete feedback');
    },
  });

  const respondToFeedback = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: FeedbackResponseData 
    }) => feedbackService.respondToFeedback(id, data),
    onSuccess: (response) => {
      toast.success('Response submitted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['feedback'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit response');
    },
  });

  return {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    respondToFeedback,
  };
}; 