import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Grid,
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
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Submission } from "../../../types";

const StudentSubmittedAssignments = () => {
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["submissions", "student"],
    queryFn: () => submissionService.getStudentSubmissions(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submissions?.length) {
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
              No Submissions
            </Heading>
            <Text color="gray" align="center">
              You haven't submitted any assignments yet.
            </Text>
            <Button asChild>
              <Link to="/student/assignments">View Assignments</Link>
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Heading size="5">Submitted Assignments</Heading>
          <Button variant="soft" color="blue" asChild>
            <Link to="/student/assignments">View All Assignments</Link>
          </Button>
        </Flex>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {submissions.map((submission) => (
            <Card key={submission._id} size="2">
              <Flex direction="column" gap="3">
                <Box>
                  <Text weight="bold">{submission.assignment.title}</Text>
                  <Flex gap="2" align="center" mt="1">
                    <Badge
                      color={
                        submission.marksAwarded !== undefined
                          ? submission.marksAwarded >= 70
                            ? "green"
                            : submission.marksAwarded >= 50
                            ? "orange"
                            : "red"
                          : "blue"
                      }
                      variant="soft"
                    >
                      {submission.marksAwarded !== undefined
                        ? `Grade: ${submission.marksAwarded}%`
                        : submission.status}
                    </Badge>
                    <Text size="1" color="gray">
                      {formatDate(submission.submitDate)}
                    </Text>
                  </Flex>
                </Box>
                <Separator size="2" />
                <Text size="1" color="gray" truncate>
                  {submission.textSubmission}
                </Text>
                <Button asChild size="2">
                  <Link
                    to={`/student/assignments/${submission.assignment._id}/my-submission`}
                  >
                    View Details
                  </Link>
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export default StudentSubmittedAssignments;
