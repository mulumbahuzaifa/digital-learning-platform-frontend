import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  Table,
  Button,
  Box,
  Grid,
  Tabs,
} from "@radix-ui/themes";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  BookmarkIcon,
  PersonIcon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { StudentClass } from "../../../types/class";

const ClassView = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: classData,
    isLoading,
    error,
  } = useQuery<StudentClass>({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading class</div>;
  if (!classData) return <div>Class not found</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <BookmarkIcon width="24" height="24" />
            <Heading size="5">{classData.name}</Heading>
          </Flex>
          <Flex gap="2">
            <Button asChild>
              <Link to={`/admin/classes/${id}/edit`}>
                <Pencil2Icon /> Edit Class
              </Link>
            </Button>
          </Flex>
        </Flex>

        <Grid columns="2" gap="4">
          <Card variant="classic">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Class Code
              </Text>
              <Text size="4" weight="bold" style={{ fontFamily: "monospace" }}>
                {classData.code}
              </Text>
              <Text size="1" color="gray">
                Auto-generated unique identifier
              </Text>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Level
              </Text>
              <Text size="4" weight="bold">
                {classData.level}
              </Text>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Stream
              </Text>
              <Text size="4" weight="bold">
                {classData.stream}
              </Text>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Total Students
              </Text>
              <Text size="4" weight="bold">
                {classData.students?.length || 0}
              </Text>
            </Flex>
          </Card>
        </Grid>

        {classData.description && (
          <Card variant="classic">
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Description
              </Text>
              <Text>{classData.description}</Text>
            </Flex>
          </Card>
        )}

        <Tabs.Root defaultValue="subjects">
          <Tabs.List>
            <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
            <Tabs.Trigger value="students">Students</Tabs.Trigger>
            <Tabs.Trigger value="teachers">Teachers</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="subjects">
              <Flex justify="end" mb="3">
                <Button asChild>
                  <Link to={`/admin/classes/${id}/add-subject`}>
                    <PlusIcon /> Add Subject
                  </Link>
                </Button>
              </Flex>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Schedule</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {console.log(classData)}
                  {classData.subjects.map((subject) => (
                    <Table.Row key={subject._id}>
                      <Table.Cell>{subject.subject.name}</Table.Cell>
                      <Table.Cell>{subject.subject.code}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            subject.subject.isActive === "true"
                              ? "green"
                              : "orange"
                          }
                          variant="soft"
                        >
                          {subject.isActive}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {subject.schedule ? (
                          <Text>
                            {subject.schedule.day} {subject.schedule.startTime}{" "}
                            - {subject.schedule.endTime}
                            <br />
                            {subject.schedule.venue}
                          </Text>
                        ) : (
                          <Text color="gray">No schedule set</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <Button asChild size="1" variant="soft">
                            <Link
                              to={`/admin/classes/${id}/subjects/${subject._id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>
                          <Button size="1" variant="soft" color="red">
                            Remove
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>

            <Tabs.Content value="students">
              <Flex justify="end" mb="3">
                <Button asChild>
                  <Link to={`/admin/classes/${id}/add-student`}>
                    <PlusIcon /> Add Student
                  </Link>
                </Button>
              </Flex>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      Enrollment Date
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {classData.students?.map((enrollment) => (
                    <Table.Row key={enrollment.student._id}>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <PersonIcon />
                          <Text>
                            {enrollment.student.firstName}{" "}
                            {enrollment.student.lastName}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>{enrollment.enrollmentDate}</Table.Cell>
                      <Table.Cell>
                        <Button size="1" variant="soft" color="red">
                          Remove
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>

            <Tabs.Content value="teachers">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Teacher</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {classData.classTeacher && (
                    <Table.Row>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <PersonIcon />
                          <Text>
                            {classData.classTeacher.firstName}{" "}
                            {classData.classTeacher.lastName}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft">Class Teacher</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Button size="1" variant="soft" color="red">
                          Remove
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Card>
  );
};

export default ClassView;
