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
  Checkbox
} from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { userService } from "../../../services/userService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useClassMutation } from "../../../hooks/useClassMutation";
import { useState } from "react";

const AssignTeacherToSubject = () => {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isLeadTeacher, setIsLeadTeacher] = useState(false);

  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => userService.getAllUsers({ role: 'teacher' }),
  });

  const { assignTeacher } = useClassMutation();

  if (isLoadingClass || isLoadingTeachers) return <LoadingSpinner />;
  if (!classData) return <div>Class not found</div>;
  if (!teachers) return <div>Error loading teachers</div>;

  // Find the class subject that matches the subject ID
  const classSubject = classData.subjects.find(s => s.subject._id === subjectId);
  if (!classSubject) return <div>Subject not found in class</div>;

  // Filter out teachers that are already assigned to this subject
  const availableTeachers = teachers.filter(
    teacher => !classSubject.teachers.some(t => t.teacher._id === teacher._id)
  );

  const handleSubmit = async () => {
    if (!selectedTeacher) return;
    
    await assignTeacher.mutateAsync({
      classId: id!,
      subjectId: subjectId!,
      data: { 
        teacher: selectedTeacher,
        isLeadTeacher
      }
    });
    navigate(`/admin/classes/${id}`);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Heading size="5">Assign Teacher to {classSubject.subject.name}</Heading>
          </Flex>
        </Flex>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Select a teacher to assign to this subject
          </Text>
        <Select.Root 
          value={selectedTeacher} 
          onValueChange={setSelectedTeacher}
            size="3"
        >
          <Select.Trigger placeholder="Select a teacher" />
          <Select.Content>
              <Select.Group>
                <Select.Label>Available Teachers</Select.Label>
                {availableTeachers.map(teacher => (
                <Select.Item key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                </Select.Item>
                ))}
              </Select.Group>
          </Select.Content>
        </Select.Root>
        </Box>

        <Box>
        <Flex gap="2" align="center">
          <Checkbox 
            checked={isLeadTeacher}
              onCheckedChange={(checked) => setIsLeadTeacher(checked === true)}
          />
            <Text size="2">Assign as lead teacher</Text>
        </Flex>
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
            disabled={!selectedTeacher || assignTeacher.isPending}
          >
            {assignTeacher.isPending ? "Assigning..." : "Assign Teacher"}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default AssignTeacherToSubject;