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
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  Pencil2Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useClassMutation } from "../../../hooks/useClassMutation";

// Special value for "all" filter options
const ALL_LEVELS = "all_levels";
const ALL_STREAMS = "all_streams";

const ClassManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [level, setLevel] = useState(ALL_LEVELS);
  const [stream, setStream] = useState(ALL_STREAMS);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classes", { level, stream }],
    queryFn: () => classService.getAllClasses(),
  });

  const { deleteClass } = useClassMutation();

  const filteredClasses = classes?.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedClasses = filteredClasses?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading classes</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">
            Class Management
          </Heading>
          <Button asChild>
            <Link to="/admin/classes/create">Create Class</Link>
          </Button>
        </Flex>

        {/* Class Counter Card */}
        <Card variant="classic">
          <Flex align="center" gap="3">
            <Box
              p="2"
              style={{ background: "var(--accent-3)", borderRadius: "50%" }}
            >
              <BookmarkIcon width="20" height="20" />
            </Box>
            <Flex direction="column">
              <Text size="2" color="gray">
                Total Classes
              </Text>
              <Text size="5" weight="bold">
                {classes?.length || 0}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Filters */}
        <Grid columns="3" gap="4">
          <TextField.Root
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root value={level} onValueChange={setLevel}>
            <Select.Trigger placeholder="Filter by level" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Level</Select.Label>
                <Select.Item value={ALL_LEVELS}>All Levels</Select.Item>
                <Select.Item value="Primary 1">Primary 1</Select.Item>
                <Select.Item value="Primary 2">Primary 2</Select.Item>
                <Select.Item value="Primary 3">Primary 3</Select.Item>
                <Select.Item value="Primary 4">Primary 4</Select.Item>
                <Select.Item value="Primary 5">Primary 5</Select.Item>
                <Select.Item value="Primary 6">Primary 6</Select.Item>
                <Select.Item value="Primary 7">Primary 7</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root value={stream} onValueChange={setStream}>
            <Select.Trigger placeholder="Filter by stream" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Stream</Select.Label>
                <Select.Item value={ALL_STREAMS}>All Streams</Select.Item>
                <Select.Item value="A">Stream A</Select.Item>
                <Select.Item value="B">Stream B</Select.Item>
                <Select.Item value="C">Stream C</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Grid>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Level</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Stream</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Subjects</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedClasses?.map((cls, index) => (
              <Table.Row key={cls._id}>
                <Table.Cell>{(page - 1) * itemsPerPage + index + 1}</Table.Cell>
                <Table.RowHeaderCell>
                  <Flex align="center" gap="2">
                    <BookmarkIcon />
                    <Text>{cls.name}</Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell>{cls.code}</Table.Cell>
                <Table.Cell>{cls.level}</Table.Cell>
                <Table.Cell>
                  <Badge variant="soft">{cls.stream}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="soft">{cls.subjects.length} subjects</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/classes/${cls._id}`}>
                        <Pencil2Icon /> View
                      </Link>
                    </Button>
                    <Button asChild size="1" variant="soft">
                      <Link to={`/admin/classes/${cls._id}/edit`}>
                        <Pencil2Icon /> Edit
                      </Link>
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => setClassToDelete(cls._id)}
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
            Showing {(page - 1) * itemsPerPage + 1}-
            {Math.min(page * itemsPerPage, filteredClasses?.length || 0)} of{" "}
            {filteredClasses?.length} classes
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
              disabled={page * itemsPerPage >= (filteredClasses?.length || 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root
          open={!!classToDelete}
          onOpenChange={(open) => !open && setClassToDelete(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to delete this class? This action cannot be
              undone.
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
                  onClick={() =>
                    classToDelete && deleteClass.mutate(classToDelete)
                  }
                  disabled={deleteClass.isPending}
                >
                  {deleteClass.isPending ? "Deleting..." : "Delete Class"}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
};

export default ClassManagement;
