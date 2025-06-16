import { useState, ChangeEvent, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  Flex,
  Heading,
  Table,
  Text,
  Button,
  Badge,
  Select,
  TextField,
  Dialog,
  Tabs,
  Callout,
  Grid,
} from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { gradebookService } from "../../../services/gradebookService";
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  MagnifyingGlassIcon,
  Pencil2Icon,
  TrashIcon,
  EyeOpenIcon,
  PlusIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useGradebookMutation } from "../../../hooks/useGradebookMutation";
import { Gradebook } from "../../../types";

// Grading Scale Component
const GradingScale = () => {
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="3">Grading Scale</Heading>
        <Grid columns="2" gap="3">
          <Box>
            <Badge color="green" size="2">
              A (90-100)
            </Badge>
            <Text size="2">Excellent</Text>
          </Box>
          <Box>
            <Badge color="blue" size="2">
              B (80-89)
            </Badge>
            <Text size="2">Good</Text>
          </Box>
          <Box>
            <Badge color="yellow" size="2">
              C (70-79)
            </Badge>
            <Text size="2">Satisfactory</Text>
          </Box>
          <Box>
            <Badge color="orange" size="2">
              D (60-69)
            </Badge>
            <Text size="2">Needs Improvement</Text>
          </Box>
          <Box>
            <Badge color="red" size="2">
              F (Below 60)
            </Badge>
            <Text size="2">Failing</Text>
          </Box>
        </Grid>
        <Callout.Root color="blue">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Grades are automatically calculated based on total marks, but can be
            manually adjusted if needed.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </Card>
  );
};

