import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Table,
  Badge,
  Grid,
  TextField,
  Select,
  Dialog
} from '@radix-ui/themes';
import { 
  PersonIcon,
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ReaderIcon,
  FileIcon,
  PlusIcon,
  TrashIcon
} from '@radix-ui/react-icons';
import { classService } from "../../../../services/classService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatDate } from "../../../../utils/formatters";
import { Class, Student } from "../../../../types/class";

const ClassStudents = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 10;

  // Fetch teacher's classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Find the current class
  const currentClass = classes?.find(cls => cls._id === id);

  // Filter students based on search term and status
  const filteredStudents = currentClass?.students.filter(student => {
    const matchesSearch = 
      `${student.student.firstName} ${student.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered students
  const paginatedStudents = filteredStudents?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Students - {currentClass?.name}</Heading>
        <Button>
          <PlusIcon /> Add Student
        </Button>
      </Flex>

      {/* Student Counter Card */}
      <Card variant="classic">
        <Flex align="center" gap="3">
          <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
            <PersonIcon width="20" height="20" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray">Total Students</Text>
            <Text size="5" weight="bold">{currentClass?.students.length || 0}</Text>
          </Flex>
        </Flex>
      </Card>

      {/* Filters */}
      <Flex gap="4">
        <TextField.Root 
          placeholder="Search students..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>

        <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger placeholder="Filter by status" />
          <Select.Content>
            <Select.Item value="all">All Status</Select.Item>
            <Select.Item value="approved">Approved</Select.Item>
            <Select.Item value="pending">Pending</Select.Item>
            <Select.Item value="rejected">Rejected</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      {/* Students Table */}
      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enrollment Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enrollment Type</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedStudents?.map(student => (
              <Table.Row key={student._id}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <Box p="1" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
                      <PersonIcon width="16" height="16" />
                    </Box>
                    <Text>{student.student.firstName} {student.student.lastName}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell>{formatDate(student.enrollmentDate)}</Table.Cell>
                <Table.Cell>
                  <Badge 
                    color={
                      student.status === 'approved' ? 'green' : 
                      student.status === 'rejected' ? 'red' : 
                      'orange'
                    }
                  >
                    {student.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="blue">
                    {student.enrollmentType}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/teacher/students/${student.student._id}`}>
                        <BookmarkIcon /> View
                      </Link>
                    </Button>
                    <Button size="1" variant="soft" color="red">
                      <TrashIcon /> Remove
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Pagination */}
      {filteredStudents && filteredStudents.length > itemsPerPage && (
        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
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
              disabled={(page * itemsPerPage) >= (filteredStudents.length)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </div>
  );
};

export default ClassStudents; 