import { useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  Heading, 
  Flex, 
  Text, 
  Button, 
  TextField, 
  Box, 
  Link as RadixLink,
  Grid,
  Separator,
  TextArea,
  Badge,
  Table
} from '@radix-ui/themes';
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { 
  DownloadIcon, 
  CheckCircledIcon, 
  ClockIcon 
} from '@radix-ui/react-icons';
import { toast } from "react-hot-toast";

const SubmissionDetails = () => {
  const navigate = useNavigate();
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const [marks, setMarks] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  
  // Custom rubric state
  const [rubrics, setRubrics] = useState<Array<{ criteria: string; marks: number; comment?: string }>>([
    { criteria: "Understanding", marks: 0, comment: "" },
    { criteria: "Execution", marks: 0, comment: "" },
    { criteria: "Presentation", marks: 0, comment: "" }
  ]);

  // Fetch assignment details
  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  // Fetch submission details
  const { data: submission, isLoading: isLoadingSubmission } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => assignmentService.getSubmissionById(submissionId!),
    enabled: !!submissionId,
  });

  const { gradeSubmission } = useAssignmentMutation();

  if (isLoadingAssignment || isLoadingSubmission) return <LoadingSpinner />;

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  if (!submission) {
    return <div>Submission not found</div>;
  }

  // Update rubric criteria value
  const handleRubricChange = (index: number, field: 'criteria' | 'marks' | 'comment', value: string | number) => {
    const updatedRubrics = [...rubrics];
    updatedRubrics[index] = { 
      ...updatedRubrics[index], 
      [field]: field === 'marks' ? Number(value) : value 
    };
    setRubrics(updatedRubrics);
    
    // Recalculate total marks
    const calculatedTotal = updatedRubrics.reduce((sum, rubric) => sum + rubric.marks, 0);
    setMarks(calculatedTotal.toString());
  };

  // Add new rubric criteria
  const addRubric = () => {
    setRubrics([...rubrics, { criteria: "", marks: 0, comment: "" }]);
  };

  // Remove rubric criteria
  const removeRubric = (index: number) => {
    const updatedRubrics = rubrics.filter((_, i) => i !== index);
    setRubrics(updatedRubrics);
    
    // Recalculate total marks
    const calculatedTotal = updatedRubrics.reduce((sum, rubric) => sum + rubric.marks, 0);
    setMarks(calculatedTotal.toString());
  };

  // Handle submission grading
  const handleGrade = async () => {
    if (!marks || !feedback) {
      toast.error("Please provide both marks and feedback");
      return;
    }

    // Check if marks exceed the assignment total
    if (parseInt(marks) > assignment.totalMarks) {
      toast.error(`Marks cannot exceed the assignment total of ${assignment.totalMarks}`);
      return;
    }

    try {
      await gradeSubmission.mutateAsync({
        submissionId: submissionId!,
        data: {
          marksAwarded: parseInt(marks),
          feedback,
          rubrics: rubrics.filter(r => r.criteria.trim() !== ""), // Only include filled rubrics
        }
      });
      
      // Navigate back to the submissions list after grading
      navigate(`/teacher/assignments/submissions/${id}`);
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  // Handle file download
  const handleDownload = async (fileId: string) => {
    try {
      const blob = await assignmentService.downloadSubmissionFile(submissionId!, fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submission-file-${fileId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Box>
            <Heading size="4">Submission Details</Heading>
            <Text color="gray" size="2">For assignment: {assignment.title}</Text>
          </Box>
          <Button variant="outline" onClick={() => navigate(`/teacher/assignments/submissions/${id}`)}>
            Back to Submissions
          </Button>
        </Flex>

        <Separator size="4" />

        {/* Assignment & Student Info */}
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Card variant="surface">
            <Flex direction="column" gap="2">
              <Heading size="3">Assignment Details</Heading>
              <Text as="p" size="2"><strong>Title:</strong> {assignment.title}</Text>
              <Text as="p" size="2"><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</Text>
              <Text as="p" size="2"><strong>Status:</strong> {assignment.status}</Text>
              <Text as="p" size="2"><strong>Total Marks:</strong> {assignment.totalMarks}</Text>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="2">
              <Heading size="3">Student Information</Heading>
              <Text as="p" size="2"><strong>Name:</strong> {submission.studentName}</Text>
              <Text as="p" size="2"><strong>Class:</strong> {submission.className}</Text>
              <Text as="p" size="2">
                <strong>Submission Status:</strong> 
                <Badge 
                  color={submission.status === 'submitted' ? 'blue' : 
                         submission.status === 'graded' ? 'green' : 'gray'}
                  ml="1"
                >
                  {submission.status}
                </Badge>
              </Text>
              <Text as="p" size="2"><strong>Submitted at:</strong> {formatDate(submission.submittedAt)}</Text>
            </Flex>
          </Card>
        </Grid>

        {/* Submission Content */}
        <Card variant="surface">
          <Flex direction="column" gap="3">
            <Heading size="3">Submission Content</Heading>
            
            {submission.content ? (
              <Box style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--gray-2)', padding: '16px', borderRadius: '8px' }}>
                {submission.content}
              </Box>
            ) : (
              <Text color="gray">No text content provided</Text>
            )}

            {/* Files/Attachments */}
            {submission.attachments && submission.attachments.length > 0 ? (
              <Box>
                <Text weight="bold" size="2" mb="2">Attachments:</Text>
                <Flex direction="column" gap="2">
                  {submission.attachments.map((file, index) => (
                    <Button 
                      key={index} 
                      variant="soft" 
                      onClick={() => handleDownload(typeof file === 'string' ? file : file._id)}
                      size="2"
                    >
                      <DownloadIcon />
                      {typeof file === 'string' 
                        ? `File ${index + 1}` 
                        : file.originalName || `File ${index + 1}`}
                    </Button>
                  ))}
                </Flex>
              </Box>
            ) : (
              <Text color="gray">No attachments</Text>
            )}
          </Flex>
        </Card>

        {/* Grading Section */}
        {submission.status === 'submitted' ? (
          <Card variant="surface">
            <Flex direction="column" gap="4">
              <Heading size="3">Grade Submission</Heading>
              
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">Total Marks (out of {assignment.totalMarks})</Text>
                <TextField.Root 
                  placeholder={`Enter marks (max: ${assignment.totalMarks})`}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  type="number"
                  min="0"
                  max={assignment.totalMarks}
                />
              </Flex>

              {/* Rubric Grading */}
              <Box>
                <Flex justify="between" align="center" mb="2">
                  <Text as="label" size="2" weight="bold">Grading Rubric</Text>
                  <Button size="1" variant="soft" onClick={addRubric}>+ Add Criteria</Button>
                </Flex>
                
                {rubrics.map((rubric, index) => (
                  <Flex key={index} gap="3" mb="3" align="start">
                    <TextField.Root 
                      placeholder="Criteria"
                      value={rubric.criteria}
                      onChange={(e) => handleRubricChange(index, 'criteria', e.target.value)}
                      size="1"
                      style={{ flex: 2 }}
                    />
                    <TextField.Root 
                      placeholder="Marks"
                      value={rubric.marks}
                      onChange={(e) => handleRubricChange(index, 'marks', e.target.value)}
                      type="number"
                      size="1"
                      style={{ flex: 1 }}
                    />
                    <TextField.Root 
                      placeholder="Comment"
                      value={rubric.comment}
                      onChange={(e) => handleRubricChange(index, 'comment', e.target.value)}
                      size="1"
                      style={{ flex: 3 }}
                    />
                    <Button 
                      size="1" 
                      variant="soft" 
                      color="red" 
                      onClick={() => removeRubric(index)}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))}
              </Box>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">Feedback</Text>
                <TextArea 
                  placeholder="Provide detailed feedback for the student"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{ minHeight: '120px' }}
                />
              </Flex>

              <Button 
                onClick={handleGrade}
                disabled={!marks || !feedback || gradeSubmission.isPending}
              >
                {gradeSubmission.isPending ? 'Submitting Grade...' : 'Submit Grade'}
              </Button>
            </Flex>
          </Card>
        ) : (
          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Heading size="3" mb="2">Grading Information</Heading>
              
              <Box>
                <Flex align="center" gap="2">
                  <CheckCircledIcon color="green" />
                  <Text size="3" weight="bold">
                    Marks: {submission.grade}/{assignment.totalMarks}
                  </Text>
                </Flex>
              </Box>
              
              <Box>
                <Text weight="bold" size="2">Feedback:</Text>
                <Box style={{ 
                  whiteSpace: 'pre-wrap', 
                  backgroundColor: 'var(--gray-2)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginTop: '4px'
                }}>
                  {submission.feedback}
                </Box>
              </Box>
              
              {/* Display rubric if available */}
              {submission.rubrics && submission.rubrics.length > 0 && (
                <Box>
                  <Text weight="bold" size="2" mb="2">Grading Rubric:</Text>
                  <Card variant="classic">
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Criteria</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Comment</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {submission.rubrics.map((rubric, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>{rubric.criteria}</Table.Cell>
                            <Table.Cell>{rubric.marks}</Table.Cell>
                            <Table.Cell>{rubric.comment || '-'}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Card>
                </Box>
              )}
              
              <Box>
                <Flex align="center" gap="2">
                  <ClockIcon />
                  <Text as="p" size="2" color="gray">
                    Graded At: {submission.gradedAt ? formatDate(submission.gradedAt) : 'N/A'}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Card>
        )}
      </Flex>
    </Card>
  );
};

export default SubmissionDetails; 