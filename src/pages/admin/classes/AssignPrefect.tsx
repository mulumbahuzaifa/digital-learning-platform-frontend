import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Flex, 
  Text, 
  Heading, 
  Select, 
  Button,
  Box,
  TextField
} from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useClassMutation } from "../../../hooks/useClassMutation";
import { useState } from "react";

const AssignPrefect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [position, setPosition] = useState('');

  const { data: classData, isLoading } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
  });

  const { assignPrefect } = useClassMutation();

  if (isLoading) return <LoadingSpinner />;
  if (!classData) return <div>Class not found</div>;

  // Filter out students that are already prefects
  const availableStudents = classData.students.filter(
    studentData => !classData.prefects.some(prefect => prefect.student._id === studentData.student._id)
  );

  const handleSubmit = async () => {
    if (!selectedStudent || !position) return;
    
    await assignPrefect.mutateAsync({
      classId: id!,
      data: { 
        student: selectedStudent,
        position
      }
    });
    navigate(`/admin/classes/${id}`);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Heading size="5">Assign Prefect to {classData.name}</Heading>
          </Flex>
        </Flex>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Select a student to assign as prefect
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
                {availableStudents.map(studentData => (
                  <Select.Item key={studentData.student._id} value={studentData.student._id}>
                    {studentData.student.firstName} {studentData.student.lastName}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Enter the prefect position
          </Text>
          <TextField.Root
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g., Head Prefect, Sports Prefect"
            size="3"
          />
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
            disabled={!selectedStudent || !position || assignPrefect.isPending}
          >
            {assignPrefect.isPending ? "Assigning..." : "Assign Prefect"}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default AssignPrefect;