import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Button,
  Table,
  Badge,
  Flex,
  Text,
  Card,
  Heading,
  AlertDialog,
  Box,
  TextField,
  Grid,
  Select,
} from "@radix-ui/themes";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  Pencil2Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  DashboardIcon,
  BookmarkIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useSubjectMutation } from "../../../hooks/useSubjectMutation";
import { SubjectFilterParams } from "../../../types";

// Radix UI colors
type RadixColor =
  | "tomato"
  | "red"
  | "ruby"
  | "crimson"
  | "pink"
  | "plum"
  | "purple"
  | "violet"
  | "iris"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "jade"
  | "green"
  | "grass"
  | "bronze"
  | "gold"
  | "brown"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "mint"
  | "gray";

// Define colors for subject subcategories
const subCategoryColors: Record<string, RadixColor> = {
  languages: "blue",
  sciences: "green",
  mathematics: "cyan",
  humanities: "amber",
  vocational: "orange",
  arts: "purple",
  technology: "indigo",
};

// Special value for "all" filter options
const ALL_CATEGORIES = "all_categories";
const ALL_SUBCATEGORIES = "all_subcategories";

const SubjectManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [subCategory, setSubCategory] = useState(ALL_SUBCATEGORIES);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Build filter params
  const filterParams: SubjectFilterParams = {
    page,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    category: category !== ALL_CATEGORIES ? category : undefined,
    subCategory: subCategory !== ALL_SUBCATEGORIES ? subCategory : undefined,
  };

  const {
    data: subjectsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subjects", filterParams],
    queryFn: () => subjectService.getAllSubjects(filterParams),
  });

  const { deleteSubject } = useSubjectMutation();

  const subjects = subjectsResponse?.data || [];
  const totalSubjects = subjectsResponse?.total || 0;
  const totalPages = subjectsResponse?.totalPages || 1;

  // Get unique subcategories for filtering
  const uniqueSubCategories = subjects
    ? Array.from(
        new Set(subjects.map((subject) => subject.subCategory).filter(Boolean))
      )
    : [];

  // Count subjects by category
  const compulsoryCount =
    subjects?.filter((subject) => subject.category === "compulsory").length ||
    0;
  const electiveCount =
    subjects?.filter((subject) => subject.category === "elective").length || 0;

  // Get subcategory color with fallback
  const getSubCategoryColor = (subCategory: string | undefined): RadixColor => {
    if (!subCategory || !subCategoryColors[subCategory]) {
      return "gray";
    }
    return subCategoryColors[subCategory];
  };

  const handleDeleteSubject = () => {
    if (!deleteSubject || !subjectToDelete) {
      console.error(
        "Delete subject mutation not available or no subject selected"
      );
      return;
    }
    deleteSubject.mutate(subjectToDelete);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading subjects</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">
            Subject Management
          </Heading>
          <Button asChild>
            <Link to="/admin/subjects/create">Create Subject</Link>
          </Button>
        </Flex>

        {/* Summary Cards */}
        <Grid columns="3" gap="4">
          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--accent-3)", borderRadius: "50%" }}
              >
                <DashboardIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Total Subjects
                </Text>
                <Text size="5" weight="bold">
                  {totalSubjects}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--red-3)", borderRadius: "50%" }}
              >
                <BookmarkIcon width="20" height="20" color="var(--red-11)" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Compulsory
                </Text>
                <Text size="5" weight="bold">
                  {compulsoryCount}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--green-3)", borderRadius: "50%" }}
              >
                <BookmarkIcon width="20" height="20" color="var(--green-11)" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Elective
                </Text>
                <Text size="5" weight="bold">
                  {electiveCount}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid columns="3" gap="4">
          <TextField.Root
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root value={category} onValueChange={setCategory}>
            <Select.Trigger placeholder="Filter by category" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Categories</Select.Label>
                <Select.Item value={ALL_CATEGORIES}>All Categories</Select.Item>
                <Select.Item value="compulsory">Compulsory</Select.Item>
                <Select.Item value="elective">Elective</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>

          {uniqueSubCategories.length > 0 && (
            <Select.Root value={subCategory} onValueChange={setSubCategory}>
              <Select.Trigger placeholder="Filter by subcategory" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Subcategories</Select.Label>
                  <Select.Item value={ALL_SUBCATEGORIES}>
                    All Subcategories
                  </Select.Item>
                  {uniqueSubCategories.map((subCat) => (
                    <Select.Item key={subCat} value={subCat || "unknown"}>
                      {subCat || "Uncategorized"}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          )}
        </Grid>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Subcategory</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {subjects.map((subject, index) => (
              <Table.Row key={subject._id}>
                <Table.Cell>{(page - 1) * itemsPerPage + index + 1}</Table.Cell>
                <Table.RowHeaderCell>
                  <Text>{subject.name}</Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Badge variant="soft" style={{ fontFamily: "monospace" }}>
                    {subject.code}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant="solid"
                    color={subject.category === "compulsory" ? "red" : "green"}
                    size="1"
                  >
                    {subject.category}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {subject.subCategory ? (
                    <Badge
                      variant="soft"
                      color={getSubCategoryColor(subject.subCategory)}
                    >
                      {subject.subCategory}
                    </Badge>
                  ) : (
                    <Text color="gray" size="2">
                      Not categorized
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant="soft"
                    color={subject.isActive ? "green" : "red"}
                  >
                    {subject.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/subjects/${subject._id}`}>View</Link>
                    </Button>
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/subjects/${subject._id}/edit`}>
                        <Pencil2Icon /> Edit
                      </Link>
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => setSubjectToDelete(subject._id)}
                    >
                      <TrashIcon /> Delete
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {subjects.length ? (page - 1) * itemsPerPage + 1 : 0}-
            {Math.min(page * itemsPerPage, totalSubjects)} of {totalSubjects}{" "}
            subjects
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
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>

        <AlertDialog.Root
          open={!!subjectToDelete}
          onOpenChange={(open) => !open && setSubjectToDelete(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to delete this subject? This action cannot
              be undone.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant="solid"
                  color="red"
                  onClick={handleDeleteSubject}
                  disabled={!deleteSubject || deleteSubject.isPending}
                >
                  {deleteSubject?.isPending ? "Deleting..." : "Delete Subject"}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
};

export default SubjectManagement;
