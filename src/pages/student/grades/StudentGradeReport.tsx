import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Grid,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Tabs,
  Badge,
  Separator,
  Progress,
  Table,
} from "@radix-ui/themes";
import { gradebookService } from "../../../services/gradebookService";
import { submissionService } from "../../../services/submissionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  StarIcon,
  BarChartIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { Gradebook, Submission } from "../../../types";
import { formatDate } from "../../../utils/formatters";

const StudentGradeReport = () => {
  // Fetch gradebook data
  const { data: gradebook, isLoading: isLoadingGradebook } = useQuery<
    Gradebook[]
  >({
    queryKey: ["student-gradebook"],
    queryFn: () => gradebookService.getAllGradebooks(),
  });

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<
    Submission[]
  >({
    queryKey: ["student-submissions"],
    queryFn: () => submissionService.getStudentSubmissions(),
  });

  if (isLoadingGradebook || isLoadingSubmissions) {
    return <LoadingSpinner />;
  }

  const studentGradebook = gradebook?.[0];

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

  const handleDownloadReport = () => {
    // TODO: Implement report download functionality
    console.log("Downloading report...");
  };

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">Grade Report</Heading>
                <Text color="gray" size="2">
                  Detailed academic performance report
                </Text>
              </Box>
              <Flex gap="2">
                <Button
                  variant="soft"
                  color="blue"
                  onClick={handleDownloadReport}
                >
                  <DownloadIcon width="16" height="16" />
                  <Text>Download Report</Text>
                </Button>
                <Button variant="soft" color="blue" asChild>
                  <Link to="/student/grades">Back to Grades</Link>
                </Button>
              </Flex>
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

        {/* Detailed Grade Report */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="4">Detailed Grade Report</Heading>
            <Separator size="4" />
            <Tabs.Root defaultValue="assignments">
              <Tabs.List>
                <Tabs.Trigger value="assignments">Assignments</Tabs.Trigger>
                <Tabs.Trigger value="tests">Tests</Tabs.Trigger>
                <Tabs.Trigger value="exams">Exams</Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="assignments">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>
                          Assignment
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Due Date
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Submitted
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {submissions?.map((submission) => (
                        <Table.Row key={submission._id}>
                          <Table.Cell>
                            <Link
                              to={`/student/assignments/${submission.assignment._id}`}
                            >
                              {submission.assignment.title}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            {submission.assignment.subjectName}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDate(submission.assignment.dueDate)}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDate(submission.submitDate)}
                          </Table.Cell>
                          <Table.Cell>
                            {submission.marksAwarded || "N/A"}
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
                </Tabs.Content>

                <Tabs.Content value="tests">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Test</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {studentGradebook?.tests?.map((test) => (
                        <Table.Row key={test.name}>
                          <Table.Cell>{test.name}</Table.Cell>
                          <Table.Cell>
                            {typeof studentGradebook.subject === "string"
                              ? studentGradebook.subject
                              : studentGradebook.subject.name}
                          </Table.Cell>
                          <Table.Cell>{formatDate(test.date)}</Table.Cell>
                          <Table.Cell>{test.marks}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                test.marks >= 70
                                  ? "green"
                                  : test.marks >= 50
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {test.marks}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>

                <Tabs.Content value="exams">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Exam</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {studentGradebook?.exams?.map((exam) => (
                        <Table.Row key={exam.name}>
                          <Table.Cell>{exam.name}</Table.Cell>
                          <Table.Cell>
                            {typeof studentGradebook.subject === "string"
                              ? studentGradebook.subject
                              : studentGradebook.subject.name}
                          </Table.Cell>
                          <Table.Cell>{formatDate(exam.date)}</Table.Cell>
                          <Table.Cell>{exam.marks}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                exam.marks >= 70
                                  ? "green"
                                  : exam.marks >= 50
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {exam.marks}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Card>

        {/* Performance Analysis */}
        {studentGradebook && (
          <Card size="3">
            <Flex direction="column" gap="4">
              <Heading size="4">Performance Analysis</Heading>
              <Separator size="4" />
              <Grid columns={{ initial: "1", md: "2" }} gap="4">
                <Card size="2">
                  <Flex direction="column" gap="3">
                    <Heading size="3">Subject Performance</Heading>
                    <Text>
                      {typeof studentGradebook.subject === "string"
                        ? studentGradebook.subject
                        : studentGradebook.subject.name}
                    </Text>
                    <Text size="5" weight="bold" color="blue">
                      {studentGradebook.finalGrade || "N/A"}
                    </Text>
                    <Text size="1" color="gray">
                      Position in Class:{" "}
                      {studentGradebook.positionInClass || "N/A"}
                    </Text>
                  </Flex>
                </Card>

                <Card size="2">
                  <Flex direction="column" gap="3">
                    <Heading size="3">Teacher's Remarks</Heading>
                    <Text>
                      {studentGradebook.remarks || "No remarks available"}
                    </Text>
                    <Text size="1" color="gray">
                      Published:{" "}
                      {formatDate(studentGradebook.publishedAt || "")}
                    </Text>
                  </Flex>
                </Card>
              </Grid>
            </Flex>
          </Card>
        )}
      </Flex>
    </Box>
  );
};

export default StudentGradeReport;
