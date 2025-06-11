// src/pages/admin/users/ManageRoles.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { Card, Box } from '@radix-ui/themes';
import RoleTable from '../../../components/admin/roles/RoleTable';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UserRole } from '../../../types';

const ManageRolesPage = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  const mutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => 
      userService.updateUser(userId, { role }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Updated role for ${updatedUser.firstName} ${updatedUser.lastName}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading users: {error.message}</div>;
  if (!users) return <div>No users found</div>;

  return (
    <Box className="space-y-6">
      <Card>
        <Box p="4">
          <h2 className="text-xl font-semibold mb-4">Manage User Roles</h2>
          <RoleTable 
            users={users} 
            onRoleChange={(userId, newRole) => 
              mutation.mutate({ userId, role: newRole })
            } 
            isUpdating={mutation.isPending}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ManageRolesPage;