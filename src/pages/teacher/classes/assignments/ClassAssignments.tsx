import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { 
  Button, 
  Table, 
  Badge, 
  Flex, 
  Text, 
  Card, 
  Heading,
  Box,
  TextField,
  Select
} from '@radix-ui/themes';
import { assignmentService } from "../../../../services/assignmentService";
import { classService } from "../../../../services/classService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { 
  Pencil2Icon, 
  TrashIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  EyeOpenIcon
} from '@radix-ui/react-icons';
import { useState } from 'react';
import { Assignment, AssignmentStatus, Class } from "../../../../types";
import { useAssignmentMutation } from "../../../../hooks/useAssignmentMutation";

const ClassAssignments = () => {
  const { id: classId } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<AssignmentStatus | 'all_statuses'>('all_statuses');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch class details
  const { data: classDetails, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => classService.getClassById(classId!),
    enabled: !!classId
  });

  // Fetch assignments for this specific class
  const { data: assignments, isLoading: isLoadingAssignments, error } = useQuery<Assignment[]>({
    queryKey: ["class-assignments", { classId, status }],
    queryFn: () => assignmentService.getTeacherAssignments({ 
      class: classId,
      status: status === 'all_statuses' ? undefined : status
    }),
    enabled: !!classId && !isLoadingClass,
  });

  const { deleteAssignment } = useAssignmentMutation();

  const filteredAssignments = assignments?.filter((assignment: Assignment) => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAssignments = filteredAssignments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoadingAssignments || isLoadingClass) return <LoadingSpinner />;
  if (error) return <div>Error loading assignments</div>;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Box>
          <Heading size="6">{classDetails?.name} - Assignments</Heading>
          <Text size="2" color="gray">Manage assignments for this class</Text>
        </Box>
        
        <Flex gap="3">
          <Button asChild>
            <Link to={`/teacher/assignments/create?class=${classId}`}>
              Create Assignment
            </Link>
          </Button>
          <Button variant="soft" asChild>
            <Link to={`/teacher/classes/${classId}`}>
              Back to Class
            </Link>
          </Button>
        </Flex>
      </Flex>

      <Card variant="surface">
        <Flex justify="between" p="4">
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
                <Select.Item value="all_statuses">All Status</Select.Item>
                <Select.Item value="draft">Draft</Select.Item>
                <Select.Item value="published">Published</Select.Item>
                <Select.Item value="archived">Archived</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Card>

      {paginatedAssignments?.length === 0 ? (
        <Card>
          <Flex direction="column" align="center" justify="center" p="6" gap="4">
            <BookmarkIcon width={32} height={32} />
            <Text size="3" align="center">
              No assignments found for this class. Create your first assignment!
            </Text>
            <Button asChild>
              <Link to={`/teacher/assignments/create?class=${classId}`}>Create Assignment</Link>
            </Button>
          </Flex>
        </Card>
      ) : (
        <Card>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Submissions</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {paginatedAssignments?.map((assignment: Assignment, index: number) => (
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
                    {assignment.subjectName || 
                      (typeof assignment.subject === 'object' ? assignment.subject.name : 'N/A')}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      variant="soft"
                      color={
                        assignment.status === 'published' ? 'green' :
                        assignment.status === 'archived' ? 'red' : 'gray'
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {assignment.submissionCount || '0'} submissions
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button asChild size="1" variant="soft">
                        <Link to={`/teacher/assignments/submissions/${assignment._id}`}>
                          <EyeOpenIcon /> Submissions
                        </Link>
                      </Button>
                      <Button asChild size="1" variant="soft">
                        <Link to={`/teacher/assignments/${assignment._id}/edit`}>
                          <Pencil2Icon /> Edit
                        </Link>
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {paginatedAssignments && paginatedAssignments.length > 0 && (
            <Flex justify="between" align="center" p="4">
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
          )}
        </Card>
      )}
    </div>
  );
};

export default ClassAssignments; 