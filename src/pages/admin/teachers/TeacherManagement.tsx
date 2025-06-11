import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Heading, 
  Button, 
  Table, 
  Text, 
  Badge, 
  TextField,
  Select,
  AlertDialog,
} from '@radix-ui/themes';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/userService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { PlusIcon, Pencil2Icon, TrashIcon, EyeOpenIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { User } from '../../../types';
import { formatDate } from '../../../utils/formatters';

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all teachers
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['users', { role: 'teacher' }],
    queryFn: () => userService.getAllUsers({ role: 'teacher' }),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Filter teachers based on search term and filters
  const filteredTeachers = teachers?.filter(teacher => {
    const matchesSearch = searchTerm === '' || 
      `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && teacher.isVerified) ||
      (filterVerified === 'unverified' && !teacher.isVerified);
    
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && teacher.isActive) ||
      (filterActive === 'inactive' && !teacher.isActive);
    
    return matchesSearch && matchesVerified && matchesActive;
  }) || [];

  // Paginate teachers
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Teacher Management</Heading>
          <Button asChild>
            <Link to="/admin/users/create">
              <PlusIcon /> Add Teacher
            </Link>
          </Button>
        </Flex>

        <Flex wrap="wrap" gap="3" align="end">
          {/* Search */}
          <TextField.Root style={{ maxWidth: '250px' }}>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <input
              placeholder="Search teachers..." 
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              style={{ 
                border: 'none',
                outline: 'none',
                padding: '8px 10px',
                width: '100%',
                backgroundColor: 'transparent'
              }}
            />
          </TextField.Root>

          {/* Verification filter */}
          <Select.Root 
            value={filterVerified} 
            onValueChange={(value) => {
              setFilterVerified(value);
              setCurrentPage(1);
            }}
          >
            <Select.Trigger placeholder="Verification status" />
            <Select.Content>
              <Select.Item value="all">All Verification</Select.Item>
              <Select.Item value="verified">Verified</Select.Item>
              <Select.Item value="unverified">Unverified</Select.Item>
            </Select.Content>
          </Select.Root>

          {/* Active status filter */}
          <Select.Root 
            value={filterActive} 
            onValueChange={(value) => {
              setFilterActive(value);
              setCurrentPage(1);
            }}
          >
            <Select.Trigger placeholder="Active status" />
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="inactive">Inactive</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Department</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedTeachers.length > 0 ? (
              paginatedTeachers.map((teacher: User) => (
                <Table.Row key={teacher._id}>
                  <Table.Cell>
                    <Text weight="medium">
                      {teacher.firstName} {teacher.lastName}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {teacher.email}
                  </Table.Cell>
                  <Table.Cell>
                    {teacher.profile?.department || 'Not assigned'}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Badge color={teacher.isVerified ? 'green' : 'amber'}>
                        {teacher.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge color={teacher.isActive ? 'blue' : 'gray'}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(teacher.createdAt?.toString() || '')}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => navigate(`/admin/teachers/${teacher._id}`)}
                      >
                        <EyeOpenIcon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="amber"
                        onClick={() => navigate(`/admin/users/${teacher._id}/edit`)}
                      >
                        <Pencil2Icon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => navigate(`/admin/teachers/${teacher._id}/qualifications`)}
                      >
                        View Qualifications
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text align="center">No teachers found</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {filteredTeachers.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} teachers
            </Text>
            <Flex gap="2">
              <Button 
                variant="soft" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="soft" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default TeacherManagement; 