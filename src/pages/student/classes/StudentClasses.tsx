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
} from "@radix-ui/themes";
import { classService } from "../../../services/classService";
import { contentService } from "../../../services/contentService";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { StudentClass } from "../../../types/class";
import { Content, Assignment } from "../../../types";

const StudentClasses = () => {
  // Fetch student's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<
    StudentClass[]
  >({
    queryKey: ["student-classes"],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      return response as StudentClass[];
    },
  });

  // Fetch class content
  const { data: content, isLoading: isLoadingContent } = useQuery<Content[]>({
    queryKey: ["class-content"],
    queryFn: async () => {
      const response = await contentService.getMyContent({
        class: classes?.[0]?._id,
      });
      return response as Content[];
    },
    enabled: !!classes?.[0]?._id,
  });

  // Fetch class assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<
    Assignment[]
  >({
    queryKey: ["class-assignments"],
    queryFn: async () => {
      const response = await assignmentService.getStudentAssignments();
      return response as Assignment[];
    },
  });

  if (isLoadingClasses || isLoadingContent || isLoadingAssignments) {
    return <LoadingSpinner />;
  }

  const studentClass = classes?.[0];

  if (!studentClass) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            p="6"
          >
            <Heading size="5" align="center">
              No Class Assigned
            </Heading>
            <Text color="gray" align="center">
              You haven't been assigned to any class yet. Please contact your
              administrator.
            </Text>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        {/* Class Header */}
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">
                  {studentClass.name || "Unnamed Class"}
                </Heading>
                <Text color="gray" size="2">
                  {studentClass.code || "No Code"} •{" "}
                  {studentClass.level || "No Level"} • Stream:{" "}
                  {studentClass.stream || "No Stream"} •{" "}
                </Text>
                {studentClass.enrollmentInfo && (
                  <Text size="1" color="gray" mt="1">
                    Academic Year:{" "}
                    {studentClass.enrollmentInfo.academicYear || "N/A"} • Term:{" "}
                    {studentClass.enrollmentInfo.term || "N/A"}
                  </Text>
                )}
              </Box>
              <Button variant="soft" color="blue" asChild>
                <Link to="/student/calendar">View Schedule</Link>
              </Button>
            </Flex>
            <Separator size="4" />
          </Flex>
        </Card>

        {/* Main Content */}
        <Tabs.Root defaultValue="subjects">
          <Tabs.List>
            <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
            <Tabs.Trigger value="content">Learning Content</Tabs.Trigger>
            <Tabs.Trigger value="assignments">Assignments</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="subjects">
              <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                {studentClass.subjects &&
                  studentClass.subjects.map((subject) => (
                    <Card key={subject._id} size="2">
                      <Flex direction="column" gap="3">
                        <Box>
                          <Text weight="bold">
                            {subject.name || "Unnamed Subject"}
                          </Text>
                          <Text size="1" color="gray">
                            {subject.code || "No Code"}
                          </Text>
                          <Badge
                            color={subject.isActive ? "green" : "red"}
                            variant="soft"
                            mt="1"
                          >
                            {subject.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Box>
                        <Separator size="2" />
                        {subject.teachers && subject.teachers.length > 0 && (
                          <Box>
                            <Text size="1" color="gray">
                              Teachers:
                            </Text>
                            {subject.teachers.map((teacher, idx) => (
                              <Text size="1" key={teacher.teacher._id || idx}>
                                {teacher.teacher.firstName}{" "}
                                {teacher.teacher.lastName}
                                {teacher.isLeadTeacher ? " (Lead)" : ""}
                              </Text>
                            ))}
                          </Box>
                        )}
                        {studentClass.enrollmentInfo && (
                          <Text size="1" color="gray">
                            Enrolled on:{" "}
                            {formatDate(
                              studentClass.enrollmentInfo.enrollmentDate || ""
                            )}
                          </Text>
                        )}
                      </Flex>
                    </Card>
                  ))}
              </Grid>
            </Tabs.Content>

            <Tabs.Content value="content">
              <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                {content?.length ? (
                  content.map((item: Content) => (
                    <Card key={item._id} size="2">
                      <Flex direction="column" gap="3">
                        <Box>
                          <Text weight="bold">
                            {item.title || "Untitled Content"}
                          </Text>
                          <Flex gap="2" align="center" mt="1">
                            <Badge color="blue" variant="soft">
                              {item.type || "Unknown"}
                            </Badge>
                            <Text size="1" color="gray">
                              {formatDate(item.createdAt?.toString() || "")}
                            </Text>
                          </Flex>
                        </Box>
                        <Text size="1" color="gray" truncate>
                          {item.description || "No description"}
                        </Text>
                        <Button asChild size="2">
                          <Link to={`/student/content/${item._id}`}>
                            View Content
                          </Link>
                        </Button>
                      </Flex>
                    </Card>
                  ))
                ) : (
                  <Card size="2" style={{ gridColumn: "1 / -1" }}>
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      gap="2"
                      p="4"
                    >
                      <Text color="gray">
                        No content available for this class yet
                      </Text>
                    </Flex>
                  </Card>
                )}
              </Grid>
            </Tabs.Content>

            <Tabs.Content value="assignments">
              <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                {assignments?.length ? (
                  assignments.map((assignment: Assignment) => (
                    <Card key={assignment._id} size="2">
                      <Flex direction="column" gap="3">
                        <Box>
                          <Text weight="bold">
                            {assignment.title || "Untitled Assignment"}
                          </Text>
                          <Flex gap="2" align="center" mt="1">
                            <CalendarIcon width={16} height={16} />
                            <Text size="1" color="gray">
                              Due: {formatDate(assignment.dueDate || "")}
                            </Text>
                          </Flex>
                        </Box>
                        <Text size="1" color="gray" truncate>
                          {assignment.description || "No description"}
                        </Text>
                        <Flex gap="2">
                          <Button asChild size="2" variant="soft">
                            <Link to={`/student/assignments/${assignment._id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button asChild size="2">
                            <Link
                              to={`/student/assignments/${assignment._id}/submit`}
                            >
                              Submit
                            </Link>
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))
                ) : (
                  <Card size="2" style={{ gridColumn: "1 / -1" }}>
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      gap="2"
                      p="4"
                    >
                      <Text color="gray">
                        No assignments available for this class yet
                      </Text>
                    </Flex>
                  </Card>
                )}
              </Grid>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Box>
  );
};

export default StudentClasses;
