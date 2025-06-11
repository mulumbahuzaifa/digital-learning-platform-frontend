import { useState } from "react";
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
  Select,
  TextField,
} from "@radix-ui/themes";
import { submissionService } from "../../../services/submissionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Submission } from "../../../types";

const StudentSubmissions = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["submissions", "student"],
    queryFn: () => submissionService.getStudentSubmissions(),
  });

  // Filter submissions based on status and search query
  const filteredSubmissions = submissions?.filter((submission) => {
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      submission.assignment.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.assignment.subjectName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
          <Heading size="5">My Submissions</Heading>
          <Button variant="soft" color="blue" asChild>
            <Link to="/student/assignments">View All Assignments</Link>
          </Button>
        </Flex>

        <Card size="2">
          <Flex gap="4" p="4">
            <Box style={{ flex: 1 }}>
              <TextField.Root>
                <TextField.Slot>
                  <input
                    type="text"
                    placeholder="Search by assignment or subject..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "none",
                      outline: "none",
                    }}
                  />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="submitted">Submitted</Select.Item>
                <Select.Item value="graded">Graded</Select.Item>
                <Select.Item value="resubmitted">Resubmitted</Select.Item>
                <Select.Item value="overdue">Overdue</Select.Item>
                <Select.Item value="returned">Returned</Select.Item>
                <Select.Item value="approved">Approved</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Card>

        {!filteredSubmissions?.length ? (
          <Card size="3">
            <Flex
              direction="column"
              gap="4"
              align="center"
              justify="center"
              p="6"
            >
              <Heading size="5" align="center">
                No Matching Submissions
              </Heading>
              <Text color="gray" align="center">
                Try adjusting your filters or search query.
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {filteredSubmissions.map((submission) => (
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
                  <Flex gap="2">
                    <Button asChild size="2" variant="soft">
                      <Link
                        to={`/student/assignments/${submission.assignment._id}`}
                      >
                        View Assignment
                      </Link>
                    </Button>
                    <Button asChild size="2">
                      <Link
                        to={`/student/assignments/${submission.assignment._id}/my-submission`}
                      >
                        View Submission
                      </Link>
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}
      </Flex>
    </Box>
  );
};

export default StudentSubmissions;
