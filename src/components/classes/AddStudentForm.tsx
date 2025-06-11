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
  
  const AddStudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState('');
    const [status, setStatus] = useState<'approved' | 'pending'>('approved');
    const { addStudent } = useClassMutation(id);
  
    const { data: students, isLoading } = useQuery({
      queryKey: ['students'],
      queryFn: () => userService.getAllUsers().then(users => 
        users.filter(user => user.role === 'student')
      ),
    });
  
    const { data: classData } = useQuery({
      queryKey: ['class', id],
      queryFn: () => classService.getClassById(id!),
    });
  
    const handleSubmit = async () => {
      if (!selectedStudent) return;
      await addStudent.mutateAsync({ 
        student: selectedStudent,
        status
      });
      navigate(`/admin/classes/${id}`);
    };
  
    if (isLoading) return <LoadingSpinner />;
  
    // Filter out students already in the class
    const availableStudents = students?.filter(student => 
      !classData?.students.some(s => s.student._id === student._id)
    );
  
    return (
      <Card size="4">
        <Heading mb="4">Add Student to Class</Heading>
        <Flex direction="column" gap="4">
          <Text>Class: {classData?.name}</Text>
          
          <Select.Root 
            value={selectedStudent} 
            onValueChange={setSelectedStudent}
          >
            <Select.Trigger placeholder="Select a student" />
            <Select.Content>
              {availableStudents?.length > 0 ? (
                availableStudents.map(student => (
                  <Select.Item key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </Select.Item>
                ))
              ) : (
                <Select.Item disabled value="">
                  No students available to add
                </Select.Item>
              )}
            </Select.Content>
          </Select.Root>
  
          <Box>
            <Text as="div" size="2" mb="1" weight="bold">
              Enrollment Status
            </Text>
            <Flex gap="2" align="center">
              <Checkbox 
                checked={status === 'approved'}
                onCheckedChange={(checked) => setStatus(checked ? 'approved' : 'pending')}
              />
              <Text size="2">Approved (uncheck for pending)</Text>
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
              disabled={!selectedStudent || addStudent.isPending}
              onClick={handleSubmit}
            >
              {addStudent.isPending ? 'Adding...' : 'Add Student'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };
  
  export default AddStudentForm;