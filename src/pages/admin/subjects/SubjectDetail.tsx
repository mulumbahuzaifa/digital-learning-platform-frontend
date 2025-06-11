import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  Box,
  Grid,
  Separator,
  Container,
} from "@radix-ui/themes";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  Pencil2Icon,
  DashboardIcon,
  PersonIcon,
  BookmarkIcon,
  ClockIcon,
  CodeIcon,
} from "@radix-ui/react-icons";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Class {
  _id: string;
  name: string;
}

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: subjectResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubjectById(id!),
    enabled: !!id,
  });

  // Get classes that use this subject
  const { data: classesResponse, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["subject-classes", id],
    queryFn: () => subjectService.getSubjectClasses(id!),
    enabled: !!id,
  });

  // Get teachers assigned to this subject
  const { data: teachersResponse, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["subject-teachers", id],
    queryFn: () => subjectService.getSubjectTeachers(id!),
    enabled: !!id,
  });

  if (isLoading || isLoadingClasses || isLoadingTeachers)
    return <LoadingSpinner />;
  if (error) return <div>Error loading subject</div>;
  if (!subjectResponse?.data) return <div>Subject not found</div>;

  const subject = subjectResponse.data;
  const classes = (classesResponse?.data || []) as unknown as Class[];
  const teachers = (teachersResponse?.data || []) as unknown as Teacher[];

  return (
    <Container size="3">
      <Card size="4" style={{ background: "var(--color-panel-solid)" }}>
        {/* Header Section */}
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Flex align="center" gap="3">
              <Box
                p="3"
                style={{
                  background: "var(--accent-3)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <DashboardIcon width="24" height="24" />
              </Box>
              <Flex direction="column" gap="1">
                <Heading size="5">{subject.name}</Heading>
                <Text size="2" color="gray">
                  Subject Details
                </Text>
              </Flex>
            </Flex>
            <Button asChild size="3" variant="soft">
              <Link to={`/admin/subjects/${id}/edit`}>
                <Pencil2Icon /> Edit Subject
              </Link>
            </Button>
          </Flex>

          <Separator size="4" />

          {/* Main Info Section */}
          <Grid columns="2" gap="4">
            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <CodeIcon width="16" height="16" />
                  <Text size="2" color="gray">
                    Subject Code
                  </Text>
                </Flex>
                <Text
                  size="4"
                  weight="bold"
                  style={{ fontFamily: "monospace" }}
                >
                  {subject.code}
                </Text>
              </Flex>
            </Card>

            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <DashboardIcon width="16" height="16" />
                  <Text size="2" color="gray">
                    Category
                  </Text>
                </Flex>
                <Badge
                  variant="solid"
                  color={subject.category === "compulsory" ? "red" : "green"}
                  size="2"
                  style={{ width: "fit-content" }}
                >
                  {subject.category || "Not categorized"}
                </Badge>
              </Flex>
            </Card>

            {subject.subCategory && (
              <Card
                variant="classic"
                style={{ background: "var(--color-panel-solid)" }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <DashboardIcon width="16" height="16" />
                    <Text size="2" color="gray">
                      Sub-category
                    </Text>
                  </Flex>
                  <Badge
                    variant="soft"
                    size="2"
                    style={{ width: "fit-content" }}
                  >
                    {subject.subCategory}
                  </Badge>
                </Flex>
              </Card>
            )}

            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <DashboardIcon width="16" height="16" />
                  <Text size="2" color="gray">
                    Status
                  </Text>
                </Flex>
                <Badge
                  variant="soft"
                  color={subject.isActive ? "green" : "red"}
                  size="2"
                  style={{ width: "fit-content" }}
                >
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </Flex>
            </Card>
          </Grid>

          {/* Description Section */}
          {subject.description && (
            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="2">
                <Text size="2" color="gray" weight="bold">
                  Description
                </Text>
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {subject.description}
                </Text>
              </Flex>
            </Card>
          )}

          <Separator size="4" />

          {/* Stats Section */}
          <Grid columns="2" gap="4">
            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Box
                    p="2"
                    style={{
                      background: "var(--accent-3)",
                      borderRadius: "var(--radius-2)",
                    }}
                  >
                    <PersonIcon width="16" height="16" />
                  </Box>
                  <Text size="2" color="gray" weight="bold">
                    Assigned Teachers
                  </Text>
                </Flex>
                <Text size="5" weight="bold">
                  {teachers.length}
                </Text>
                {teachers.length > 0 && (
                  <Flex gap="2" wrap="wrap">
                    {teachers.map((teacher: Teacher) => (
                      <Badge key={teacher._id} variant="soft" size="2">
                        {teacher.firstName} {teacher.lastName}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Card>

            <Card
              variant="classic"
              style={{ background: "var(--color-panel-solid)" }}
            >
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <Box
                    p="2"
                    style={{
                      background: "var(--accent-3)",
                      borderRadius: "var(--radius-2)",
                    }}
                  >
                    <BookmarkIcon width="16" height="16" />
                  </Box>
                  <Text size="2" color="gray" weight="bold">
                    Active Classes
                  </Text>
                </Flex>
                <Text size="5" weight="bold">
                  {classes.length}
                </Text>
                {classes.length > 0 && (
                  <Flex gap="2" wrap="wrap">
                    {classes.map((cls: Class) => (
                      <Badge key={cls._id} variant="soft" size="2">
                        {cls.name}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Card>
          </Grid>

          {/* Timestamps Section */}
          <Card
            variant="classic"
            style={{ background: "var(--color-panel-solid)" }}
          >
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <Box
                  p="2"
                  style={{
                    background: "var(--accent-3)",
                    borderRadius: "var(--radius-2)",
                  }}
                >
                  <ClockIcon width="16" height="16" />
                </Box>
                <Text size="2" color="gray" weight="bold">
                  Timestamps
                </Text>
              </Flex>
              <Grid columns="2" gap="4">
                <Box>
                  <Text size="2" color="gray">
                    Created At
                  </Text>
                  <Text size="2" weight="medium">
                    {new Date(subject.createdAt).toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" color="gray">
                    Last Updated
                  </Text>
                  <Text size="2" weight="medium">
                    {new Date(subject.updatedAt).toLocaleString()}
                  </Text>
                </Box>
              </Grid>
            </Flex>
          </Card>
        </Flex>
      </Card>
    </Container>
  );
};

export default SubjectDetail;
