import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading, Flex, Table, Text, Button, Badge } from '@radix-ui/themes';
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";

const AssignmentSubmissions = () => {
  const { id } = useParams<{ id: string }>();

  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["submissions", { assignment: id }],
    queryFn: () => assignmentService.getAssignmentSubmissions(id!),
    enabled: !!id,
  });

  if (isLoadingAssignment || isLoadingSubmissions) return <LoadingSpinner />;

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Submissions for {assignment.title}</Heading>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Submitted At</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {submissions?.map((submission) => (
              <Table.Row key={submission._id}>
                <Table.Cell>
                  {typeof submission.student === 'string' 
                    ? submission.student 
                    : `${submission.student.firstName} ${submission.student.lastName}`}
                </Table.Cell>
                <Table.Cell>{formatDate(submission.submittedAt)}</Table.Cell>
                <Table.Cell>
                  <Badge color={submission.status === 'graded' ? 'green' : 'blue'}>
                    {submission.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {submission.marksAwarded !== undefined 
                    ? `${submission.marksAwarded}/${assignment.totalMarks}`
                    : 'Not graded'}
                </Table.Cell>
                <Table.Cell>
                  <Button variant="soft" size="2" asChild>
                    <Link to={`/admin/assignments/${id}/submissions/${submission._id}`}>
                      View Details
                    </Link>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

            {submissions?.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text align="center">No submissions yet</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Card>
  );
};

export default AssignmentSubmissions; 