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
  Select,
  AlertDialog,
  Box,
} from '@radix-ui/themes';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/userService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { PlusIcon, Pencil2Icon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { User, Qualification } from '../../../types';

const QualificationsManagement = () => {
  const navigate = useNavigate();
  const [filterSubject, setFilterSubject] = useState<string>('all');
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

  // Extract unique subjects from teacher qualifications
  const subjects = Array.from(new Set(
    teachers?.flatMap(teacher => 
      teacher.profile?.qualifications?.map(q => q.subject) || []
    ).filter(Boolean)
  ));

  // Create combined array of teachers with their qualifications
  const teacherQualifications = teachers?.flatMap(teacher => 
    (teacher.profile?.qualifications || []).map(qualification => ({
      teacherId: teacher._id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      qualification
    }))
  ) || [];

  // Filter by subject
  const filteredQualifications = teacherQualifications.filter(item => 
    filterSubject === 'all' || item.qualification.subject === filterSubject
  );

  // Paginate
  const totalPages = Math.ceil(filteredQualifications.length / itemsPerPage);
  const paginatedQualifications = filteredQualifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Teacher Qualifications</Heading>
          <Button asChild>
            <Link to="/admin/qualifications/add">
              <PlusIcon /> Add Qualification
            </Link>
          </Button>
        </Flex>

        <Flex wrap="wrap" gap="3" align="end">
          {/* Subject filter */}
          <Select.Root 
            value={filterSubject} 
            onValueChange={(value) => {
              setFilterSubject(value);
              setCurrentPage(1);
            }}
          >
            <Select.Trigger placeholder="Filter by subject" />
            <Select.Content>
              <Select.Item value="all">All Subjects</Select.Item>
              {subjects.map((subject, index) => (
                <Select.Item key={index} value={subject as string}>
                  {subject}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Teacher</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Qualification Level</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Institution</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Year Obtained</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Experience</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedQualifications.length > 0 ? (
              paginatedQualifications.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Text weight="medium">
                      {item.teacherName}
                    </Text>
                    <Text size="1" color="gray">
                      {item.teacherEmail}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {item.qualification.subject}
                  </Table.Cell>
                  <Table.Cell>
                    {item.qualification.qualificationLevel}
                  </Table.Cell>
                  <Table.Cell>
                    {item.qualification.institution}
                  </Table.Cell>
                  <Table.Cell>
                    {item.qualification.yearObtained || 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    {item.qualification.yearsOfExperience 
                      ? `${item.qualification.yearsOfExperience} years` 
                      : 'N/A'
                    }
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button 
                        size="1" 
                        variant="soft"
                        onClick={() => navigate(`/admin/teachers/${item.teacherId}`)}
                      >
                        <EyeOpenIcon /> View Teacher
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="amber"
                        onClick={() => navigate(`/admin/teachers/${item.teacherId}/qualifications/edit`)}
                      >
                        <Pencil2Icon /> Edit
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Box py="4">
                    <Text align="center">No qualifications found</Text>
                  </Box>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {filteredQualifications.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredQualifications.length)} of {filteredQualifications.length} qualifications
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

export default QualificationsManagement; 