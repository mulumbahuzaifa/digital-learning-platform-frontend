import { 
    Card, 
    Flex, 
    Text, 
    Select,
    Button,
    Heading,
    Box,
    Checkbox
  } from '@radix-ui/themes';
  import { useQuery } from '@tanstack/react-query';
  import { userService } from '../../services/userService';
  import LoadingSpinner from '../ui/LoadingSpinner';
  import { useClassMutation } from '../../hooks/useClassMutation';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useState } from 'react';
import { classService } from '../../services/classService';
  
  const AssignTeacherForm = () => {
    const { id, subjectId } = useParams();
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [isLeadTeacher, setIsLeadTeacher] = useState(false);
    const { assignTeacher } = useClassMutation(id);
  
    const { data: teachers, isLoading } = useQuery({
      queryKey: ['teachers'],
      queryFn: () => userService.getAllUsers().then(users => 
        users.filter(user => user.role === 'teacher')
      ),
    });
  
    const { data: classData } = useQuery({
      queryKey: ['class', id],
      queryFn: () => classService.getClassById(id!),
    });
  
    const subject = classData?.subjects.find(s => s.subject._id === subjectId);
  
    const handleSubmit = async () => {
      if (!selectedTeacher || !subjectId) return;
      await assignTeacher.mutateAsync({ 
        subjectId,
        data: {
          teacher: selectedTeacher,
          isLeadTeacher
        }
      });
      navigate(`/admin/classes/${id}`);
    };
  
    if (isLoading) return <LoadingSpinner />;
    if (!subject) return <div>Subject not found in this class</div>;
  
    // Filter out teachers already assigned to this subject
    const availableTeachers = teachers?.filter(teacher => 
      !subject.teachers.some(t => t.teacher._id === teacher._id)
    );
  
    return (
      <Card size="4">
        <Heading mb="4">Assign Teacher to Subject</Heading>
        <Flex direction="column" gap="4">
          <Text>Class: {classData?.name}</Text>
          <Text>Subject: {subject.subject.name}</Text>
          
          <Select.Root 
            value={selectedTeacher} 
            onValueChange={setSelectedTeacher}
          >
            <Select.Trigger placeholder="Select a teacher" />
            <Select.Content>
              {availableTeachers?.length > 0 ? (
                availableTeachers.map(teacher => (
                  <Select.Item key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </Select.Item>
                ))
              ) : (
                <Select.Item disabled value="">
                  No teachers available to assign
                </Select.Item>
              )}
            </Select.Content>
          </Select.Root>
  
          <Box>
            <Text as="div" size="2" mb="1" weight="bold">
              Role
            </Text>
            <Flex gap="2" align="center">
              <Checkbox 
                checked={isLeadTeacher}
                onCheckedChange={setIsLeadTeacher}
              />
              <Text size="2">Is Lead Teacher</Text>
            </Flex>
          </Box>
  
          <Flex gap="3" justify="end">
            <Button 
              variant="soft" 
              onClick={() => navigate(`/admin/classes/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedTeacher || assignTeacher.isPending}
              onClick={handleSubmit}
            >
              {assignTeacher.isPending ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };
  
  export default AssignTeacherForm;