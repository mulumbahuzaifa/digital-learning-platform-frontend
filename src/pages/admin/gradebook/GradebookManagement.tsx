import { useState, ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Table, 
  Text,
  Button, 
  Badge,
  Select,
  TextField,
  Dialog
} from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { gradebookService } from '../../../services/gradebookService';
import { classService } from '../../../services/classService';
import { subjectService } from '../../../services/subjectService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, Pencil2Icon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';

const GradebookManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [gradebookToDelete, setGradebookToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { deleteGradebook } = useGradebookMutation();

  // Fetch gradebooks
  const { data: gradebooks, isLoading: isLoadingGradebooks } = useQuery({
    queryKey: ['gradebooks'],
    queryFn: () => gradebookService.getAllGradebooks(),
  });

  // Fetch classes for filter
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch subjects for filter
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAllSubjects(),
  });

  if (isLoadingGradebooks || isLoadingClasses || isLoadingSubjects) {
    return <LoadingSpinner />;
  }

  // Filter gradebooks based on search and filters
  const filteredGradebooks = gradebooks?.filter(gradebook => {
    let matchesSearch = true;
    let matchesClass = true;
    let matchesSubject = true;
    let matchesTerm = true;
    let matchesPublished = true;

    // Search term filtering
    if (searchTerm) {
      const studentName = typeof gradebook.student === 'string' 
        ? gradebook.student 
        : `${gradebook.student.firstName} ${gradebook.student.lastName}`;
      
      matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    }

    // Class filtering
    if (classFilter && classFilter !== 'all') {
      matchesClass = typeof gradebook.class === 'string' 
        ? gradebook.class === classFilter
        : gradebook.class._id === classFilter;
    }

    // Subject filtering
    if (subjectFilter && subjectFilter !== 'all') {
      matchesSubject = typeof gradebook.subject === 'string' 
        ? gradebook.subject === subjectFilter
        : gradebook.subject._id === subjectFilter;
    }

    // Term filtering
    if (termFilter && termFilter !== 'all') {
      matchesTerm = gradebook.term === termFilter;
    }

    // Published filtering
    if (publishedFilter !== 'all') {
      matchesPublished = gradebook.isPublished === (publishedFilter === 'published');
    }

    return matchesSearch && matchesClass && matchesSubject && matchesTerm && matchesPublished;
  }) || [];

  // Paginate filtered gradebooks
  const paginatedGradebooks = filteredGradebooks.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleDeleteGradebook = async () => {
    if (gradebookToDelete) {
      await deleteGradebook.mutateAsync(gradebookToDelete);
      setGradebookToDelete(null);
    }
  };

  const getStudentName = (gradebook: any) => {
    return typeof gradebook.student === 'string' 
      ? gradebook.student 
      : `${gradebook.student.firstName} ${gradebook.student.lastName}`;
  };

  const getClassName = (gradebook: any) => {
    return typeof gradebook.class === 'string' 
      ? classes?.find(c => c._id === gradebook.class)?.name || gradebook.class
      : gradebook.class.name;
  };

  const getSubjectName = (gradebook: any) => {
    return typeof gradebook.subject === 'string' 
      ? subjects?.find(s => s._id === gradebook.subject)?.name || gradebook.subject
      : gradebook.subject.name;
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Gradebook Management</Heading>
          <Button asChild>
            <Link to="/admin/gradebook/create">Create New Gradebook Entry</Link>
          </Button>
        </Flex>

        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" wrap="wrap" gap="3">
            <Box style={{ minWidth: '250px', flexGrow: 1 }}>
              <TextField.Root>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
                <TextField.Slot>
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            
            <Flex gap="3" wrap="wrap">
              <Select.Root 
                value={classFilter} 
                onValueChange={setClassFilter}
              >
                <Select.Trigger placeholder="Filter by class" />
                <Select.Content>
                  <Select.Item value="all">All Classes</Select.Item>
                  {classes?.map(c => (
                    <Select.Item key={c._id} value={c._id}>
                      {c.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Select.Root 
                value={subjectFilter} 
                onValueChange={setSubjectFilter}
              >
                <Select.Trigger placeholder="Filter by subject" />
                <Select.Content>
                  <Select.Item value="all">All Subjects</Select.Item>
                  {subjects?.map(s => (
                    <Select.Item key={s._id} value={s._id}>
                      {s.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Select.Root 
                value={termFilter} 
                onValueChange={setTermFilter}
              >
                <Select.Trigger placeholder="Filter by term" />
                <Select.Content>
                  <Select.Item value="all">All Terms</Select.Item>
                  <Select.Item value="Term 1">Term 1</Select.Item>
                  <Select.Item value="Term 2">Term 2</Select.Item>
                  <Select.Item value="Term 3">Term 3</Select.Item>
                </Select.Content>
              </Select.Root>

              <Select.Root 
                value={publishedFilter} 
                onValueChange={setPublishedFilter}
              >
                <Select.Trigger placeholder="Filter by status" />
                <Select.Content>
                  <Select.Item value="all">All Status</Select.Item>
                  <Select.Item value="published">Published</Select.Item>
                  <Select.Item value="draft">Draft</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Term</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Total Marks</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {paginatedGradebooks.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={8}>
                    <Text align="center" color="gray">No gradebook entries found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                paginatedGradebooks.map((gradebook) => (
                  <Table.Row key={gradebook._id}>
                    <Table.Cell>{getStudentName(gradebook)}</Table.Cell>
                    <Table.Cell>{getClassName(gradebook)}</Table.Cell>
                    <Table.Cell>{getSubjectName(gradebook)}</Table.Cell>
                    <Table.Cell>{gradebook.term}</Table.Cell>
                    <Table.Cell>
                      <Badge color={gradebook.isPublished ? 'green' : 'blue'}>
                        {gradebook.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{gradebook.totalMarks || 'N/A'}</Table.Cell>
                    <Table.Cell>{gradebook.finalGrade || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button asChild size="1" variant="soft">
                          <Link to={`/admin/gradebook/${gradebook._id}`}>
                            <EyeOpenIcon />
                          </Link>
                        </Button>
                        <Button asChild size="1" variant="soft">
                          <Link to={`/admin/gradebook/${gradebook._id}/edit`}>
                            <Pencil2Icon />
                          </Link>
                        </Button>
                        <Button 
                          size="1" 
                          variant="soft" 
                          color="red"
                          onClick={() => setGradebookToDelete(gradebook._id)}
                        >
                          <TrashIcon />
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

          {filteredGradebooks.length > 0 && (
            <Flex justify="between" align="center" mt="4">
              <Text color="gray">
                Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredGradebooks.length)} of {filteredGradebooks.length} entries
              </Text>
              <Flex gap="2">
                <Button 
                  variant="soft" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="soft" 
                  disabled={(page * itemsPerPage) >= filteredGradebooks.length}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!gradebookToDelete}
        onOpenChange={() => setGradebookToDelete(null)}
      >
        <Dialog.Trigger>
          <Button color="red" variant="soft" onClick={() => setGradebookToDelete(gradebookToDelete)}>
            <TrashIcon />
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete Gradebook Entry</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete this gradebook entry? This action cannot be undone.
          </Dialog.Description>
          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red" variant="soft" onClick={handleDeleteGradebook}>
                Delete
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default GradebookManagement; 