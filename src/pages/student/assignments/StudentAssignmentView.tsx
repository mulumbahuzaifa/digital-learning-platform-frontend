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
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Link, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Assignment } from "../../../types";

const StudentAssignmentView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: assignment, isLoading } = useQuery<Assignment>({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

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
                    {assignment.subjectName || "No Subject"}
                  </Badge>
                  <Text size="1" color="gray">
                    Due: {formatDate(assignment.dueDate)}
                  </Text>
                </Flex>
              </Box>
              <Button asChild>
                <Link to={`/student/assignments/${id}/submit`}>
                  Submit Work
                </Link>
              </Button>
            </Flex>
            <Separator size="4" />
            <Box>
              <Heading size="3" mb="2">
                Description
              </Heading>
              <Text>{assignment.description}</Text>
            </Box>
            {assignment.instructions && (
              <Box>
                <Heading size="3" mb="2">
                  Instructions
                </Heading>
                <Text>{assignment.instructions}</Text>
              </Box>
            )}
            <Box>
              <Heading size="3" mb="2">
                Details
              </Heading>
              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <CalendarIcon width={16} height={16} />
                  <Text>Total Marks: {assignment.totalMarks}</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CalendarIcon width={16} height={16} />
                  <Text>
                    Late Submissions:{" "}
                    {assignment.allowLateSubmissions
                      ? "Allowed"
                      : "Not Allowed"}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentAssignmentView;
