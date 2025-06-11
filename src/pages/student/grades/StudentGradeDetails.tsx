import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Grid,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Badge,
  Separator,
  Progress,
  Table,
} from "@radix-ui/themes";
import { useParams, Link } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  StarIcon,
  BarChartIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { Submission } from "../../../types";
import { formatDate } from "../../../utils/formatters";

const StudentGradeDetails = () => {
  const { id } = useParams();

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<
    Submission[]
  >({
    queryKey: ["student-submissions"],
    queryFn: () => submissionService.getStudentSubmissions(),
  });

  if (isLoadingSubmissions) {
    return <LoadingSpinner />;
  }

  const submission = submissions?.find((sub) => sub._id === id);

  if (!submission) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex direction="column" gap="4" align="center">
            <Heading size="5">Submission Not Found</Heading>
            <Text color="gray">
              The requested submission could not be found.
            </Text>
            <Button variant="soft" color="blue" asChild>
              <Link to="/student/grades">Back to Grades</Link>
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">Grade Details</Heading>
                <Text color="gray" size="2">
                  Detailed information about your submission
                </Text>
              </Box>
              <Button variant="soft" color="blue" asChild>
                <Link to="/student/grades">
                  <ArrowLeftIcon width="16" height="16" />
                  <Text>Back to Grades</Text>
                </Link>
              </Button>
            </Flex>
            <Separator size="4" />
            <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <StarIcon width={20} height={20} color="var(--blue-9)" />
                    <Text size="2" weight="bold">
                      Assignment Grade
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="blue">
                    {submission.marksAwarded || "N/A"}%
                  </Text>
                  <Progress
                    value={submission.marksAwarded || 0}
                    color={
                      (submission.marksAwarded || 0) >= 70
                        ? "green"
                        : (submission.marksAwarded || 0) >= 50
                        ? "orange"
                        : "red"
                    }
                  />
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <CheckCircledIcon
                      width={20}
                      height={20}
                      color="var(--green-9)"
                    />
                    <Text size="2" weight="bold">
                      Status
                    </Text>
                  </Flex>
                  <Badge
                    size="3"
                    color={
                      submission.status === "graded"
                        ? "green"
                        : submission.status === "submitted"
                        ? "blue"
                        : "red"
                    }
                  >
                    {submission.status}
                  </Badge>
                  <Text size="1" color="gray">
                    Submitted: {formatDate(submission.submitDate)}
                  </Text>
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <BarChartIcon
                      width={20}
                      height={20}
                      color="var(--purple-9)"
                    />
                    <Text size="2" weight="bold">
                      Assignment Details
                    </Text>
                  </Flex>
                  <Text size="2">{submission.assignment.title}</Text>
                  <Text size="1" color="gray">
                    Due: {formatDate(submission.assignment.dueDate)}
                  </Text>
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <CrossCircledIcon
                      width={20}
                      height={20}
                      color="var(--red-9)"
                    />
                    <Text size="2" weight="bold">
                      Subject
                    </Text>
                  </Flex>
                  <Text size="2">{submission.assignment.subjectName}</Text>
                  <Text size="1" color="gray">
                    Total Marks: {submission.assignment.totalMarks}
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Submission Details */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="4">Submission Details</Heading>
            <Separator size="4" />
            <Grid columns={{ initial: "1", md: "2" }} gap="4">
              <Card size="2">
                <Flex direction="column" gap="3">
                  <Heading size="3">Submission Information</Heading>
                  <Table.Root>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Submission Date</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(submission.submitDate)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Due Date</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(submission.assignment.dueDate)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Status</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              submission.status === "graded"
                                ? "green"
                                : submission.status === "submitted"
                                ? "blue"
                                : "red"
                            }
                          >
                            {submission.status}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Marks Awarded</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={
                              (submission.marksAwarded || 0) >= 70
                                ? "green"
                                : (submission.marksAwarded || 0) >= 50
                                ? "orange"
                                : "red"
                            }
                          >
                            {submission.marksAwarded || "N/A"}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Flex>
              </Card>

              <Card size="2">
                <Flex direction="column" gap="3">
                  <Heading size="3">Assignment Information</Heading>
                  <Table.Root>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Title</Text>
                        </Table.Cell>
                        <Table.Cell>{submission.assignment.title}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Subject</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {submission.assignment.subjectName}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Total Marks</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {submission.assignment.totalMarks}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Text weight="bold">Description</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {submission.assignment.description}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Feedback */}
        {submission.feedback && (
          <Card size="3">
            <Flex direction="column" gap="4">
              <Heading size="4">Teacher's Feedback</Heading>
              <Separator size="4" />
              <Text>{submission.feedback}</Text>
              <Text size="1" color="gray">
                Graded on: {formatDate(submission.gradedAt || "")}
              </Text>
            </Flex>
          </Card>
        )}
      </Flex>
    </Box>
  );
};

export default StudentGradeDetails;
