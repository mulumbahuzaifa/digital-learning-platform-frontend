import { useState } from "react";
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
  TextArea,
} from "@radix-ui/themes";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link, useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Assignment } from "../../../types";
import { useSubmissionMutation } from "../../../hooks/useSubmissionMutation";

const StudentAssignmentSubmit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [textSubmission, setTextSubmission] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [studentComments, setStudentComments] = useState("");

  const { data: assignment, isLoading } = useQuery<Assignment>({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  const { createSubmission } = useSubmissionMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (!id) return;

    // Determine submission type based on content
    const submissionType =
      files.length > 0 ? (textSubmission.trim() ? "both" : "file") : "text";

    createSubmission.mutate(
      {
        assignment: id,
        textSubmission,
        submissionType,
        submissionMethod: "online",
        submissionNotes,
        studentComments,
        attachments: files,
      },
      {
        onSuccess: () => {
          navigate(`/student/assignments/${id}/my-submission`);
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
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
              Assignment Not Found
            </Heading>
            <Text color="gray" align="center">
              The assignment you're looking for doesn't exist or has been
              removed.
            </Text>
            <Button asChild>
              <Link to="/student/assignments">Back to Assignments</Link>
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
                <Heading size="5">{assignment.title}</Heading>
                <Flex gap="2" align="center" mt="1">
                  <Badge color="blue" variant="soft">
                    {assignment.subjectName}
                  </Badge>
                  <Text size="1" color="gray">
                    Due: {formatDate(assignment.dueDate)}
                  </Text>
                </Flex>
              </Box>
            </Flex>
            <Separator size="4" />
            <Box>
              <Heading size="3" mb="2">
                Your Submission
              </Heading>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Written Response
                  </Text>
                  <TextArea
                    placeholder="Type your response here..."
                    value={textSubmission}
                    onChange={(e) => setTextSubmission(e.target.value)}
                    style={{ minHeight: "200px" }}
                  />
                </Box>
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Attachments
                  </Text>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "block", marginBottom: "1rem" }}
                  />
                  {files.length > 0 && (
                    <Text size="1" color="gray">
                      {files.length} file(s) selected
                    </Text>
                  )}
                </Box>
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Submission Notes (Optional)
                  </Text>
                  <TextArea
                    placeholder="Add any notes about your submission..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    style={{ minHeight: "100px" }}
                  />
                </Box>
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Comments for Teacher (Optional)
                  </Text>
                  <TextArea
                    placeholder="Add any comments for your teacher..."
                    value={studentComments}
                    onChange={(e) => setStudentComments(e.target.value)}
                    style={{ minHeight: "100px" }}
                  />
                </Box>
                <Button
                  size="3"
                  onClick={handleSubmit}
                  disabled={createSubmission.isPending}
                >
                  {createSubmission.isPending
                    ? "Submitting..."
                    : "Submit Assignment"}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentAssignmentSubmit;
