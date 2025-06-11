import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';
import { UserCreateFormData, UserEditFormData } from '../types';

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserEditFormData> }) => 
      userService.updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserEditFormData> }) => 
      userService.updateProfile(id, data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
  };
}; 