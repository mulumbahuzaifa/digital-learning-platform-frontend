import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { contentService } from '../services/contentService';
import { CreateContentData, UpdateContentData } from '../types';

export const useContentMutation = () => {
  const queryClient = useQueryClient();

  const createContent = useMutation({
    mutationFn: (data: CreateContentData) => contentService.createContent(data),
    onSuccess: () => {
      toast.success('Content created successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create content');
    },
  });

  const updateContent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContentData }) => 
      contentService.updateContent(id, data),
    onSuccess: (_, variables) => {
      toast.success('Content updated successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', variables.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update content');
    },
  });

  const deleteContent = useMutation({
    mutationFn: (id: string) => contentService.deleteContent(id),
    onSuccess: (_, id) => {
      toast.success('Content deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete content');
    },
  });

  return {
    createContent,
    updateContent,
    deleteContent,
  };
}; 