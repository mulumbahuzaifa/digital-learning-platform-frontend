import { 
    Card, 
    Flex, 
    Text, 
    Select,
    Button,
    Heading,
    TextField
  } from '@radix-ui/themes';
  import { useQuery } from '@tanstack/react-query';
  import { classService } from '../../services/classService';
  import LoadingSpinner from '../ui/LoadingSpinner';
  import { useClassMutation } from '../../hooks/useClassMutation';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useState } from 'react';
  
  const AssignPrefectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState('');
    const [position, setPosition] = useState('');
    const { assignPrefect } = useClassMutation(id);
  
    const { data: classData, isLoading } = useQuery({
      queryKey: ['class', id],
      queryFn: () => classService.getClassById(id!),
    });
  
    const handleSubmit = async () => {
      if (!selectedStudent || !position) return;
      await assignPrefect.mutateAsync({ 
        student: selectedStudent,
        position
      });
      navigate(`/admin/classes/${id}`);
    };
  
    if (isLoading) return <LoadingSpinner />;
    if (!classData) return <div>Class not found</div>;
  
    // Filter students who are approved and not already prefects
    const availableStudents = classData.students
      .filter(student => student.status === 'approved')
      .filter(student => 
        !classData.prefects.some(p => p.student._id === student.student._id)
      );
  
    return (
      <Card size="4">
        <Heading mb="4">Assign Prefect</Heading>
        <Flex direction="column" gap="4">
          <Text>Class: {classData.name}</Text>
          
          <Select.Root 
            value={selectedStudent} 
            onValueChange={setSelectedStudent}
          >
            <Select.Trigger placeholder="Select a student" />
            <Select.Content>
              {availableStudents.length > 0 ? (
                availableStudents.map(student => (
                  <Select.Item key={student.student._id} value={student.student._id}>
                    {student.student.firstName} {student.student.lastName}
                  </Select.Item>
                ))
              ) : (
                <Select.Item disabled value="">
                  No students available to assign as prefect
                </Select.Item>
              )}
            </Select.Content>
          </Select.Root>
  
          <TextField.Root>
            <Text as="label" size="2" weight="bold">
              Position
            </Text>
            <TextField.Slot>
                <Text size="1" weight="bold">
                    Position (e.g., Head Prefect, Timekeeper)
                </Text>
            </TextField.Slot>
            
          </TextField.Root>
  
          <Flex gap="3" justify="end">
            <Button 
              variant="soft" 
              onClick={() => navigate(`/admin/classes/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedStudent || !position || assignPrefect.isPending}
              onClick={handleSubmit}
            >
              {assignPrefect.isPending ? 'Assigning...' : 'Assign Prefect'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };
  
  export default AssignPrefectForm;