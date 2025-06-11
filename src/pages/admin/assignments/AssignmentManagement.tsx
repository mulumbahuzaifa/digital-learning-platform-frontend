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
  Grid,
  Select
} from '@radix-ui/themes';
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { 
  Pencil2Icon, 
  TrashIcon,
  MagnifyingGlassIcon,
  SymbolIcon,
  BookmarkIcon
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { AssignmentStatus } from "../../../types";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";

const AssignmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<AssignmentStatus | undefined>(undefined);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ["assignments", { status }],
    queryFn: () => assignmentService.getAllAssignments({ status }),
  });

  const { deleteAssignment } = useAssignmentMutation();

  const filteredAssignments = assignments?.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAssignments = filteredAssignments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading assignments</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">Assignment Management</Heading>
          <Button asChild>
            <Link to="/admin/assignments/create">Create Assignment</Link>
          </Button>
        </Flex>

        {/* Assignment Counter Card */}
        <Card variant="classic">
          <Flex align="center" gap="3">
            <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
              <BookmarkIcon width="20" height="20" />
            </Box>
            <Flex direction="column">
              <Text size="2" color="gray">Total Assignments</Text>
              <Text size="5" weight="bold">{assignments?.length || 0}</Text>
            </Flex>
          </Flex>
        </Card>

        {/* Filters */}
        <Grid columns="2" gap="4">
          <TextField.Root 
            placeholder="Search assignments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root value={status} onValueChange={(value) => setStatus(value as AssignmentStatus)}>
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Status</Select.Label>
                <Select.Item value="draft">Draft</Select.Item>
                <Select.Item value="published">Published</Select.Item>
                <Select.Item value="closed">Closed</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Grid>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedAssignments?.map((assignment, index) => (
              <Table.Row key={assignment._id}>
                <Table.Cell>
                  {(page - 1) * itemsPerPage + index + 1}
                </Table.Cell>
                <Table.RowHeaderCell>
                  <Flex align="center" gap="2">
                    <BookmarkIcon />
                    <Text>{assignment.title}</Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell>
                  {typeof assignment.class === 'object' ? assignment.class.name : 'Loading...'}
                </Table.Cell>
                <Table.Cell>
                  {typeof assignment.subject === 'object' ? assignment.subject.name : 'Loading...'}
                </Table.Cell>
                <Table.Cell>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    variant="soft"
                    color={
                      assignment.status === 'published' ? 'green' :
                      assignment.status === 'closed' ? 'red' : 'gray'
                    }
                  >
                    {assignment.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/assignments/${assignment._id}/submissions`}>
                        View Submissions
                      </Link>
                    </Button>
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/assignments/${assignment._id}/edit`}>
                        <Pencil2Icon /> Edit
                      </Link>
                    </Button>
                    <Button 
                      size="1" 
                      variant="soft" 
                      color="red"
                      onClick={() => setAssignmentToDelete(assignment._id)}
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
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredAssignments?.length || 0)} of {filteredAssignments?.length} assignments
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
              disabled={(page * itemsPerPage) >= (filteredAssignments?.length || 0)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root 
          open={!!assignmentToDelete} 
          onOpenChange={(open) => !open && setAssignmentToDelete(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to delete this assignment? This action cannot be undone.
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
                  onClick={() => assignmentToDelete && deleteAssignment.mutate(assignmentToDelete)}
                  disabled={deleteAssignment.isPending}
                >
                  {deleteAssignment.isPending ? 'Deleting...' : 'Delete Assignment'}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
};

export default AssignmentManagement; 