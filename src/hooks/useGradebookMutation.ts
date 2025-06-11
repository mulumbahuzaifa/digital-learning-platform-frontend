import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gradebookService } from '../services/gradebookService';
import toast from 'react-hot-toast';
import { CreateGradebookData, UpdateGradebookData } from '../types';

export const useGradebookMutation = () => {
  const queryClient = useQueryClient();

  const createGradebook = useMutation({
    mutationFn: (data: CreateGradebookData) => 
      gradebookService.createGradebook(data),
    onSuccess: () => {
      toast.success('Gradebook entry created successfully');
      // Invalidate gradebook list queries
      queryClient.invalidateQueries({ queryKey: ['gradebooks'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-gradebooks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create gradebook entry');
    },
  });

  const updateGradebook = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateGradebookData 
    }) => gradebookService.updateGradebook(id, data),
    onSuccess: (response) => {
      toast.success('Gradebook entry updated successfully');
      // Invalidate specific gradebook and gradebook list queries
      queryClient.invalidateQueries({ 
        queryKey: ['gradebook', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['gradebooks'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['teacher-gradebooks'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update gradebook entry');
    },
  });

  const deleteGradebook = useMutation({
    mutationFn: (id: string) => gradebookService.deleteGradebook(id),
    onSuccess: () => {
      toast.success('Gradebook entry deleted successfully');
      // Invalidate gradebook list queries
      queryClient.invalidateQueries({ queryKey: ['gradebooks'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-gradebooks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete gradebook entry');
    },
  });

  const publishGradebook = useMutation({
    mutationFn: (id: string) => gradebookService.publishGradebook(id),
    onSuccess: (response) => {
      toast.success('Gradebook entry published successfully');
      // Invalidate specific gradebook and gradebook list queries
      queryClient.invalidateQueries({ 
        queryKey: ['gradebook', response._id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['gradebooks'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['teacher-gradebooks'] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish gradebook entry');
    },
  });

  return {
    createGradebook,
    updateGradebook,
    deleteGradebook,
    publishGradebook,
  };
}; 