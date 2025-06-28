import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Grid,
  TextField,
  Separator,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  Pencil1Icon,
  PersonIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  DotsVerticalIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { TeacherClass } from "../../../types/class";

const TeacherClasses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const itemsPerPage = 8;

  // Fetch teacher's classes
  const { data: classes, isLoading } = useQuery<TeacherClass[]>({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      return response as TeacherClass[];
    },
  });

  // Filter classes based on search term
  const filteredClasses = classes?.filter(
    (cls) =>
      (cls.class.name
        ? cls.class.name.toLowerCase().includes(searchTerm.toLowerCase())
        : false) ||
      (cls.class.code
        ? cls.class.code.toLowerCase().includes(searchTerm.toLowerCase())
        : false)
  );

  // Paginate filtered classes
  const paginatedClasses = filteredClasses?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;

  // Function to generate random pastel color based on class name
  const getClassColor = (name: string | undefined) => {
    if (!name) return "var(--blue-5)";
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      "var(--blue-5)",
      "var(--green-5)",
      "var(--purple-5)",
      "var(--orange-5)",
      "var(--pink-5)",
      "var(--cyan-5)",
    ];
    return colors[hash % colors.length];
  };

  // Calculate class statistics
  const totalClasses = classes?.length || 0;
  const totalSubjects =
    classes?.reduce((acc, cls) => acc + (cls.subjects?.length || 0), 0) || 0;
  const totalStudents =
    classes?.reduce(
      (acc, cls) => acc + (cls.enrolledStudents?.length || 0),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      <Flex direction="column" gap="6">
        {/* Header Section */}
        <Flex justify="between" align="center" gap="4">
          <Box>
            <Heading size="7" mb="1">
              My Classes
            </Heading>
            <Text color="gray" size="2">
              Manage your classes, subjects, and schedules
            </Text>
          </Box>
          {/* <Button asChild size="3">
            <Link to="/teacher/classes/create">
              <PlusIcon /> Create New Class
            </Link>
          </Button> */}
        </Flex>

        {/* Stats Overview Cards */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="4">
          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box
                p="3"
                style={{ background: "var(--blue-3)", borderRadius: "50%" }}
              >
                <BookmarkIcon width="24" height="24" color="var(--blue-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">
                  {totalClasses}
                </Text>
                <Text size="2" color="gray">
                  Total Classes
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box
                p="3"
                style={{ background: "var(--green-3)", borderRadius: "50%" }}
              >
                <BookmarkIcon width="24" height="24" color="var(--green-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">
                  {totalSubjects}
                </Text>
                <Text size="2" color="gray">
                  Total Subjects
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box
                p="3"
                style={{ background: "var(--amber-3)", borderRadius: "50%" }}
              >
                <PersonIcon width="24" height="24" color="var(--amber-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">
                  {totalStudents}
                </Text>
                <Text size="2" color="gray">
                  Total Students
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Search and Filters */}
        <Card variant="surface" size="2">
          <Flex gap="3" align="center" justify="between" wrap="wrap">
            <TextField.Root
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "260px" }}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>

            <Flex gap="3" align="center">
              <Button
                variant={viewMode === "grid" ? "solid" : "soft"}
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === "list" ? "solid" : "soft"}
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* No results state */}
        {paginatedClasses && paginatedClasses.length === 0 && (
          <Card size="3">
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="3"
              p="6"
            >
              <Box
                p="3"
                style={{ background: "var(--gray-3)", borderRadius: "50%" }}
              >
                <MagnifyingGlassIcon width="24" height="24" />
              </Box>
              <Heading size="4">No classes found</Heading>
              <Text align="center" color="gray">
                No classes match your search criteria. Try modifying your search
                or create a new class.
              </Text>
            </Flex>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" &&
          paginatedClasses &&
          paginatedClasses.length > 0 && (
            <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
              {paginatedClasses?.map((cls) => (
                <Card key={cls.class._id} variant="classic">
                  <Box
                    style={{
                      height: "8px",
                      background: getClassColor(cls.class.name),
                      borderTopLeftRadius: "var(--radius-4)",
                      borderTopRightRadius: "var(--radius-4)",
                      marginTop: "-1px",
                    }}
                  />
                  <Box p="4">
                    <Flex justify="between" align="start" mb="3">
                      <Box>
                        <Heading size="4">
                          {cls.class.name || "Untitled Class"}
                        </Heading>
                        <Text size="2" color="gray" mt="1">
                          {cls.class.code || "No code"} •{" "}
                          {cls.class.level || "No level"}
                        </Text>
                      </Box>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button variant="ghost" size="1">
                            <DotsVerticalIcon width="16" height="16" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item asChild>
                            <Link to={`/teacher/classes/${cls.class._id}`}>
                              View Details
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to={`/teacher/classes/${cls.class._id}/attendance`}
                            >
                              Attendance
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to={`/teacher/classes/${cls.class._id}/assignments`}
                            >
                              Assignments
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item color="red">
                            Archive Class
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Flex>

                    <Separator size="4" my="3" />

                    <Flex direction="column" gap="2">
                      <Flex gap="2" align="center">
                        <BookmarkIcon color="var(--gray-9)" />
                        <Text size="2">
                          <strong>{cls.subjects.length}</strong> Subjects
                        </Text>
                      </Flex>
                      <Flex gap="2" align="center">
                        <PersonIcon color="var(--gray-9)" />
                        <Text size="2">
                          <strong>{cls.enrolledStudents.length}</strong>{" "}
                          Students
                        </Text>
                      </Flex>
                    </Flex>

                    <Separator size="4" my="3" />

                    <Flex gap="2" justify="end" mt="2">
                      <Button asChild size="1" variant="soft">
                        <Link to={`/teacher/classes/${cls.class._id}`}>
                          <Pencil1Icon /> Details
                        </Link>
                      </Button>
                      <Button asChild size="1" variant="soft">
                        <Link
                          to={`/teacher/classes/${cls.class._id}/attendance`}
                        >
                          <PersonIcon /> Attendance
                        </Link>
                      </Button>
                      <Button asChild size="1" variant="solid">
                        <Link
                          to={`/teacher/classes/${cls.class._id}/assignments`}
                        >
                          <BookmarkIcon /> Assignments
                        </Link>
                      </Button>
                    </Flex>
                  </Box>
                </Card>
              ))}
            </Grid>
          )}

        {/* List View */}
        {viewMode === "list" &&
          paginatedClasses &&
          paginatedClasses.length > 0 && (
            <Card variant="surface">
              {paginatedClasses?.map((cls, index) => (
                <React.Fragment key={cls.class._id}>
                  {index > 0 && <Separator size="4" />}
                  <Flex p="4" justify="between" align="center">
                    <Flex gap="3" align="center">
                      <Box
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: getClassColor(cls.class.name),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {cls.class.name?.substring(0, 2) || "CL"}
                      </Box>
                      <Box>
                        <Text weight="bold">
                          {cls.class.name || "Untitled Class"}
                        </Text>
                        <Flex gap="2" align="center">
                          <Text size="1" color="gray">
                            {cls.class.code || "No code"}
                          </Text>
                          <Text size="1">•</Text>
                          <Text size="1" color="gray">
                            Level: {cls.class.level || "N/A"}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>

                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text size="1">Subjects</Text>
                        <Text weight="bold" size="2">
                          {cls.subjects.length}
                        </Text>
                      </Box>

                      <Box
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text size="1">Students</Text>
                        <Text weight="bold" size="2">
                          {cls.enrolledStudents.length}
                        </Text>
                      </Box>

                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button variant="soft" size="2">
                            Actions <GearIcon />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item asChild>
                            <Link to={`/teacher/classes/${cls.class._id}`}>
                              View Details
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to={`/teacher/classes/${cls.class._id}/attendance`}
                            >
                              Attendance
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to={`/teacher/classes/${cls.class._id}/assignments`}
                            >
                              Assignments
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item color="red">
                            Archive Class
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Flex>
                  </Flex>
                </React.Fragment>
              ))}
            </Card>
          )}

        {/* Pagination */}
        {filteredClasses && filteredClasses.length > itemsPerPage && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, filteredClasses.length)} of{" "}
              {filteredClasses.length} classes
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
                disabled={page * itemsPerPage >= filteredClasses.length}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </div>
  );
};

export default TeacherClasses;
