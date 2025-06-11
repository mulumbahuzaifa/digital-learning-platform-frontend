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
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useClassMutation } from "../../../hooks/useClassMutation";
import { useState, useEffect } from "react";

const AddSubjectToClass = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Force refetch on component mount
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
    }
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  }, [id, queryClient]);

  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
    staleTime: 0,
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getAllSubjects,
    staleTime: 0,
  });

  const { addSubject } = useClassMutation();

  if (isLoadingClass || isLoadingSubjects) return <LoadingSpinner />;
  if (!classData) return <div>Class not found</div>;
  if (!subjects) return <div>Error loading subjects</div>;

  // Filter out subjects that are already in the class
  const availableSubjects = subjects.filter(
    subject => !classData.subjects.some(clsSubject => clsSubject.subject._id === subject._id)
  );

  const handleSubmit = async () => {
    if (!selectedSubject) return;
    
    await addSubject.mutateAsync({
      classId: id!,
      data: { subject: selectedSubject }
    });
    navigate(`/admin/classes/${id}`);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Heading size="5">Add Subject to {classData.name}</Heading>
          </Flex>
        </Flex>

        <Box>
          <Text as="p" size="2" color="gray" mb="2">
            Select a subject to add to this class
          </Text>
          <Select.Root
            value={selectedSubject}
            onValueChange={setSelectedSubject}
            size="3"
          >
            <Select.Trigger placeholder="Select a subject" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Available Subjects</Select.Label>
                {availableSubjects.map(subject => (
                  <Select.Item key={subject._id} value={subject._id}>
                    {subject.name}
                  </Select.Item>
                ))}
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
            disabled={!selectedSubject || addSubject.isPending}
          >
            {addSubject.isPending ? "Adding..." : "Add Subject"}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default AddSubjectToClass;