// src/pages/admin/users/UserManagement.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Button, 
  Table, 
  Badge, 
  Flex, 
  Text, 
  Card, 
  Heading,
  AlertDialog,
  Box,
  TextField,
  Grid
} from '@radix-ui/themes';
import { userService } from "../../../services/userService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { 
  CheckIcon, 
  Cross2Icon, 
  Pencil2Icon, 
  PersonIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SymbolIcon
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { GetAllUsersParams, UserRole } from "../../../types";
import { useUserMutation } from "../../../hooks/useUserMutation";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: () => userService.getAllUsers(
      searchTerm ? { search: searchTerm } as GetAllUsersParams : undefined
    ),
  });

  const { deleteUser } = useUserMutation();

  const filteredUsers = users?.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Count users by role
  const roleCounts = users?.reduce((acc, user) => {
      const role = user.role as UserRole;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, { admin: 0, teacher: 0, student: 0 } as Record<UserRole, number>);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading users</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">User Management</Heading>
          <Button asChild>
            <Link to="/admin/users/create">Create User</Link>
          </Button>
        </Flex>

        {/* User Counter Cards */}
        <Grid columns="3" gap="4">
          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
                <SymbolIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">Total Users</Text>
                <Text size="5" weight="bold">{users?.length || 0}</Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box p="2" style={{ background: 'var(--purple-3)', borderRadius: '50%' }}>
                <PersonIcon width="20" height="20" color="var(--purple-11)" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">Admins</Text>
                <Text size="5" weight="bold">{roleCounts?.admin || 0}</Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box p="2" style={{ background: 'var(--blue-3)', borderRadius: '50%' }}>
                <PersonIcon width="20" height="20" color="var(--blue-11)" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">Teachers</Text>
                <Text size="5" weight="bold">{roleCounts?.teacher || 0}</Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        <TextField.Root 
          placeholder="Search users..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Verified</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedUsers?.map((user, index) => (
              <Table.Row key={user._id}>
                <Table.Cell>
                  {(page - 1) * itemsPerPage + index + 1}
                </Table.Cell>
                <Table.RowHeaderCell>
                  <Flex align="center" gap="2">
                    <PersonIcon />
                    <Text>
                      {user.firstName} {user.lastName}
                    </Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <Badge 
                    color={
                      user.role === 'admin' ? 'purple' :
                      user.role === 'teacher' ? 'blue' : 'green'
                    }
                    variant="soft"
                  >
                    {user.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    color={user.isActive ? 'green' : 'red'} 
                    variant="soft"
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    color={user.isVerified ? 'green' : 'orange'} 
                    variant="soft"
                  >
                    <Flex align="center" gap="1">
                      {user.isVerified ? <CheckIcon /> : <Cross2Icon />}
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Flex>
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/users/${user._id}/edit`}>
                        <Pencil2Icon /> Edit
                      </Link>
                    </Button>
                    <Button 
                      size="1" 
                      variant="soft" 
                      color="red"
                      onClick={() => setUserToDelete(user._id)}
                    >
                      <TrashIcon /> Delete
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {filteredUsers?.length ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min(page * itemsPerPage, filteredUsers?.length || 0)} of {filteredUsers?.length || 0} users
          </Text>
          <Flex gap="2">
            <Button 
              variant="soft" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="soft" 
              disabled={(page * itemsPerPage) >= (filteredUsers?.length || 0)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root 
          open={!!userToDelete} 
          onOpenChange={(open) => !open && setUserToDelete(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button 
                  variant="solid" 
                  color="red"
                  onClick={() => userToDelete && deleteUser.mutate(userToDelete)}
                  disabled={deleteUser.isPending}
                >
                  {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
};

export default UserManagement;