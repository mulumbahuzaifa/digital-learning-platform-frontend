import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog
} from '@radix-ui/themes';
import { 
  BookmarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Cross2Icon,
  PersonIcon
} from '@radix-ui/react-icons';
import { classService } from "../../../../services/classService";
import { subjectService } from "../../../../services/subjectService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { Class } from "../../../../types/class";

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
}

const ClassSubjects = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch class details
  const { data: classData, isLoading: isLoadingClass } = useQuery<Class>({
    queryKey: ["class", id],
    queryFn: () => classService.getClass(id!),
  });

  // Fetch all subjects for the dropdown
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Add subject mutation
  const addSubjectMutation = useMutation({
    mutationFn: () => classService.addSubjectToClass(id!, selectedSubject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id] });
      setIsAddDialogOpen(false);
      setSelectedSubject('');
    }
  });

  // Remove subject mutation
  const removeSubjectMutation = useMutation({
    mutationFn: (subjectId: string) => classService.removeSubjectFromClass(id!, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    }
  });

  // Filter subjects in the class based on search term
  const filteredSubjects = classData?.subjects.filter(subjectItem => {
    return subjectItem.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subjectItem.subject.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get available subjects (subjects not already in the class)
  const availableSubjects = subjects?.filter(subject => 
    !classData?.subjects.some(classSubject => 
      classSubject.subject._id === subject._id
    )
  );

  if (isLoadingClass || isLoadingSubjects) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Subjects - {classData?.name}</Heading>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon /> Add Subject
        </Button>
      </Flex>

      {/* Subject Counter Card */}
      <Card variant="classic">
        <Flex align="center" gap="3">
          <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
            <BookmarkIcon width="20" height="20" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray">Total Subjects</Text>
            <Text size="5" weight="bold">{classData?.subjects.length || 0}</Text>
          </Flex>
        </Flex>
      </Card>

      {/* Search */}
      <TextField.Root 
        placeholder="Search subjects..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      {/* Subjects Table */}
      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredSubjects?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text align="center" color="gray">No subjects found</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredSubjects?.map(subject => (
                <Table.Row key={subject._id}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <BookmarkIcon />
                      <Text>{subject.subject.name}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{subject.subject.code}</Table.Cell>
                  <Table.Cell>
                    {subject.teachers.length === 0 ? (
                      <Badge color="red">No Teachers</Badge>
                    ) : (
                      <Flex direction="column" gap="1">
                        {subject.teachers.map(teacher => (
                          <Flex key={teacher._id} gap="1" align="center">
                            <PersonIcon width="12" height="12" />
                            <Text size="1">
                              {teacher.teacher.firstName} {teacher.teacher.lastName}
                              {teacher.isLeadTeacher && (
                                <Badge color="blue" ml="1" size="1">Lead</Badge>
                              )}
                            </Text>
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button size="1" variant="soft">
                        Assign Teacher
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="red"
                        onClick={() => removeSubjectMutation.mutate(subject.subject._id)}
                        disabled={removeSubjectMutation.isPending}
                      >
                        <Cross2Icon /> Remove
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Add Subject Dialog */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Add Subject to Class</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Select a subject to add to this class
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Select.Root 
              value={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <Select.Trigger placeholder="Select a subject" />
              <Select.Content>
                {availableSubjects?.length === 0 ? (
                  <Select.Item value="none" disabled>No subjects available</Select.Item>
                ) : (
                  availableSubjects?.map(subject => (
                    <Select.Item key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button 
              onClick={() => addSubjectMutation.mutate()}
              disabled={!selectedSubject || addSubjectMutation.isPending}
            >
              {addSubjectMutation.isPending ? <LoadingSpinner /> : 'Add Subject'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default ClassSubjects; 