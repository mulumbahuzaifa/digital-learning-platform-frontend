import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Grid,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Avatar,
  Separator,
  Badge,
} from "@radix-ui/themes";
import { classService } from "../../../services/classService";
import { assignmentService } from "../../../services/assignmentService";
import { submissionService } from "../../../services/submissionService";
import { attendanceService } from "../../../services/attendanceService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  ReaderIcon,
  FileTextIcon,
  StarIcon,
  ClockIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { useAuthActions } from "../../../hooks/useAuthActions";
import { contentService } from "../../../services/contentService";
import { gradebookService } from "../../../services/gradebookService";
import {
  Assignment,
  Content,
  Submission,
  Attendance,
  Gradebook,
} from "../../../types";

const StudentDashboard = () => {
  const { currentUser } = useAuthActions();

  // Fetch student's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["student-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<
    Assignment[]
  >({
    queryKey: ["student-assignments"],
    queryFn: () => assignmentService.getStudentAssignments(),
  });

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<
    Submission[]
  >({
    queryKey: ["student-submissions"],
    queryFn: () => submissionService.getStudentSubmissions(),
  });

  // Fetch attendance
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery<
    Attendance[]
  >({
    queryKey: ["student-attendance"],
    queryFn: () => attendanceService.getMyAttendance(),
  });

  // Fetch recent content
  const { data: recentContent, isLoading: isLoadingRecentContent } = useQuery<
    Content[]
  >({
    queryKey: ["recent-content"],
    queryFn: () => contentService.getMyContent({}),
  });

  // Fetch gradebook summary
  const { data: gradebookSummary, isLoading: isLoadingGrades } = useQuery<
    Gradebook[]
  >({
    queryKey: ["gradebook-summary"],
    queryFn: () => gradebookService.getMyGradebooks(),
  });

  if (
    isLoadingClasses ||
    isLoadingAssignments ||
    isLoadingSubmissions ||
    isLoadingAttendance ||
    isLoadingRecentContent ||
    isLoadingGrades
  ) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const pendingAssignments =
    assignments?.filter(
      (ass) => !submissions?.some((sub) => sub.assignment._id === ass._id)
    ).length || 0;

  const attendanceRate = attendance
    ? Math.round(
        (attendance.filter((att) =>
          att.records.some((record) => record.status === "present")
        ).length /
          attendance.length) *
          100
      )
    : 0;

  const averageGrade = submissions?.length
    ? Math.round(
        submissions.reduce((acc, sub) => acc + (sub.marksAwarded || 0), 0) /
          submissions.length
      )
    : 0;

  // Get upcoming assignments
  const upcomingAssignments =
    assignments
      ?.filter((ass) => new Date(ass.dueDate) > new Date())
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5) || [];

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Welcome Section */}
        <Card size="3">
          <Flex gap="4" align="center" justify="between">
            <Flex gap="4" align="center">
              <Avatar
                size="5"
                src={currentUser.data?.profile?.avatar}
                fallback={currentUser.data?.firstName?.[0] || "U"}
              />
              <Box>
                <Heading size="5">
                  Welcome back, {currentUser.data?.firstName}!
                </Heading>
                <Text color="gray" size="2">
                  {classes?.[0]?.name || "No class assigned"}
                </Text>
              </Box>
            </Flex>
            <Button variant="soft" color="blue" asChild>
              <Link to="/student/calendar">View Calendar</Link>
            </Button>
          </Flex>
        </Card>

        {/* Stats Overview */}
        <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
          <Card size="2">
            <Flex direction="column" gap="2">
              <Flex gap="2" align="center">
                <FileTextIcon width={20} height={20} color="var(--blue-9)" />
                <Text size="2" weight="bold">
                  Pending Assignments
                </Text>
              </Flex>
              <Text size="6" weight="bold" color="blue">
                {pendingAssignments}
              </Text>
              <Text size="1" color="gray">
                {upcomingAssignments.length} upcoming deadlines
              </Text>
            </Flex>
          </Card>

          <Card size="2">
            <Flex direction="column" gap="2">
              <Flex gap="2" align="center">
                <StarIcon width={20} height={20} color="var(--green-9)" />
                <Text size="2" weight="bold">
                  Average Grade
                </Text>
              </Flex>
              <Text size="6" weight="bold" color="green">
                {averageGrade}%
              </Text>
              <Text size="1" color="gray">
                Based on {submissions?.length || 0} submissions
              </Text>
            </Flex>
          </Card>

          <Card size="2">
            <Flex direction="column" gap="2">
              <Flex gap="2" align="center">
                <CheckCircledIcon
                  width={20}
                  height={20}
                  color="var(--indigo-9)"
                />
                <Text size="2" weight="bold">
                  Attendance Rate
                </Text>
              </Flex>
              <Text size="6" weight="bold" color="indigo">
                {attendanceRate}%
              </Text>
              <Text size="1" color="gray">
                Last 30 days
              </Text>
            </Flex>
          </Card>

          <Card size="2">
            <Flex direction="column" gap="2">
              <Flex gap="2" align="center">
                <ReaderIcon width={20} height={20} color="var(--purple-9)" />
                <Text size="2" weight="bold">
                  Learning Progress
                </Text>
              </Flex>
              <Text size="6" weight="bold" color="purple">
                {recentContent?.length || 0}
              </Text>
              <Text size="1" color="gray">
                New content available
              </Text>
            </Flex>
          </Card>
        </Grid>

        {/* Main Content Grid */}
        <Grid columns={{ initial: "1", md: "2" }} gap="6">
          {/* Upcoming Assignments */}
          <Card size="3">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Heading size="4">Upcoming Assignments</Heading>
                <Button variant="soft" color="blue" asChild>
                  <Link to="/student/assignments">View All</Link>
                </Button>
              </Flex>
              <Separator size="4" />
              {upcomingAssignments.length > 0 ? (
                <Flex direction="column" gap="3">
                  {upcomingAssignments.map((assignment) => (
                    <Card key={assignment._id} size="2">
                      <Flex justify="between" align="center">
                        <Box>
                          <Text weight="bold">{assignment.title}</Text>
                          <Flex gap="2" align="center" mt="1">
                            <ClockIcon width={14} height={14} />
                            <Text size="1" color="gray">
                              Due: {formatDate(assignment.dueDate)}
                            </Text>
                          </Flex>
                        </Box>
                        <Button asChild size="2">
                          <Link to={`/student/assignments/${assignment._id}`}>
                            View
                          </Link>
                        </Button>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              ) : (
                <Text color="gray">No upcoming assignments</Text>
              )}
            </Flex>
          </Card>

          {/* Recent Learning Content */}
          <Card size="3">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Heading size="4">Recent Learning Content</Heading>
                <Button variant="soft" color="blue" asChild>
                  <Link to="/student/content">View All</Link>
                </Button>
              </Flex>
              <Separator size="4" />
              {recentContent && recentContent.length > 0 ? (
                <Flex direction="column" gap="3">
                  {recentContent.slice(0, 5).map((content) => (
                    <Card key={content._id} size="2">
                      <Flex justify="between" align="center">
                        <Box>
                          <Text weight="bold">{content.title}</Text>
                          <Flex gap="2" align="center" mt="1">
                            <Badge color="blue" variant="soft">
                              {content.type}
                            </Badge>
                            <Text size="1" color="gray">
                              {formatDate(content.createdAt)}
                            </Text>
                          </Flex>
                        </Box>
                        <Button asChild size="2">
                          <Link to={`/student/content/${content._id}`}>
                            View
                          </Link>
                        </Button>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              ) : (
                <Text color="gray">No recent content</Text>
              )}
            </Flex>
          </Card>
        </Grid>

        {/* Academic Performance */}
        {gradebookSummary && gradebookSummary[0] && (
          <Card size="3">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Heading size="4">Academic Performance</Heading>
                <Button variant="soft" color="blue" asChild>
                  <Link to="/student/grades">View Full Report</Link>
                </Button>
              </Flex>
              <Separator size="4" />
              <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
                {gradebookSummary[0].assignments?.map((assignment) => (
                  <Card
                    key={
                      typeof assignment.assignment === "string"
                        ? assignment.assignment
                        : assignment.assignment._id
                    }
                    size="2"
                  >
                    <Flex direction="column" gap="2">
                      <Text weight="bold" truncate>
                        {typeof assignment.assignment === "string"
                          ? assignment.assignment
                          : assignment.assignment.title}
                      </Text>
                      <Text size="5" weight="bold" color="blue">
                        {assignment.marks || "N/A"}
                      </Text>
                      <Text size="1" color="gray">
                        {assignment.weight || 0}% Weight
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Flex>
          </Card>
        )}
      </Flex>
    </Box>
  );
};

export default StudentDashboard;
