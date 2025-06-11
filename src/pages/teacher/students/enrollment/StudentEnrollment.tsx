import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  TextField,
  Select,
  Table,
  Badge,
  Grid,
  Dialog,
  AlertDialog,
} from "@radix-ui/themes";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { classService } from "../../../../services/classService";
import { studentService } from "../../../../services/studentService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../../utils/formatters";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface SubjectWithTeachers {
  subject: Subject;
  teachers: {
    teacher: Teacher;
    status: "pending" | "approved" | "rejected";
    isLeadTeacher: boolean;
    _id: string;
  }[];
  _id: string;
}

interface StudentEnrollment {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected";
  enrollmentType: "new" | "transfer";
  enrolledBy: Teacher;
  _id: string;
  enrollmentDate: string;
}

interface Class {
  _id: string;
  name: string;
  code: string;
  year: string;
  academicTerm: string;
  description: string;
  subjects: SubjectWithTeachers[];
  isActive: boolean;
  students: StudentEnrollment[];
  prefects: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "active" | "inactive";
}

interface EnrollmentDisplay {
  class: {
    _id: string;
    name: string;
    code: string;
    year: string;
    academicTerm: string;
  };
  status: "pending" | "approved" | "rejected";
  enrollmentType: "new" | "transfer";
  enrollmentDate: string;
}

const StudentEnrollment = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [enrollmentType, setEnrollmentType] = useState<"new" | "transfer">(
    "new"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [studentToUnenroll, setStudentToUnenroll] = useState<{
    studentId: string;
    classId: string;
  } | null>(null);

  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await studentService.getAllStudents();
      return response as Student[];
    },
  });

  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      return response as unknown as Class[];
    },
  });

  // Get student enrollments from classes
  const getStudentEnrollments = (studentId: string): EnrollmentDisplay[] => {
    if (!classes) return [];
    return classes.flatMap((cls: Class) =>
      cls.students
        .filter(
          (enrollment: StudentEnrollment) =>
            enrollment.student._id === studentId
        )
        .map((enrollment: StudentEnrollment) => ({
          class: {
            _id: cls._id,
            name: cls.name,
            code: cls.code,
            year: cls.year,
            academicTerm: cls.academicTerm,
          },
          status: enrollment.status,
          enrollmentType: enrollment.enrollmentType,
          enrollmentDate: enrollment.enrollmentDate,
        }))
    );
  };

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () =>
      classService.addStudentToClass(
        selectedClass,
        selectedStudent,
        "approved",
        enrollmentType
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Unenroll mutation
  const unenrollMutation = useMutation({
    mutationFn: () =>
      classService.removeStudentFromClass(
        studentToUnenroll!.classId,
        studentToUnenroll!.studentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setUnenrollDialogOpen(false);
      setStudentToUnenroll(null);
    },
  });

  const resetForm = () => {
    setSelectedStudent("");
    setSelectedClass("");
    setEnrollmentType("new");
  };

  // Filter students based on search term
  const filteredStudents = students?.filter(
    (student: Student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.email &&
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoadingStudents || isLoadingClasses) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Heading size="6">Enroll Students</Heading>

      {/* Search and Filter */}
      <Card variant="classic" className="p-4">
        <Flex direction="column" gap="4">
          <Text weight="bold">Find Student</Text>

          <TextField.Root
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </Card>

      {/* Student List */}
      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Current Enrollments
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredStudents?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text align="center" color="gray">
                    No students found
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredStudents?.map((student: Student) => {
                const enrollments = getStudentEnrollments(student._id);
                return (
                  <Table.Row key={student._id}>
                    <Table.Cell>
                      <Flex align="center" gap="2">
                        <PersonIcon />
                        <Text>
                          {student.firstName} {student.lastName}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>{student.email || "-"}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={student.status === "active" ? "green" : "red"}
                      >
                        {student.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex direction="column" gap="1">
                        {enrollments.map((enrollment: EnrollmentDisplay) => (
                          <Flex
                            key={enrollment.class._id}
                            align="center"
                            gap="2"
                          >
                            <Text size="2">
                              {enrollment.class.name} ({enrollment.class.year},{" "}
                              {enrollment.class.academicTerm})
                            </Text>
                            <Badge
                              color={
                                enrollment.status === "approved"
                                  ? "green"
                                  : "yellow"
                              }
                            >
                              {enrollment.status}
                            </Badge>
                          </Flex>
                        ))}
                        {enrollments.length === 0 && (
                          <Text size="2" color="gray">
                            No enrollments
                          </Text>
                        )}
                      </Flex>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button
                          size="1"
                          onClick={() => {
                            setSelectedStudent(student._id);
                            setIsDialogOpen(true);
                          }}
                        >
                          <PlusIcon /> Enroll
                        </Button>
                        {enrollments.map((enrollment: EnrollmentDisplay) => (
                          <Button
                            key={enrollment.class._id}
                            size="1"
                            color="red"
                            variant="soft"
                            onClick={() => {
                              setStudentToUnenroll({
                                studentId: student._id,
                                classId: enrollment.class._id,
                              });
                              setUnenrollDialogOpen(true);
                            }}
                          >
                            <Cross2Icon /> Unenroll
                          </Button>
                        ))}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Enroll Student</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Select a class to enroll the student in
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Text weight="medium">
              Student:{" "}
              {
                students?.find((s: Student) => s._id === selectedStudent)
                  ?.firstName
              }{" "}
              {
                students?.find((s: Student) => s._id === selectedStudent)
                  ?.lastName
              }
            </Text>

            <Flex direction="column" gap="2">
              <Text size="2">Class</Text>
              <Select.Root
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <Select.Trigger placeholder="Select a class" />
                <Select.Content>
                  {classes?.map((cls: Class) => (
                    <Select.Item key={cls._id} value={cls._id}>
                      {cls.name} ({cls.year}, {cls.academicTerm})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2">Enrollment Type</Text>
              <Select.Root
                value={enrollmentType}
                onValueChange={(value: "new" | "transfer") =>
                  setEnrollmentType(value)
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="new">New Enrollment</Select.Item>
                  <Select.Item value="transfer">Transfer</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={!selectedClass || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? <LoadingSpinner /> : "Enroll Student"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog.Root
        open={unenrollDialogOpen}
        onOpenChange={setUnenrollDialogOpen}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Unenroll Student</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to unenroll this student from the class? This
            action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color="red"
                onClick={() => unenrollMutation.mutate()}
                disabled={unenrollMutation.isPending}
              >
                {unenrollMutation.isPending ? <LoadingSpinner /> : "Unenroll"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default StudentEnrollment;
