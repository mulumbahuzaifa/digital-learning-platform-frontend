import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading, Flex, Text, Button, TextField, Box, Link as RadixLink } from '@radix-ui/themes';
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { useState, ChangeEvent } from "react";

const SubmissionDetails = () => {
  const navigate = useNavigate();
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const [marks, setMarks] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

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

  const handleGrade = async () => {
    if (!marks || !feedback) return;

    await gradeSubmission.mutateAsync({
      submissionId: submissionId!,
      data: {
        marksAwarded: parseInt(marks),
        feedback,
      }
    });
    
    // Navigate back to the submissions list after grading
    navigate(`/admin/assignments/${id}/submissions`);
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const blob = await assignmentService.downloadSubmissionFile(submissionId!, fileId);
      
      // Create a temporary download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Submission Details</Heading>

        <Box>
          <Heading size="3">Assignment Information</Heading>
          <Text as="p" size="2" color="gray">Title: {assignment.title}</Text>
          <Text as="p" size="2" color="gray">Total Marks: {assignment.totalMarks}</Text>
          <Text as="p" size="2" color="gray">Due Date: {formatDate(assignment.dueDate)}</Text>
        </Box>

        <Box>
          <Heading size="3">Student Information</Heading>
          <Text as="p" size="2" color="gray">
            Name: {typeof submission.student === 'string' 
              ? submission.student 
              : `${submission.student.firstName} ${submission.student.lastName}`}
          </Text>
          <Text as="p" size="2" color="gray">Submitted At: {formatDate(submission.submittedAt)}</Text>
        </Box>

        <Box>
          <Heading size="3">Submission Content</Heading>
          {submission.textSubmission && (
            <Text as="p" size="2">{submission.textSubmission}</Text>
          )}
          
          {(!submission.textSubmission && submission.files.length === 0) && (
            <Text as="p" size="2" color="gray">No content provided</Text>
          )}
          
          {submission.files.length > 0 && (
            <Box mt="2">
              <Text as="p" size="2" weight="bold">Attached Files:</Text>
              {submission.files.map((file, index) => (
                <Text key={file._id} as="p" size="2">
                  <RadixLink 
                    onClick={() => handleDownloadFile(file._id, file.originalName)}
                    style={{ cursor: 'pointer' }}
                  >
                    {file.originalName} ({(file.size / 1024).toFixed(2)} KB)
                  </RadixLink>
                </Text>
              ))}
            </Box>
          )}
        </Box>

        {submission.status === 'submitted' && (
          <Box>
            <Heading size="3">Grade Submission</Heading>
            <Flex direction="column" gap="3">
              <TextField.Root>
                <TextField.Slot>
                  <input
                    type="number"
                    placeholder="Enter marks"
                    value={marks}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setMarks(e.target.value)}
                    min={0}
                    max={assignment.totalMarks}
                  />
                </TextField.Slot>
              </TextField.Root>

              <TextField.Root>
                <TextField.Slot>
                  <input
                    placeholder="Enter feedback"
                    value={feedback}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFeedback(e.target.value)}
                  />
                </TextField.Slot>
              </TextField.Root>

              <Button 
                onClick={handleGrade}
                disabled={!marks || !feedback || gradeSubmission.isPending}
              >
                {gradeSubmission.isPending ? 'Grading...' : 'Grade Submission'}
              </Button>
            </Flex>
          </Box>
        )}

        {submission.status === 'graded' && (
          <Box>
            <Heading size="3">Grading Information</Heading>
            <Text as="p" size="2">Marks: {submission.marksAwarded}/{assignment.totalMarks}</Text>
            <Text as="p" size="2">Feedback: {submission.feedback}</Text>
            
            {submission.rubrics && submission.rubrics.length > 0 && (
              <Box mt="2">
                <Text as="p" size="2" weight="bold">Grading Rubrics:</Text>
                {submission.rubrics.map((rubric, index) => (
                  <Box key={index} mt="1">
                    <Text as="p" size="2">
                      {rubric.criteria}: {rubric.marks} marks
                    </Text>
                    {rubric.comment && (
                      <Text as="p" size="2" color="gray">
                        Comment: {rubric.comment}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            
            <Text as="p" size="2" color="gray">
              Graded At: {submission.gradedAt ? formatDate(submission.gradedAt) : 'N/A'}
            </Text>
            <Text as="p" size="2" color="gray">
              Graded By: {submission.gradedBy 
                ? (typeof submission.gradedBy === 'string' 
                  ? submission.gradedBy 
                  : `${submission.gradedBy.firstName} ${submission.gradedBy.lastName}`)
                : 'N/A'}
            </Text>
          </Box>
        )}
      </Flex>
    </Card>
  );
};

export default SubmissionDetails; 