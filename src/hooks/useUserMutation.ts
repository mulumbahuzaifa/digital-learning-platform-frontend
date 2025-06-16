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
    onSuccess: (updatedUser) => {
      toast.success('User updated successfully');
      
      // Show a specific message when a user is verified
      if (updatedUser && 'isVerified' in updatedUser) {
        if (updatedUser.isVerified) {
          toast.success(`User ${updatedUser.firstName} ${updatedUser.lastName} has been verified successfully`, {
            duration: 5000,
            icon: '✅',
          });
        } else {
          toast.success(`User ${updatedUser.firstName} ${updatedUser.lastName} has been unverified`, {
            duration: 5000,
            icon: '⚠️',
          });
        }
      }
      
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