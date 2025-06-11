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
import { Link } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  StarIcon,
  BarChartIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { Submission } from "../../../types";
import { formatDate } from "../../../utils/formatters";

const StudentGrades = () => {
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

  // Calculate overall performance metrics
  const calculateOverallGrade = () => {
    if (!submissions?.length) return 0;
    const totalGrade = submissions.reduce(
      (acc, sub) => acc + (sub.marksAwarded || 0),
      0
    );
    return Math.round(totalGrade / submissions.length);
  };

  const calculatePassingRate = () => {
    if (!submissions?.length) return 0;
    const passingSubmissions = submissions.filter(
      (sub) => (sub.marksAwarded || 0) >= 50
    );
    return Math.round((passingSubmissions.length / submissions.length) * 100);
  };

  const calculateAverageGrade = () => {
    if (!submissions?.length) return 0;
    const totalGrade = submissions.reduce(
      (acc, sub) => acc + (sub.marksAwarded || 0),
      0
    );
    return Math.round(totalGrade / submissions.length);
  };

  const overallGrade = calculateOverallGrade();
  const passingRate = calculatePassingRate();
  const averageGrade = calculateAverageGrade();

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">My Grades</Heading>
                <Text color="gray" size="2">
                  Track your academic performance
                </Text>
              </Box>
              <Button variant="soft" color="blue" asChild>
                <Link to="/student/grades/report">
                  <FileTextIcon width="16" height="16" />
                  <Text>View Detailed Report</Text>
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
                      Overall Grade
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="blue">
                    {overallGrade}%
                  </Text>
                  <Progress
                    value={overallGrade}
                    color={
                      overallGrade >= 70
                        ? "green"
                        : overallGrade >= 50
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
                      Passing Rate
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="green">
                    {passingRate}%
                  </Text>
                  <Progress value={passingRate} color="green" />
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
                      Average Grade
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="purple">
                    {averageGrade}%
                  </Text>
                  <Progress
                    value={averageGrade}
                    color={
                      averageGrade >= 70
                        ? "green"
                        : averageGrade >= 50
                        ? "orange"
                        : "red"
                    }
                  />
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
                      Failed Assignments
                    </Text>
                  </Flex>
                  <Text size="6" weight="bold" color="red">
                    {submissions?.filter((sub) => (sub.marksAwarded || 0) < 50)
                      .length || 0}
                  </Text>
                  <Text size="1" color="gray">
                    Out of {submissions?.length || 0} total
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Recent Submissions */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="4">Recent Submissions</Heading>
            <Separator size="4" />
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Submitted</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {submissions?.slice(0, 5).map((submission) => (
                  <Table.Row key={submission._id}>
                    <Table.Cell>
                      <Link to={`/student/grades/${submission._id}`}>
                        {submission.assignment.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{submission.assignment.subjectName}</Table.Cell>
                    <Table.Cell>
                      {formatDate(submission.assignment.dueDate)}
                    </Table.Cell>
                    <Table.Cell>{formatDate(submission.submitDate)}</Table.Cell>
                    <Table.Cell>{submission.marksAwarded || "N/A"}</Table.Cell>
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
                ))}
              </Table.Body>
            </Table.Root>
            {submissions && submissions.length > 5 && (
              <Flex justify="center">
                <Button variant="soft" color="blue" asChild>
                  <Link to="/student/grades/report">View All Submissions</Link>
                </Button>
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentGrades;