// Badge that shows grade with appropriate color
const GradeBadge = ({ grade }: { grade?: string }) => {
  if (!grade) return <Text size="2">N/A</Text>;

  const getGradeColor = () => {
    switch (grade) {
      case "A":
        return "green";
      case "B":
        return "blue";
      case "C":
        return "yellow";
      case "D":
        return "orange";
      case "F":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Badge color={getGradeColor()} size="2">
      {grade}
    </Badge>
  );
};

const GradebookManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [gradebookToDelete, setGradebookToDelete] = useState<string | null>(
    null
  );
  const [showGradingScale, setShowGradingScale] = useState(false);
  const itemsPerPage = 10;

  const { deleteGradebook, publishGradebook } = useGradebookMutation();

  // Get available academic years
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

  // Handle tab changes for published filter
  const handleTabChange = (value: string) => {
    switch (value) {
      case "published":
        setPublishedFilter("published");
        break;
      case "draft":
        setPublishedFilter("draft");
        break;
      default:
        setPublishedFilter("all");
    }
  };

  // Fetch gradebooks
  const { data: gradebooks, isLoading: isLoadingGradebooks } = useQuery({
    queryKey: [
      "gradebooks",
      {
        class: classFilter,
        subject: subjectFilter,
        term: termFilter,
        isPublished: publishedFilter,
        academicYear: academicYearFilter,
      },
    ],
    queryFn: () =>
      gradebookService.getAllGradebooks({
        class: classFilter !== "all" ? classFilter : undefined,
        subject: subjectFilter !== "all" ? subjectFilter : undefined,
        term: termFilter !== "all" ? termFilter : undefined,
        isPublished:
          publishedFilter !== "all"
            ? publishedFilter === "published"
            : undefined,
        academicYear:
          academicYearFilter !== "all" ? academicYearFilter : undefined,
      }),
  });

  // Fetch classes for filter
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch subjects for filter
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectService.getAllSubjects();
      return response.data; // Extract the data array from the response
    },
  });

  if (isLoadingGradebooks || isLoadingClasses || isLoadingSubjects) {
    return <LoadingSpinner />;
  }

  // Filter gradebooks based on search and filters
  const filteredGradebooks =
    gradebooks?.filter((gradebook) => {
      // Search term filtering
      if (searchTerm) {
        const studentName =
          typeof gradebook.student === "string"
            ? gradebook.student
            : `${gradebook.student.firstName} ${gradebook.student.lastName}`;

        if (!studentName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Grade filtering
      if (gradeFilter !== "all" && gradebook.finalGrade !== gradeFilter) {
        return false;
      }

      return true;
    }) || [];

  // Paginate filtered gradebooks
  const paginatedGradebooks = filteredGradebooks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleDeleteGradebook = async () => {
    if (gradebookToDelete) {
      await deleteGradebook.mutateAsync(gradebookToDelete);
      setGradebookToDelete(null);
    }
  };

  const handlePublishGradebook = async (id: string) => {
    await publishGradebook.mutateAsync(id);
  };

  const getStudentName = (gradebook: any) => {
    return typeof gradebook.student === "string"
      ? gradebook.student
      : `${gradebook.student.firstName} ${gradebook.student.lastName}`;
  };

  const getClassName = (gradebook: any) => {
    return typeof gradebook.class === "string"
      ? classes?.find((c) => c._id === gradebook.class)?.name || gradebook.class
      : gradebook.class.name;
  };

  const getSubjectName = (gradebook: any) => {
    return typeof gradebook.subject === "string"
      ? subjects?.find((s) => s._id === gradebook.subject)?.name ||
          gradebook.subject
      : gradebook.subject.name;
  };

  function renderGradebooksTable(gradebooks: Gradebook[]) {
    if (gradebooks.length === 0) {
      return (
        <Card mt="4">
          <Flex
            direction="column"
            align="center"
            justify="center"
            p="6"
            gap="4"
          >
            <Text color="gray" size="3">
              No gradebook entries found
            </Text>
            <Button asChild>
              <Link to="/admin/gradebook/create">
                <PlusIcon /> Create New Gradebook Entry
              </Link>
            </Button>
          </Flex>
        </Card>
      );
    }

    return (
      <Table.Root mt="4">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Term</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Year</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Marks</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {gradebooks.map((gradebook) => (
            <Table.Row key={gradebook._id}>
              <Table.Cell>{getStudentName(gradebook)}</Table.Cell>
              <Table.Cell>{getClassName(gradebook)}</Table.Cell>
              <Table.Cell>{getSubjectName(gradebook)}</Table.Cell>
              <Table.Cell>{gradebook.term}</Table.Cell>
              <Table.Cell>{gradebook.academicYear}</Table.Cell>
              <Table.Cell>
                <Badge color={gradebook.isPublished ? "green" : "blue"}>
                  {gradebook.isPublished ? "Published" : "Draft"}
                </Badge>
              </Table.Cell>
              <Table.Cell>{gradebook.totalMarks || "N/A"}</Table.Cell>
              <Table.Cell>
                <GradeBadge grade={gradebook.finalGrade} />
              </Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <Button asChild size="1" variant="soft">
                    <Link to={`/admin/gradebook/${gradebook._id}`}>
                      <EyeOpenIcon />
                    </Link>
                  </Button>
                  <Button asChild size="1" variant="soft">
                    <Link to={`/admin/gradebook/${gradebook._id}/edit`}>
                      <Pencil2Icon />
                    </Link>
                  </Button>
                  {!gradebook.isPublished && (
                    <Button
                      size="1"
                      variant="soft"
                      color="green"
                      onClick={() => handlePublishGradebook(gradebook._id)}
                      disabled={publishGradebook.isPending}
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    size="1"
                    variant="soft"
                    color="red"
                    onClick={() => setGradebookToDelete(gradebook._id)}
                  >
                    <TrashIcon />
                  </Button>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    );
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Gradebook Management</Heading>
          <Flex gap="2">
            <Button
              onClick={() => setShowGradingScale(!showGradingScale)}
              variant="soft"
            >
              {showGradingScale ? "Hide" : "Show"} Grading Scale
            </Button>
            <Button asChild>
              <Link to="/admin/gradebook/create">
                Create New Gradebook Entry
              </Link>
            </Button>
          </Flex>
        </Flex>

        {showGradingScale && <GradingScale />}

        <Tabs.Root defaultValue="all" onValueChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Trigger value="all">All Gradebooks</Tabs.Trigger>
            <Tabs.Trigger value="published">Published</Tabs.Trigger>
            <Tabs.Trigger value="draft">Drafts</Tabs.Trigger>
          </Tabs.List>

          <Box mt="4">
            <Flex justify="between" align="center" wrap="wrap" gap="3">
              <Box style={{ minWidth: "250px", flexGrow: 1 }}>
                <TextField.Root
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                >
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Flex gap="3" wrap="wrap">
                <Select.Root value={classFilter} onValueChange={setClassFilter}>
                  <Select.Trigger placeholder="Filter by class" />
                  <Select.Content>
                    <Select.Item value="all">All Classes</Select.Item>
                    {classes?.map((c) => (
                      <Select.Item key={c._id} value={c._id}>
                        {c.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Select.Root
                  value={subjectFilter}
                  onValueChange={setSubjectFilter}
                >
                  <Select.Trigger placeholder="Filter by subject" />
                  <Select.Content>
                    <Select.Item value="all">All Subjects</Select.Item>
                    {subjects?.map((s) => (
                      <Select.Item key={s._id} value={s._id}>
                        {s.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Select.Root value={termFilter} onValueChange={setTermFilter}>
                  <Select.Trigger placeholder="Filter by term" />
                  <Select.Content>
                    <Select.Item value="all">All Terms</Select.Item>
                    <Select.Item value="Term 1">Term 1</Select.Item>
                    <Select.Item value="Term 2">Term 2</Select.Item>
                    <Select.Item value="Term 3">Term 3</Select.Item>
                  </Select.Content>
                </Select.Root>

                <Select.Root
                  value={academicYearFilter}
                  onValueChange={setAcademicYearFilter}
                >
                  <Select.Trigger placeholder="Filter by year" />
                  <Select.Content>
                    <Select.Item value="all">All Years</Select.Item>
                    {academicYears.map((year) => (
                      <Select.Item key={year} value={year}>
                        {year}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Select.Root value={gradeFilter} onValueChange={setGradeFilter}>
                  <Select.Trigger placeholder="Filter by grade" />
                  <Select.Content>
                    <Select.Item value="all">All Grades</Select.Item>
                    <Select.Item value="A">A (90-100)</Select.Item>
                    <Select.Item value="B">B (80-89)</Select.Item>
                    <Select.Item value="C">C (70-79)</Select.Item>
                    <Select.Item value="D">D (60-69)</Select.Item>
                    <Select.Item value="F">F (Below 60)</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>

            <Tabs.Content value="all">
              {renderGradebooksTable(paginatedGradebooks)}
            </Tabs.Content>

            <Tabs.Content value="published">
              {renderGradebooksTable(
                paginatedGradebooks.filter((g) => g.isPublished)
              )}
            </Tabs.Content>

            <Tabs.Content value="draft">
              {renderGradebooksTable(
                paginatedGradebooks.filter((g) => !g.isPublished)
              )}
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        {filteredGradebooks.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, filteredGradebooks.length)} of{" "}
              {filteredGradebooks.length} entries
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
                disabled={page * itemsPerPage >= filteredGradebooks.length}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!gradebookToDelete}
        onOpenChange={() => setGradebookToDelete(null)}
      >
        <Dialog.Content>
          <Dialog.Title>Delete Gradebook Entry</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete this gradebook entry? This action
            cannot be undone.
          </Dialog.Description>
          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button
                color="red"
                variant="soft"
                onClick={handleDeleteGradebook}
              >
                Delete
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default GradebookManagement;
