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
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Assignment } from "../../../types";

const StudentAssignments = () => {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["student-assignments"],
    queryFn: () => assignmentService.getStudentAssignments(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!assignments?.length) {
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
              No Assignments
            </Heading>
            <Text color="gray" align="center">
              You don't have any assignments at the moment.
            </Text>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Heading size="5">My Assignments</Heading>
          <Button variant="soft" color="blue" asChild>
            <Link to="/student/assignments/submitted">View Submitted</Link>
          </Button>
        </Flex>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {assignments.map((assignment) => (
            <Card key={assignment._id} size="2">
              <Flex direction="column" gap="3">
                <Box>
                  <Text weight="bold">{assignment.title}</Text>
                  <Flex gap="2" align="center" mt="1">
                    <Badge color="blue" variant="soft">
                      {assignment.subjectName || "No Subject"}
                    </Badge>
                    <Text size="1" color="gray">
                      Due: {formatDate(assignment.dueDate)}
                    </Text>
                  </Flex>
                </Box>
                <Separator size="2" />
                <Text size="1" color="gray" truncate>
                  {assignment.description}
                </Text>
                <Flex gap="2">
                  <Button asChild size="2" variant="soft">
                    <Link to={`/student/assignments/${assignment._id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild size="2">
                    <Link to={`/student/assignments/${assignment._id}/submit`}>
                      Submit
                    </Link>
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export default StudentAssignments;
