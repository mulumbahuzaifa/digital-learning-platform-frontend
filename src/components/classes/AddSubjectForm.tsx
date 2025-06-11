import { 
    Card, 
    Flex, 
    Text, 
    Select,
    Button,
    Heading
  } from '@radix-ui/themes';
  import { useQuery } from '@tanstack/react-query';
  import { subjectService } from '../../services/subjectService';
  import LoadingSpinner from '../ui/LoadingSpinner';
  import { useClassMutation } from '../../hooks/useClassMutation';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useState } from 'react';
import { classService } from '../../services/classService';
  
  const AddSubjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState('');
    const { addSubject } = useClassMutation(id);
  
    const { data: subjects, isLoading } = useQuery({
      queryKey: ['subjects'],
      queryFn: subjectService.getAllSubjects,
    });
  
    const { data: classData } = useQuery({
      queryKey: ['class', id],
      queryFn: () => classService.getClassById(id!),
    });
  
    const handleSubmit = async () => {
      if (!selectedSubject) return;
      await addSubject.mutateAsync({ classId: id!, subjectId: selectedSubject });
      navigate(`/admin/classes/${id}`);
    };
  
    if (isLoading) return <LoadingSpinner />;
  
    // Filter out subjects already in the class
    const availableSubjects = subjects?.filter(subject => 
      !classData?.subjects.some(s => s.subject._id === subject._id)
    );
  
    return (
      <Card size="4">
        <Heading mb="4">Add Subject to Class</Heading>
        <Flex direction="column" gap="4">
          <Text>Class: {classData?.name}</Text>
          
          <Select.Root 
            value={selectedSubject} 
            onValueChange={setSelectedSubject}
          >
            <Select.Trigger placeholder="Select a subject" />
            <Select.Content>
              {availableSubjects?.length > 0 ? (
                availableSubjects.map(subject => (
                  <Select.Item key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </Select.Item>
                ))
              ) : (
                <Select.Item disabled value="">
                  No subjects available to add
                </Select.Item>
              )}
            </Select.Content>
          </Select.Root>
  
          <Flex gap="3" justify="end">
            <Button 
              variant="soft" 
              onClick={() => navigate(`/admin/classes/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedSubject || addSubject.isPending}
              onClick={handleSubmit}
            >
              {addSubject.isPending ? 'Adding...' : 'Add Subject'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  };
  
  export default AddSubjectForm;