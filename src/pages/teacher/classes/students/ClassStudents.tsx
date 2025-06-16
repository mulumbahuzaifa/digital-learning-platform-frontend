import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Card,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Table,
  Badge,
  Grid,
  TextField,
  Select,
  Dialog,
  Separator,
  Avatar,
  Tabs,
  Popover,
} from "@radix-ui/themes";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  CheckCircledIcon,
  DotsHorizontalIcon,
  EnvelopeClosedIcon,
  DownloadIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { classService } from "../../../../services/classService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatDate } from "../../../../utils/formatters";
import { TeacherClass } from "../../../../types/class";

interface AddStudentFormData {
  studentId: string;
  enrollmentType: "new" | "transfer";
}

const ClassStudents = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState<AddStudentFormData>({
    studentId: "",
    enrollmentType: "new",
  });
  const [activeTab, setActiveTab] = useState<"students" | "subjects">(
    "students"
  );
  const itemsPerPage = 10;

  // Fetch teacher's classes
  const { data: classes, isLoading } = useQuery<TeacherClass[]>({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      return response as TeacherClass[];
    },
  });

  // Find the current class based on the URL parameter
  const currentClass = id
    ? classes?.find((cls) => cls.class._id === id)
    : classes?.[0]; // If no ID is provided, use the first class

  // Get enrolled students
  const enrolledStudents = currentClass?.enrolledStudents || [];

  // Filter students based on search term and status
  const filteredStudents = enrolledStudents.filter((enrollment) => {
    const matchesSearch =
      `${enrollment.student.firstName} ${enrollment.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (enrollment.student.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Status filter logic
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "enrolled") {
      matchesStatus = enrollment.enrollmentDetails.subjects.some(
        (s) => s.status === "enrolled"
      );
    } else if (statusFilter === "pending") {
      matchesStatus = enrollment.enrollmentDetails.subjects.some(
        (s) => s.status === "pending"
      );
    } else if (statusFilter === "dropped") {
      matchesStatus = enrollment.enrollmentDetails.subjects.some(
        (s) => s.status === "dropped"
      );
    }

    return matchesSearch && matchesStatus;
  });

  // Paginate filtered students
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Statistics
  const fullEnrolledCount = enrolledStudents.filter((student) =>
    student.enrollmentDetails.subjects.every((s) => s.status === "enrolled")
  ).length;

  const anyEnrolledCount = enrolledStudents.filter((student) =>
    student.enrollmentDetails.subjects.some((s) => s.status === "enrolled")
  ).length;

  const pendingCount = enrolledStudents.filter((student) =>
    student.enrollmentDetails.subjects.some((s) => s.status === "pending")
  ).length;

  const totalCount = enrolledStudents.length;

  // Get all unique subjects from student enrollments
  const allSubjects = new Map();

  // First add all subjects the teacher teaches
  currentClass?.subjects.forEach((subject) => {
    allSubjects.set(subject._id, {
      ...subject,
      enrolledCount: 0,
    });
  });

  // Then count enrollments for each subject
  enrolledStudents.forEach((student) => {
    student.enrollmentDetails.subjects.forEach((subjectEnrollment) => {
      const subjectId = subjectEnrollment.subject._id;
      const subject = allSubjects.get(subjectId) || {
        _id: subjectId,
        name: subjectEnrollment.subject.name,
        code: subjectEnrollment.subject.code,
        enrolledCount: 0,
        isActive: true,
      };

      if (subjectEnrollment.status === "enrolled") {
        subject.enrolledCount += 1;
      }

      allSubjects.set(subjectId, subject);
    });
  });

  const subjectsList = Array.from(allSubjects.values());

  if (isLoading) return <LoadingSpinner />;

  if (!currentClass) {
    return (
      <Card size="3">
        <Flex direction="column" align="center" justify="center" gap="3" p="6">
          <Heading size="4">Class Not Found</Heading>
          <Text align="center" color="gray">
            The class you are trying to view is not available or you do not have
            access to it.
          </Text>
          <Button asChild mt="3">
            <Link to="/teacher/classes">Back to Classes</Link>
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Box>
          <Heading size="6">Students - {currentClass.class.name}</Heading>
          <Text color="gray" size="2">
            {currentClass.class.code} • {currentClass.class.level} •{" "}
            {currentClass.class.stream}
          </Text>
        </Box>
        <Button onClick={() => setShowAddStudentDialog(true)}>
          <PlusIcon /> Add Student
        </Button>
      </Flex>

      {/* Statistics Cards */}
      <Grid columns={{ initial: "1", sm: "3" }} gap="4">
        <Card variant="surface">
          <Flex align="center" gap="3">
            <Box
              p="3"
              style={{ background: "var(--blue-3)", borderRadius: "50%" }}
            >
              <PersonIcon width="24" height="24" color="var(--blue-9)" />
            </Box>
            <Flex direction="column">
              <Text size="6" weight="bold">
                {totalCount}
              </Text>
              <Text size="2" color="gray">
                Total Students
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
              <CheckCircledIcon width="24" height="24" color="var(--green-9)" />
            </Box>
            <Flex direction="column">
              <Text size="6" weight="bold">
                {anyEnrolledCount}
              </Text>
              <Text size="2" color="gray">
                Enrolled in any subject
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
              <DotsHorizontalIcon
                width="24"
                height="24"
                color="var(--amber-9)"
              />
            </Box>
            <Flex direction="column">
              <Text size="6" weight="bold">
                {pendingCount}
              </Text>
              <Text size="2" color="gray">
                Pending
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Grid>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "students" | "subjects")
        }
      >
        <Tabs.List>
          <Tabs.Trigger value="students">Students</Tabs.Trigger>
          <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* SUBJECTS TAB */}
      {activeTab === "subjects" && (
        <Card>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Enrolled Students
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {subjectsList.map((subject) => (
                <Table.Row key={subject._id}>
                  <Table.Cell>
                    <Text weight="bold">{subject.name}</Text>
                    {currentClass.subjects.some(
                      (s) => s._id === subject._id
                    ) && (
                      <Badge size="1" variant="soft" color="blue">
                        You teach
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft">{subject.code}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{subject.enrolledCount} students</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Popover.Root>
                      <Popover.Trigger>
                        <Button size="1" variant="soft">
                          <PersonIcon /> View Students
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content
                        style={{
                          maxWidth: 400,
                          maxHeight: 400,
                          overflow: "auto",
                        }}
                      >
                        <Heading size="3" mb="2">
                          Students in {subject.name}
                        </Heading>
                        <Separator size="4" mb="2" />
                        <Flex direction="column" gap="2">
                          {enrolledStudents
                            .filter((student) =>
                              student.enrollmentDetails.subjects.some(
                                (s) =>
                                  s.subject._id === subject._id &&
                                  s.status === "enrolled"
                              )
                            )
                            .map((student, idx) => (
                              <Flex key={idx} gap="2" align="center">
                                <Avatar
                                  size="1"
                                  fallback={`${student.student.firstName.charAt(
                                    0
                                  )}${student.student.lastName.charAt(0)}`}
                                  color="indigo"
                                />
                                <Text>
                                  {student.student.firstName}{" "}
                                  {student.student.lastName}
                                </Text>
                              </Flex>
                            ))}
                          {enrolledStudents.filter((student) =>
                            student.enrollmentDetails.subjects.some(
                              (s) =>
                                s.subject._id === subject._id &&
                                s.status === "enrolled"
                            )
                          ).length === 0 && (
                            <Text color="gray">
                              No students enrolled in this subject
                            </Text>
                          )}
                        </Flex>
                      </Popover.Content>
                    </Popover.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
              {subjectsList.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <Text align="center" color="gray">
                      No subjects found
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Card>
      )}

      {/* STUDENTS TAB */}
      {activeTab === "students" && (
        <>
          {/* Filters */}
          <Card variant="surface" size="2">
            <Flex gap="4" wrap="wrap">
              <TextField.Root
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: "200px" }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon />
                </TextField.Slot>
              </TextField.Root>

              <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
                <Select.Trigger placeholder="Filter by status" />
                <Select.Content>
                  <Select.Item value="all">All Status</Select.Item>
                  <Select.Item value="enrolled">Enrolled</Select.Item>
                  <Select.Item value="pending">Pending</Select.Item>
                  <Select.Item value="dropped">Dropped</Select.Item>
                </Select.Content>
              </Select.Root>

              <Button variant="soft">
                <DownloadIcon /> Export
              </Button>
            </Flex>
          </Card>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
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
                  <PersonIcon width="24" height="24" />
                </Box>
                <Heading size="4">No Students Found</Heading>
                <Text align="center" color="gray">
                  {enrolledStudents.length === 0
                    ? "This class doesn't have any students yet. Add students to get started."
                    : "No students match your search criteria. Try adjusting your filters."}
                </Text>
                {enrolledStudents.length === 0 && (
                  <Button onClick={() => setShowAddStudentDialog(true)} mt="3">
                    <PlusIcon /> Add Student
                  </Button>
                )}
              </Flex>
            </Card>
          )}

          {/* Students Table */}
          {filteredStudents.length > 0 && (
            <Card>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      Enrollment Info
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      Enrolled Subjects
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedStudents.map((enrollment, index) => (
                    <Table.Row key={enrollment.student._id || index}>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Avatar
                            size="2"
                            fallback={`${enrollment.student.firstName.charAt(
                              0
                            )}${enrollment.student.lastName.charAt(0)}`}
                            color="indigo"
                          />
                          <Box>
                            <Text weight="bold">
                              {enrollment.student.firstName}{" "}
                              {enrollment.student.lastName}
                            </Text>
                            {enrollment.student.email && (
                              <Flex align="center" gap="1">
                                <EnvelopeClosedIcon
                                  width="12"
                                  height="12"
                                  color="var(--gray-9)"
                                />
                                <Text size="1" color="gray">
                                  {enrollment.student.email}
                                </Text>
                              </Flex>
                            )}
                          </Box>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">
                          Academic Year:{" "}
                          {enrollment.enrollmentDetails.academicYear}
                        </Text>
                        <Text size="2">
                          Term: {enrollment.enrollmentDetails.term}
                        </Text>
                        <Text size="2">
                          Enrolled:{" "}
                          {formatDate(
                            enrollment.enrollmentDetails.enrollmentDate
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Popover.Root>
                          <Popover.Trigger>
                            <Button variant="ghost" size="1">
                              <InfoCircledIcon />{" "}
                              {enrollment.enrollmentDetails.subjects.length}{" "}
                              subjects
                            </Button>
                          </Popover.Trigger>
                          <Popover.Content
                            style={{
                              maxWidth: 360,
                              maxHeight: 300,
                              overflow: "auto",
                            }}
                          >
                            <Heading size="3" mb="2">
                              Enrolled Subjects
                            </Heading>
                            <Separator size="4" mb="2" />
                            <Flex direction="column" gap="2">
                              {enrollment.enrollmentDetails.subjects.map(
                                (s, idx) => {
                                  const isTeaching = currentClass.subjects.some(
                                    (teacherSubj) =>
                                      teacherSubj._id === s.subject._id
                                  );

                                  return (
                                    <Flex
                                      key={idx}
                                      justify="between"
                                      align="center"
                                    >
                                      <Flex gap="2" align="center">
                                        <Text>{s.subject.name}</Text>
                                        {isTeaching && (
                                          <Badge
                                            size="1"
                                            variant="soft"
                                            color="blue"
                                          >
                                            You teach
                                          </Badge>
                                        )}
                                      </Flex>
                                      <Badge
                                        color={
                                          s.status === "enrolled"
                                            ? "green"
                                            : s.status === "pending"
                                            ? "orange"
                                            : "red"
                                        }
                                      >
                                        {s.status}
                                      </Badge>
                                    </Flex>
                                  );
                                }
                              )}
                            </Flex>
                          </Popover.Content>
                        </Popover.Root>
                      </Table.Cell>
                      <Table.Cell>
                        {enrollment.enrollmentDetails.subjects.every(
                          (s) => s.status === "enrolled"
                        ) ? (
                          <Badge color="green">Fully Enrolled</Badge>
                        ) : enrollment.enrollmentDetails.subjects.some(
                            (s) => s.status === "enrolled"
                          ) ? (
                          <Badge color="blue">Partially Enrolled</Badge>
                        ) : enrollment.enrollmentDetails.subjects.some(
                            (s) => s.status === "pending"
                          ) ? (
                          <Badge color="orange">Pending</Badge>
                        ) : (
                          <Badge color="red">Not Enrolled</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <Button asChild size="1" variant="soft">
                            <Link
                              to={`/teacher/students/detail/${enrollment.student._id}`}
                            >
                              <PersonIcon /> Profile
                            </Link>
                          </Button>
                          <Dialog.Root>
                            <Dialog.Trigger>
                              <Button size="1" variant="soft" color="red">
                                <TrashIcon /> Remove
                              </Button>
                            </Dialog.Trigger>
                            <Dialog.Content>
                              <Dialog.Title>Remove Student</Dialog.Title>
                              <Dialog.Description size="2">
                                Are you sure you want to remove{" "}
                                {enrollment.student.firstName}{" "}
                                {enrollment.student.lastName} from this class?
                              </Dialog.Description>
                              <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                  <Button variant="soft" color="gray">
                                    Cancel
                                  </Button>
                                </Dialog.Close>
                                <Dialog.Close>
                                  <Button color="red">Remove Student</Button>
                                </Dialog.Close>
                              </Flex>
                            </Dialog.Content>
                          </Dialog.Root>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          )}

          {/* Pagination */}
          {filteredStudents.length > itemsPerPage && (
            <Flex justify="between" align="center" mt="4">
              <Text color="gray">
                Showing {(page - 1) * itemsPerPage + 1}-
                {Math.min(page * itemsPerPage, filteredStudents.length)} of{" "}
                {filteredStudents.length} students
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
                  disabled={page * itemsPerPage >= filteredStudents.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </>
      )}

      {/* Add Student Dialog */}
      <Dialog.Root
        open={showAddStudentDialog}
        onOpenChange={setShowAddStudentDialog}
      >
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add Student to Class</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Add an existing student to {currentClass.class.name}
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Student ID
              </Text>
              <TextField.Root
                placeholder="Enter student ID"
                value={addStudentForm.studentId}
                onChange={(e) =>
                  setAddStudentForm({
                    ...addStudentForm,
                    studentId: e.target.value,
                  })
                }
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Enrollment Type
              </Text>
              <Select.Root
                value={addStudentForm.enrollmentType}
                onValueChange={(value) =>
                  setAddStudentForm({
                    ...addStudentForm,
                    enrollmentType: value as "new" | "transfer",
                  })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="new">New Enrollment</Select.Item>
                  <Select.Item value="transfer">Transfer</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button>Add Student</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default ClassStudents;
