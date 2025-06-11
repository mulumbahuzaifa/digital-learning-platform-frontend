import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  Flex, 
  Heading, 
  Text, 
  Table, 
  Button, 
  Grid,
  Badge,
  Box,
  Progress
} from '@radix-ui/themes';
import { gradebookService } from "../../../services/gradebookService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Pencil2Icon, CaretLeftIcon } from "@radix-ui/react-icons";
import { useGradebookMutation } from "../../../hooks/useGradebookMutation";
import { useAuthActions } from "../../../hooks/useAuthActions";

// Grade Distribution Component
const GradeDistribution = ({ grade, totalMarks }: { grade?: string, totalMarks?: number }) => {
  if (!grade) return null;
  
  const getGradeColor = () => {
    switch(grade) {
      case 'A': return 'green';
      case 'B': return 'blue';
      case 'C': return 'yellow';
      case 'D': return 'orange';
      case 'F': return 'red';
      default: return 'gray';
    }
  };
  
  const getGradePercentage = () => {
    if (!totalMarks) return 0;
    // Assuming totalMarks is out of 100 for simplicity
    return Math.min(totalMarks, 100);
  };
  
  const getGradeDescription = () => {
    switch(grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Good';
      case 'C': return 'Satisfactory';
      case 'D': return 'Needs Improvement';
      case 'F': return 'Failing';
      default: return 'Not Graded';
    }
  };
  
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="3">Grade: {grade}</Heading>
          <Badge size="2" color={getGradeColor()}>{getGradeDescription()}</Badge>
        </Flex>
        
        <Flex direction="column" gap="1">
          <Progress value={getGradePercentage()} color={getGradeColor()} />
          <Text size="1" align="right">{totalMarks || 0} points</Text>
        </Flex>
      </Flex>
    </Card>
  );
};

const GradebookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthActions();
  const { publishGradebook } = useGradebookMutation();
  
  // Fetch gradebook data by ID
  const { data: gradebook, isLoading } = useQuery({
    queryKey: ["gradebook", id],
    queryFn: () => id ? gradebookService.getGradebookById(id) : null,
    enabled: !!id,
  });

  if (isLoading || !gradebook) {
    return <LoadingSpinner />;
  }

  // Check if the current teacher is authorized to view this gradebook
  const teacherId = currentUser.data?._id;
  const isAuthorized = 
    teacherId && 
    (typeof gradebook.teacher === 'string' 
      ? gradebook.teacher === teacherId
      : gradebook.teacher._id === teacherId);

  if (!isAuthorized) {
    // Redirect if not authorized
    navigate("/teacher/gradebook");
    return null;
  }

  // Helper function to get student name
  const getStudentName = () => {
    return typeof gradebook.student === 'string' 
      ? gradebook.student 
      : `${gradebook.student.firstName} ${gradebook.student.lastName}`;
  };

  // Helper function to get class name
  const getClassName = () => {
    return typeof gradebook.class === 'string' 
      ? gradebook.class
      : gradebook.class.name;
  };

  // Helper function to get subject name
  const getSubjectName = () => {
    return typeof gradebook.subject === 'string' 
      ? gradebook.subject
      : gradebook.subject.name;
  };

  // Calculate total marks from all components
  const calculateTotalMarks = () => {
    let total = 0;
    
    // Add assignment marks
    if (gradebook.assignments) {
      total += gradebook.assignments.reduce((sum, assignment) => sum + assignment.marks, 0);
    }
    
    // Add test marks
    if (gradebook.tests) {
      total += gradebook.tests.reduce((sum, test) => sum + test.marks, 0);
    }
    
    // Add exam marks
    if (gradebook.exams) {
      total += gradebook.exams.reduce((sum, exam) => sum + exam.marks, 0);
    }
    
    return total;
  };

  // Handle publish action
  const handlePublish = async () => {
    if (!id) return;
    await publishGradebook.mutateAsync(id);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Flex gap="2" align="center">
            <Button variant="soft" size="2" asChild>
              <Link to="/teacher/gradebook">
                <CaretLeftIcon />
                Back
              </Link>
            </Button>
            <Heading size="5">Gradebook Details</Heading>
          </Flex>
          
          <Flex gap="2">
            {!gradebook.isPublished && (
              <Button 
                color="green" 
                onClick={handlePublish}
                disabled={publishGradebook.isPending}
              >
                {publishGradebook.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            )}
            <Button asChild>
              <Link to={`/teacher/gradebook/${id}/edit`}>
                <Pencil2Icon />
                Edit
              </Link>
            </Button>
          </Flex>
        </Flex>

        {/* Status badge */}
        <Box>
          <Badge size="2" color={gradebook.isPublished ? 'green' : 'blue'}>
            {gradebook.isPublished ? 'Published' : 'Draft'}
          </Badge>
          {gradebook.isPublished && gradebook.publishedAt && (
            <Text size="1" ml="2" color="gray">
              Published on: {new Date(gradebook.publishedAt).toLocaleDateString()}
            </Text>
          )}
        </Box>

        {/* Grade Distribution */}
        <GradeDistribution 
          grade={gradebook.finalGrade} 
          totalMarks={gradebook.totalMarks || calculateTotalMarks()} 
        />

        {/* Basic information */}
        <Card>
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            <Box>
              <Text weight="bold">Student:</Text>
              <Text>{getStudentName()}</Text>
            </Box>
            <Box>
              <Text weight="bold">Class:</Text>
              <Text>{getClassName()}</Text>
            </Box>
            <Box>
              <Text weight="bold">Subject:</Text>
              <Text>{getSubjectName()}</Text>
            </Box>
            <Box>
              <Text weight="bold">Academic Year:</Text>
              <Text>{gradebook.academicYear}</Text>
            </Box>
            <Box>
              <Text weight="bold">Term:</Text>
              <Text>{gradebook.term}</Text>
            </Box>
            <Box>
              <Text weight="bold">Overall Grade:</Text>
              <Text>{gradebook.finalGrade || 'N/A'}</Text>
            </Box>
            <Box>
              <Text weight="bold">Total Marks:</Text>
              <Text>{gradebook.totalMarks || calculateTotalMarks()}</Text>
            </Box>
            <Box>
              <Text weight="bold">Position in Class:</Text>
              <Text>{gradebook.positionInClass || 'N/A'}</Text>
            </Box>
          </Grid>
        </Card>

        {/* Assignments */}
        {gradebook.assignments && gradebook.assignments.length > 0 && (
          <Card>
            <Heading size="3" mb="3">Assignments</Heading>
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
          </Card>
        )}

        {/* Tests */}
        {gradebook.tests && gradebook.tests.length > 0 && (
          <Card>
            <Heading size="3" mb="3">Tests</Heading>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Test</Table.ColumnHeaderCell>
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
                    <Table.Cell>
                      {typeof test.date === 'string' 
                        ? new Date(test.date).toLocaleDateString() 
                        : new Date(test.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{test.weight || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        )}

        {/* Exams */}
        {gradebook.exams && gradebook.exams.length > 0 && (
          <Card>
            <Heading size="3" mb="3">Exams</Heading>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Exam</Table.ColumnHeaderCell>
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
                    <Table.Cell>
                      {typeof exam.date === 'string' 
                        ? new Date(exam.date).toLocaleDateString() 
                        : new Date(exam.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{exam.weight || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        )}

        {/* Rubrics */}
        {gradebook.rubrics && gradebook.rubrics.length > 0 && (
          <Card>
            <Heading size="3" mb="3">Rubrics</Heading>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Criteria</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Comment</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {gradebook.rubrics.map((rubric, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{rubric.criteria}</Table.Cell>
                    <Table.Cell>{rubric.marks}</Table.Cell>
                    <Table.Cell>{rubric.comment || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        )}

        {/* Remarks */}
        {gradebook.remarks && (
          <Card>
            <Heading size="3" mb="2">Remarks</Heading>
            <Text>{gradebook.remarks}</Text>
          </Card>
        )}
      </Flex>
    </Card>
  );
};

export default GradebookDetail; 