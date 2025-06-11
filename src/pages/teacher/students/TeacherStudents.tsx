import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Table,
  Badge,
  ScrollArea
} from '@radix-ui/themes';
import { 
  PersonIcon,
  MagnifyingGlassIcon
} from '@radix-ui/react-icons';
import { studentService } from '../../../services/studentService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Import the Student type from our service file
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  class?: {
      _id: string;
      name: string;
    code: string;
    year: string;
    academicTerm: string;
    };
  status?: 'active' | 'inactive' | 'approved' | 'pending' | 'rejected';
}

const TeacherStudents = () => {
  const { data: students, isLoading, error } = useQuery<Student[]>({
    queryKey: ['teacher-students'],
    queryFn: () => studentService.getMyStudents(),
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div>Error loading students</div>;

  if (!students || students.length === 0) {
    return (
      <div className="space-y-6">
        <Flex justify="between" align="center">
          <Heading size="6">My Students</Heading>
          <Button asChild>
            <Link to="/teacher/students/enroll">Enroll Student</Link>
          </Button>
        </Flex>
        
        <Card>
          <Flex direction="column" align="center" justify="center" p="6" gap="4">
            <PersonIcon width={32} height={32} />
            <Text size="3" align="center">
              You don't have any students assigned to your classes yet.
            </Text>
            <Button asChild>
              <Link to="/teacher/students/enroll">Enroll Student</Link>
            </Button>
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">My Students ({students.length})</Heading>
        <Flex gap="3">
        <Button asChild>
            <Link to="/teacher/students/enroll">Enroll Student</Link>
        </Button>
        </Flex>
      </Flex>

      <Card>
        <Box mb="4">
          <Flex>
            <Box className="flex-grow-1">
              <Flex gap="3" align="center">
                <MagnifyingGlassIcon />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Flex>
            </Box>
          </Flex>
        </Box>

        <ScrollArea scrollbars="horizontal">
          <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
              {students.map((student: Student) => (
                <Table.Row key={student._id}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <PersonIcon />
                      <Text>{student.firstName} {student.lastName}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{student.email}</Table.Cell>
                  <Table.Cell>
                    {student.class ? (
                      <Flex direction="column" gap="1">
                        <Text key={`${student._id}-class-name`}>{student.class.name}</Text>
                        <Text key={`${student._id}-class-code`} size="1" color="gray">{student.class.code}</Text>
                      </Flex>
                    ) : 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={
                      student.status === 'approved' || student.status === 'active' ? 'green' : 
                      student.status === 'rejected' || student.status === 'inactive' ? 'red' : 
                      'orange'
                    }>
                      {student.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button size="1" variant="soft" asChild>
                      <Link to={`/teacher/students/${student._id}`}>
                          View
                      </Link>
                    </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default TeacherStudents;