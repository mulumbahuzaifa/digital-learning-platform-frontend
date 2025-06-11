import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Flex, 
  Text, 
  Heading, 
  Select, 
  Button,
  Box
} from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { userService } from "../../../services/userService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useClassMutation } from "../../../hooks/useClassMutation";
import { useState, useEffect } from "react";
import { EnrollmentStatus, EnrollmentType } from "../../../types";

const AddStudentToClass = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [status, setStatus] = useState<EnrollmentStatus>('approved');
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('new');

  // Force refetch on component mount
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
    }
  }, [id, queryClient]);

  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
    staleTime: 0,
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: () => userService.getAllUsers({ role: 'student' }),
    staleTime: 0,
  });

  const { addStudent } = useClassMutation();

  if (isLoadingClass || isLoadingStudents) return <LoadingSpinner />;
  if (!classData) return <div>Class not found</div>;
  if (!students) return <div>Error loading students</div>;

  // Filter only student users
  const availableStudents = students?.filter(
    student => !classData.students.some(clsStudent => clsStudent.student._id === student._id)
  );

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    
    await addStudent.mutateAsync({
      classId: id!,
      data: { 
        student: selectedStudent,
        status,
        enrollmentType
      }
    });
    navigate(`/admin/classes/${id}`);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Heading size="5">Add Student to {classData.name}</Heading>
          </Flex>
        </Flex>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Select a student to add to this class
          </Text>
        <Select.Root 
          value={selectedStudent} 
          onValueChange={setSelectedStudent}
            size="3"
        >
          <Select.Trigger placeholder="Select a student" />
          <Select.Content>
              <Select.Group>
                <Select.Label>Available Students</Select.Label>
                {availableStudents.map(student => (
                <Select.Item key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Enrollment Status
          </Text>
          <Select.Root
            value={status}
            onValueChange={(value) => setStatus(value as EnrollmentStatus)}
            size="3"
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Status</Select.Label>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="approved">Approved</Select.Item>
                <Select.Item value="rejected">Rejected</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Enrollment Type
          </Text>
          <Select.Root
            value={enrollmentType}
            onValueChange={(value) => setEnrollmentType(value as EnrollmentType)}
            size="3"
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Type</Select.Label>
                <Select.Item value="new">New</Select.Item>
                <Select.Item value="transfer">Transfer</Select.Item>
              </Select.Group>
          </Select.Content>
        </Select.Root>
        </Box>

        <Flex gap="3" justify="end" mt="4">
          <Button 
            variant="soft" 
            onClick={() => navigate(`/admin/classes/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStudent || addStudent.isPending}
          >
            {addStudent.isPending ? "Adding..." : "Add Student"}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default AddStudentToClass;