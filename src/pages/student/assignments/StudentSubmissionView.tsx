import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Badge,
  Separator,
} from "@radix-ui/themes";
import { submissionService } from "../../../services/submissionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Submission } from "../../../types";

const StudentSubmissionView = () => {
  const { id: assignmentId } = useParams<{ id: string }>();

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["submissions", "student"],
    queryFn: () => submissionService.getStudentSubmissions(),
    enabled: !!assignmentId,
  });

  // Find the specific submission for this assignment
  const submission = submissions?.find(
    (sub) => sub.assignment._id === assignmentId
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submission) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            p="6"
          >
            <Heading size="5" align="center">
              Submission Not Found
            </Heading>
            <Text color="gray" align="center">
              You haven't submitted this assignment yet.
            </Text>
            <Button asChild>
              <Link to={`/student/assignments/${assignmentId}/submit`}>
                Submit Assignment
              </Link>
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">{submission.assignment.title}</Heading>
                <Flex gap="2" align="center" mt="1">
                  <Badge color="blue" variant="soft">
                    {submission.assignment.subjectName}
                  </Badge>
                  <Text size="1" color="gray">
                    Submitted: {formatDate(submission.submitDate)}
                  </Text>
                </Flex>
              </Box>
            </Flex>
            <Separator size="4" />
            <Box>
              <Heading size="3" mb="2">
                Your Submission
              </Heading>
              {submission.textSubmission && (
                <Box mb="4">
                  <Text>{submission.textSubmission}</Text>
                </Box>
              )}
              {submission.files && submission.files.length > 0 && (
                <Box>
                  <Text weight="bold" mb="2">
                    Attachments
                  </Text>
                  <Flex direction="column" gap="2">
                    {submission.files.map((file) => (
                      <Button
                        key={file.filename}
                        variant="soft"
                        onClick={() =>
                          submissionService.downloadSubmissionFile(
                            submission._id,
                            file.filename
                          )
                        }
                      >
                        {file.originalname}
                      </Button>
                    ))}
                  </Flex>
                </Box>
              )}
            </Box>
            {submission.marksAwarded !== undefined && (
              <>
                <Separator size="4" />
                <Box>
                  <Heading size="3" mb="2">
                    Feedback
                  </Heading>
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text weight="bold">Grade</Text>
                      <Badge
                        color={
                          submission.marksAwarded >= 70
                            ? "green"
                            : submission.marksAwarded >= 50
                            ? "orange"
                            : "red"
                        }
                        variant="soft"
                      >
                        {submission.marksAwarded}%
                      </Badge>
                    </Box>
                    {submission.feedback && (
                      <Box>
                        <Text weight="bold">Comments</Text>
                        <Text>{submission.feedback}</Text>
                      </Box>
                    )}
                    {submission.teacherComments && (
                      <Box>
                        <Text weight="bold">Teacher Comments</Text>
                        <Text>{submission.teacherComments}</Text>
                      </Box>
                    )}
                    {submission.parentFeedback && (
                      <Box>
                        <Text weight="bold">Parent Feedback</Text>
                        <Text>{submission.parentFeedback}</Text>
                        <Text size="1" color="gray">
                          {formatDate(submission.parentFeedbackDate!)}
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentSubmissionView;
