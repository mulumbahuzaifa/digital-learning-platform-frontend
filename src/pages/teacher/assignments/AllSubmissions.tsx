import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  Heading,
  Flex,
  Table,
  Text,
  Button,
  Badge,
  TextField,
  Grid,
  Select,
} from "@radix-ui/themes";
import { assignmentService } from "../../../services/assignmentService";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import { MagnifyingGlassIcon, FileTextIcon } from "@radix-ui/react-icons";

const AllSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [classFilter, setClassFilter] = useState<string>("all_classes");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch submissions for teacher
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: [
      "teacher-submissions",
      { status: statusFilter, class: classFilter },
    ],
    queryFn: () =>
      assignmentService.getAllSubmissions({
        status: statusFilter === "all_statuses" ? undefined : statusFilter,
        class: classFilter === "all_classes" ? undefined : classFilter,
      }),
  });

  // Fetch classes for filtering
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Handle search and filtering
  const filteredSubmissions = submissions?.filter((submission) => {
    const searchMatch =
      submission.student.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.student.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.assignment.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  // Paginate results
  const paginatedSubmissions = filteredSubmissions?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Calculate statistics
  const totalSubmissions = filteredSubmissions?.length || 0;
  const gradedSubmissions =
    filteredSubmissions?.filter((s) => s.status === "graded").length || 0;
  const pendingSubmissions =
    filteredSubmissions?.filter((s) => s.status === "submitted").length || 0;

  if (isLoadingSubmissions || isLoadingClasses) return <LoadingSpinner />;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="4">All Student Submissions</Heading>

        {/* Statistics cards */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="4">
          <Card variant="classic">
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold">
                {totalSubmissions}
              </Text>
              <Text size="2" color="gray">
                Total Submissions
              </Text>
            </Flex>
          </Card>
          <Card variant="classic">
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold" color="green">
                {gradedSubmissions}
              </Text>
              <Text size="2" color="gray">
                Graded
              </Text>
            </Flex>
          </Card>
          <Card variant="classic">
            <Flex direction="column" align="center" gap="1">
              <Text size="8" weight="bold" color="blue">
                {pendingSubmissions}
              </Text>
              <Text size="2" color="gray">
                Pending Review
              </Text>
            </Flex>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="4">
          <TextField.Root
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root value={classFilter} onValueChange={setClassFilter}>
            <Select.Trigger placeholder="Filter by class" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Class</Select.Label>
                <Select.Item value="all_classes">All Classes</Select.Item>
                {classes?.map((cls) => (
                  <Select.Item key={cls._id} value={cls._id}>
                    {cls.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Status</Select.Label>
                <Select.Item value="all_statuses">All Status</Select.Item>
                <Select.Item value="submitted">Submitted</Select.Item>
                <Select.Item value="graded">Graded</Select.Item>
                <Select.Item value="pending">Pending</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Grid>

        {/* Results table */}
        {filteredSubmissions?.length === 0 ? (
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
                No submissions found matching your criteria.
              </Text>
            </Flex>
          </Card>
        ) : (
          <>
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Submitted At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {paginatedSubmissions?.map((submission, index) => (
                  <Table.Row key={submission._id}>
                    <Table.Cell>
                      {(page - 1) * itemsPerPage + index + 1}
                    </Table.Cell>
                    <Table.Cell>
                      <Text weight="medium">{submission.assignment.title}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      {submission.student.firstName}{" "}
                      {submission.student.lastName}
                    </Table.Cell>
                    <Table.Cell>{submission.class.name}</Table.Cell>
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
                    <Table.Cell>
                      {formatDate(submission.submittedAt)}
                    </Table.Cell>
                    <Table.Cell>
                      {submission.status === "graded" ? (
                        <Text weight="bold">{submission.grade}</Text>
                      ) : (
                        <Text color="gray">Not graded</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Button asChild size="1" variant="soft">
                        <Link
                          to={`/teacher/assignments/submissions/${submission.assignment}/${submission._id}`}
                        >
                          View Details
                        </Link>
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>

            {/* Pagination */}
            <Flex justify="between" align="center" mt="4">
              <Text color="gray">
                Showing {Math.min(1, totalSubmissions)}-
                {Math.min(page * itemsPerPage, totalSubmissions)} of{" "}
                {totalSubmissions} submissions
              </Text>
              <Flex gap="2">
                <Button
                  variant="soft"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="soft"
                  disabled={page * itemsPerPage >= totalSubmissions}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default AllSubmissions;
