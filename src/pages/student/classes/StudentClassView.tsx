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
  Table,
  Tabs,
} from "@radix-ui/themes";
import { useParams, Link } from "react-router-dom";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { ArrowLeftIcon, FileTextIcon } from "@radix-ui/react-icons";
import { StudentClass } from "../../../types/class";
import { formatDate } from "../../../utils/formatters";

const StudentClassView = () => {
  const { id } = useParams();

  // Fetch class details
  const { data: classData, isLoading: isLoadingClass } = useQuery<StudentClass>(
    {
      queryKey: ["class", id],
      queryFn: () => classService.getClassById(id!),
    }
  );

  if (isLoadingClass) {
    return <LoadingSpinner />;
  }

  if (!classData) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex direction="column" gap="4" align="center">
            <Heading size="5">Class Not Found</Heading>
            <Text color="gray">The requested class could not be found.</Text>
            <Button variant="soft" color="blue" asChild>
              <Link to="/student/classes">Back to Classes</Link>
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
                <Heading size="5">{classData.name}</Heading>
                <Text color="gray" size="2">
                  {classData.code} • {classData.level} • {classData.stream}
                </Text>
                <Text size="1" color="gray" mt="1">
                  Academic Year: {classData.academicYear} • Term:{" "}
                  {classData.term}
                </Text>
              </Box>
              <Button variant="soft" color="blue" asChild>
                <Link to="/student/classes">
                  <ArrowLeftIcon width="16" height="16" />
                  <Text>Back to Classes</Text>
                </Link>
              </Button>
            </Flex>
            <Separator size="4" />
            <Text>{classData.description}</Text>
          </Flex>
        </Card>

        {/* Main Content */}
        <Tabs.Root defaultValue="subjects">
          <Tabs.List>
            <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
            <Tabs.Trigger value="schedule">Schedule</Tabs.Trigger>
            <Tabs.Trigger value="classmates">Classmates</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="subjects">
              <Card size="3">
                <Flex direction="column" gap="4">
                  <Heading size="4">Subjects</Heading>
                  <Separator size="4" />
                  <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                    {classData.subjects.map((subject) => (
                      <Card key={subject._id} size="2">
                        <Flex direction="column" gap="3">
                          <Flex gap="2" align="center">
                            <FileTextIcon
                              width={20}
                              height={20}
                              color="var(--blue-9)"
                            />
                            <Text weight="bold">{subject.name}</Text>
                          </Flex>
                          <Text size="1" color="gray">
                            {subject.code}
                          </Text>
                          <Badge
                            color={
                              subject.status === "active" ? "green" : "red"
                            }
                          >
                            {subject.status}
                          </Badge>
                        </Flex>
                      </Card>
                    ))}
                  </Grid>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="schedule">
              <Card size="3">
                <Flex direction="column" gap="4">
                  <Heading size="4">Class Schedule</Heading>
                  <Separator size="4" />
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Day</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Venue</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {classData.subjects.map(
                        (subject) =>
                          subject.schedule && (
                            <Table.Row key={subject._id}>
                              <Table.Cell>{subject.schedule.day}</Table.Cell>
                              <Table.Cell>{subject.name}</Table.Cell>
                              <Table.Cell>
                                {subject.schedule.startTime} -{" "}
                                {subject.schedule.endTime}
                              </Table.Cell>
                              <Table.Cell>{subject.schedule.venue}</Table.Cell>
                            </Table.Row>
                          )
                      )}
                    </Table.Body>
                  </Table.Root>
                </Flex>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="classmates">
              <Card size="3">
                <Flex direction="column" gap="4">
                  <Heading size="4">Classmates</Heading>
                  <Separator size="4" />
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Enrollment Date
                        </Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {classData.currentEnrollments?.map((enrollment) => (
                        <Table.Row key={enrollment.student._id}>
                          <Table.Cell>
                            {enrollment.student.firstName}{" "}
                            {enrollment.student.lastName}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color="blue">Active</Badge>
                          </Table.Cell>
                          <Table.Cell>
                            {formatDate(enrollment.enrollmentDate)}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Flex>
              </Card>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Box>
  );
};

export default StudentClassView;
