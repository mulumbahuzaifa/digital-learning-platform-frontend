import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  Heading, 
  Flex, 
  Text, 
  Table, 
  Box, 
  Button, 
  Badge,
  Grid, 
  Separator 
} from '@radix-ui/themes';
import { gradebookService } from '../../../services/gradebookService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { formatDate } from '../../../utils/formatters';

const GradebookView = () => {
  const { id } = useParams<{ id: string }>();
  const { publishGradebook } = useGradebookMutation();

  // Fetch gradebook details
  const { data: gradebook, isLoading } = useQuery({
    queryKey: ['gradebook', id],
    queryFn: () => (id ? gradebookService.getGradebookById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  if (isLoading || !gradebook) {
    return <LoadingSpinner />;
  }

  const handlePublish = async () => {
    if (id) {
      await publishGradebook.mutateAsync(id);
    }
  };

  const getStudentName = () => {
    return typeof gradebook.student === 'string' 
      ? gradebook.student 
      : `${gradebook.student.firstName} ${gradebook.student.lastName}`;
  };

  const getClassName = () => {
    return typeof gradebook.class === 'string' 
      ? gradebook.class
      : gradebook.class.name;
  };

  const getSubjectName = () => {
    return typeof gradebook.subject === 'string' 
      ? gradebook.subject
      : gradebook.subject.name;
  };

  const getTeacherName = () => {
    return typeof gradebook.teacher === 'string' 
      ? gradebook.teacher
      : `${gradebook.teacher.firstName} ${gradebook.teacher.lastName}`;
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Gradebook Details</Heading>
          <Flex gap="3">
            <Button asChild>
              <Link to={`/admin/gradebook/${id}/edit`}>
                <Pencil2Icon /> Edit
              </Link>
            </Button>
            {!gradebook.isPublished && (
              <Button 
                color="green" 
                onClick={handlePublish}
                disabled={publishGradebook.isPending}
              >
                {publishGradebook.isPending ? 'Publishing...' : 'Publish Gradebook'}
              </Button>
            )}
          </Flex>
        </Flex>

        <Grid columns="2" gap="4">
          <Box>
            <Text size="2" weight="bold">Student:</Text>
            <Text size="3">{getStudentName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Class:</Text>
            <Text size="3">{getClassName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Subject:</Text>
            <Text size="3">{getSubjectName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Teacher:</Text>
            <Text size="3">{getTeacherName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Academic Year:</Text>
            <Text size="3">{gradebook.academicYear}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Term:</Text>
            <Text size="3">{gradebook.term}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Status:</Text>
            <Badge color={gradebook.isPublished ? 'green' : 'blue'}>
              {gradebook.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </Box>
          {gradebook.isPublished && gradebook.publishedAt && (
            <Box>
              <Text size="2" weight="bold">Published On:</Text>
              <Text size="3">{formatDate(gradebook.publishedAt as string)}</Text>
            </Box>
          )}
        </Grid>

        <Separator size="4" />

        {/* Assignments Section */}
        <Box>
          <Heading size="3" mb="3">Assignments</Heading>
          {gradebook.assignments && gradebook.assignments.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Feedback</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {gradebook.assignments.map((assignment, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>
                      {typeof assignment.assignment === 'string' 
                        ? assignment.assignment 
                        : assignment.assignment.title}
                    </Table.Cell>
                    <Table.Cell>{assignment.marks}</Table.Cell>
                    <Table.Cell>{assignment.weight || 'N/A'}</Table.Cell>
                    <Table.Cell>{assignment.feedback || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text size="2" color="gray">No assignments added</Text>
          )}
        </Box>

        {/* Tests Section */}
        <Box>
          <Heading size="3" mb="3">Tests</Heading>
          {gradebook.tests && gradebook.tests.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {gradebook.tests.map((test, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{test.name}</Table.Cell>
                    <Table.Cell>{test.marks}</Table.Cell>
                    <Table.Cell>{formatDate(test.date as string)}</Table.Cell>
                    <Table.Cell>{test.weight || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text size="2" color="gray">No tests added</Text>
          )}
        </Box>

        {/* Exams Section */}
        <Box>
          <Heading size="3" mb="3">Exams</Heading>
          {gradebook.exams && gradebook.exams.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {gradebook.exams.map((exam, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{exam.name}</Table.Cell>
                    <Table.Cell>{exam.marks}</Table.Cell>
                    <Table.Cell>{formatDate(exam.date as string)}</Table.Cell>
                    <Table.Cell>{exam.weight || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text size="2" color="gray">No exams added</Text>
          )}
        </Box>

        {/* Overall Results */}
        <Box>
          <Heading size="3" mb="3">Overall Results</Heading>
          <Grid columns="2" gap="4">
            <Box>
              <Text size="2" weight="bold">Total Marks:</Text>
              <Text size="3">{gradebook.totalMarks || 'Not calculated'}</Text>
            </Box>
            <Box>
              <Text size="2" weight="bold">Final Grade:</Text>
              <Text size="3">{gradebook.finalGrade || 'Not calculated'}</Text>
            </Box>
            <Box>
              <Text size="2" weight="bold">Position in Class:</Text>
              <Text size="3">{gradebook.positionInClass || 'Not calculated'}</Text>
            </Box>
          </Grid>
        </Box>

        {/* Remarks */}
        {gradebook.remarks && (
          <Box>
            <Heading size="3" mb="2">Remarks</Heading>
            <Card variant="surface">
              <Text>{gradebook.remarks}</Text>
            </Card>
          </Box>
        )}
      </Flex>
    </Card>
  );
};

export default GradebookView; 