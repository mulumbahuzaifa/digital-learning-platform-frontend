import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Heading,
  Flex,
  Table,
  Text,
  Button,
  Badge,
  TextField,
  Box,
  Separator,
} from "@radix-ui/themes";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

const AssignmentSubmissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch assignment details
  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  // Fetch submissions for this assignment
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["submissions", { assignment: id }],
    queryFn: () => assignmentService.getAssignmentSubmissions(id!),
    enabled: !!id,
  });

  // Handle search filtering
  const filteredSubmissions = submissions?.filter((submission) =>
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingAssignment || isLoadingSubmissions) return <LoadingSpinner />;

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  // Calculate submission statistics
  const totalSubmissions = submissions?.length || 0;
  const gradedSubmissions =
    submissions?.filter((sub) => sub.status === "graded").length || 0;
  const pendingSubmissions =
    submissions?.filter((sub) => sub.status === "submitted").length || 0;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Box>
            <Heading size="4">Assignment Submissions</Heading>
            <Text color="gray" size="2">
              Viewing all submissions for: {assignment.title}
            </Text>
          </Box>
          <Button
            variant="soft"
            onClick={() => navigate("/teacher/assignments")}
          >
            Back to Assignments
          </Button>
        </Flex>

        <Separator size="4" />

        {/* Assignment details */}
        <Card variant="surface">
          <Flex direction="column" gap="2">
            <Heading size="3">Assignment Information</Heading>
            <Flex direction="column" gap="1">
              <Text as="p" size="2">
                <strong>Title:</strong> {assignment.title}
              </Text>
              <Text as="p" size="2">
                <strong>Description:</strong> {assignment.description}
              </Text>
              <Text as="p" size="2">
                <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
              </Text>
              <Text as="p" size="2">
                <strong>Status:</strong> {assignment.status}
              </Text>
              {assignment.totalMarks && (
                <Text as="p" size="2">
                  <strong>Total Marks:</strong> {assignment.totalMarks}
                </Text>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* Submission statistics */}
        <Flex gap="4">
          <Card variant="classic" style={{ flex: 1 }}>
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold">
                {totalSubmissions}
              </Text>
              <Text size="2" color="gray">
                Total Submissions
              </Text>
            </Flex>
          </Card>
          <Card variant="classic" style={{ flex: 1 }}>
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold" color="green">
                {gradedSubmissions}
              </Text>
              <Text size="2" color="gray">
                Graded
              </Text>
            </Flex>
          </Card>
          <Card variant="classic" style={{ flex: 1 }}>
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold" color="blue">
                {pendingSubmissions}
              </Text>
              <Text size="2" color="gray">
                Pending
              </Text>
            </Flex>
          </Card>
        </Flex>

        {/* Search and filters */}
        <Flex justify="between" align="center">
          <TextField.Root
            placeholder="Search by student name..."
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {submissions?.length === 0 ? (
          <Card>
            <Flex
              direction="column"
              align="center"
              justify="center"
              p="6"
              gap="4"
            >
              <FileTextIcon width={32} height={32} />
              <Text size="3" align="center">
                No submissions received yet for this assignment.
              </Text>
            </Flex>
          </Card>
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Submitted At</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredSubmissions?.map((submission, index) => (
                <Table.Row key={submission._id}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <PersonIcon />
                      <Text>{submission.studentName}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant="soft"
                      color={
                        submission.status === "graded"
                          ? "green"
                          : submission.status === "submitted"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(submission.submittedAt)}</Table.Cell>
                  <Table.Cell>
                    {submission.status === "graded" ? (
                      <Text weight="bold">
                        {submission.grade}/{assignment.totalMarks || "-"}
                      </Text>
                    ) : (
                      <Text color="gray">Not graded</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Button asChild size="1" variant="soft">
                      <Link
                        to={`/teacher/assignments/submissions/${submission._id}`}
                      >
                        View Details
                      </Link>
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
    </Card>
  );
};

export default AssignmentSubmissions;
