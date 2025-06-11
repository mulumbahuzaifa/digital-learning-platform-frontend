import { useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Table, 
  Text,
  Button, 
  Badge,
  Select,
  TextField
} from '@radix-ui/themes';
import { assignmentService } from '../../../services/assignmentService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils/dateUtils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const AllSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all_statuses');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: () => assignmentService.getAllSubmissions(),
  });

  // Fetch all assignments to use for reference
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentService.getAllAssignments(),
  });

  if (isLoadingSubmissions || isLoadingAssignments) return <LoadingSpinner />;

  // Create a map of assignment IDs to titles for quick reference
  const assignmentMap = assignments?.reduce((map, assignment) => {
    map[assignment._id] = assignment;
    return map;
  }, {} as { [key: string]: any }) || {};

  // Filter submissions based on search term and status filter
  const filteredSubmissions = submissions?.filter(submission => {
    let matchesSearch = true;
    let matchesStatus = true;

    // If search term exists, check against student name and assignment title
    if (searchTerm) {
      const studentName = typeof submission.student === 'string' 
        ? submission.student 
        : `${submission.student.firstName} ${submission.student.lastName}`;
      
      const assignmentTitle = typeof submission.assignment === 'string'
        ? assignmentMap[submission.assignment]?.title || ''
        : submission.assignment.title;
        
      matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    }

    // Filter by status if selected
    if (statusFilter && statusFilter !== 'all_statuses') {
      matchesStatus = submission.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  }) || [];

  // Paginate filtered submissions
  const paginatedSubmissions = filteredSubmissions.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const getAssignmentInfo = (submission: any) => {
    if (typeof submission.assignment === 'string') {
      const assignment = assignmentMap[submission.assignment];
      return assignment 
        ? { title: assignment.title, id: assignment._id }
        : { title: 'Unknown Assignment', id: submission.assignment };
    } else {
      return { 
        title: submission.assignment.title, 
        id: submission.assignment._id 
      };
    }
  };

  const getStudentName = (submission: any) => {
    return typeof submission.student === 'string' 
      ? submission.student 
      : `${submission.student.firstName} ${submission.student.lastName}`;
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">All Submissions</Heading>
          <Flex gap="3">
            <Box>
              <TextField.Root>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
                <TextField.Slot>
                  <input 
                    type="text"
                    placeholder="Search submissions..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Select.Root 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <Select.Trigger placeholder="Filter by status" />
              <Select.Content>
                <Select.Item value="all_statuses">All Statuses</Select.Item>
                <Select.Item value="submitted">Submitted</Select.Item>
                <Select.Item value="graded">Graded</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Submitted</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedSubmissions.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text align="center" color="gray">No submissions found</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              paginatedSubmissions.map((submission) => {
                const { title: assignmentTitle, id: assignmentId } = getAssignmentInfo(submission);
                const assignment = assignmentMap[assignmentId];
                
                return (
                  <Table.Row key={submission._id}>
                    <Table.Cell>{getStudentName(submission)}</Table.Cell>
                    <Table.Cell>
                      <Link to={`/admin/assignments/${assignmentId}`}>
                        {assignmentTitle}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{formatDate(submission.submittedAt)}</Table.Cell>
                    <Table.Cell>
                      <Badge color={submission.status === 'graded' ? 'green' : 'blue'}>
                        {submission.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {submission.marksAwarded !== undefined && assignment?.totalMarks
                        ? `${submission.marksAwarded}/${assignment.totalMarks}`
                        : 'Not graded'}
                    </Table.Cell>
                    <Table.Cell>
                      <Button asChild size="1" variant="soft">
                        <Link to={`/admin/assignments/${assignmentId}/submissions/${submission._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>

        {filteredSubmissions.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
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
                disabled={(page * itemsPerPage) >= filteredSubmissions.length}
                onClick={() => setPage(p => p + 1)}
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

export default AllSubmissions; 