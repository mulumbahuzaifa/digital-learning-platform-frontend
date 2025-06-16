import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Button,
  Table,
  Badge,
  Flex,
  Text,
  Card,
  Heading,
  AlertDialog,
  Box,
  TextField,
  Select,
  Grid,
} from "@radix-ui/themes";
import { liveSessionService } from "../../../services/liveSessionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  Pencil2Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  VideoIcon,
  CalendarIcon,
  PlayIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { useLiveSessionMutation } from "../../../hooks/useLiveSessionMutation";
import { LiveSession, LiveSessionStatus } from "../../../types";
import { formatDate, formatTime } from "../../../utils/formatters";

const LiveSessionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<LiveSessionStatus | "all">("all");
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const {
    data: liveSessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: () => liveSessionService.getAllLiveSessions(),
  });

  const { deleteLiveSession, startLiveSession, endLiveSession } =
    useLiveSessionMutation();

  const filteredSessions = liveSessions?.filter(
    (session) =>
      (status === "all" || session.status === status) &&
      (session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const paginatedSessions = filteredSessions?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleStartSession = (id: string) => {
    startLiveSession.mutate(id);
  };

  const handleEndSession = (id: string) => {
    endLiveSession.mutate(id);
  };

  const handleDeleteSession = (id: string) => {
    deleteLiveSession.mutate(id);
    setSessionToDelete(null);
  };

  const getStatusBadge = (status: LiveSessionStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge color="blue">Scheduled</Badge>;
      case "live":
        return <Badge color="green">Live</Badge>;
      case "ended":
        return <Badge color="gray">Ended</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading live sessions</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">
            Live Session Management
          </Heading>
          <Button asChild>
            <Link to="/teacher/live-sessions/create">Create Live Session</Link>
          </Button>
        </Flex>

        {/* Session Counter Card */}
        <Grid columns="3" gap="4">
          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--accent-3)", borderRadius: "50%" }}
              >
                <CalendarIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Scheduled
                </Text>
                <Text size="5" weight="bold">
                  {liveSessions?.filter((s) => s.status === "scheduled")
                    .length || 0}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--accent-9)", borderRadius: "50%" }}
              >
                <VideoIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Live
                </Text>
                <Text size="5" weight="bold">
                  {liveSessions?.filter((s) => s.status === "live").length || 0}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="classic">
            <Flex align="center" gap="3">
              <Box
                p="2"
                style={{ background: "var(--gray-5)", borderRadius: "50%" }}
              >
                <StopIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Ended
                </Text>
                <Text size="5" weight="bold">
                  {liveSessions?.filter((s) => s.status === "ended").length ||
                    0}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid columns="2" gap="4">
          <TextField.Root
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          <Select.Root
            value={status}
            onValueChange={(value) =>
              setStatus(value as LiveSessionStatus | "all")
            }
          >
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Status</Select.Label>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="scheduled">Scheduled</Select.Item>
                <Select.Item value="live">Live</Select.Item>
                <Select.Item value="ended">Ended</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Grid>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Start Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedSessions?.map((session, index) => (
              <Table.Row key={session._id}>
                <Table.Cell>{(page - 1) * itemsPerPage + index + 1}</Table.Cell>
                <Table.RowHeaderCell>
                  <Flex align="center" gap="2">
                    <VideoIcon />
                    <Text>{session.title}</Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell>
                  {typeof session.class === "object"
                    ? session.class.name
                    : "Loading..."}
                </Table.Cell>
                <Table.Cell>
                  {typeof session.subject === "object"
                    ? session.subject.name
                    : "Loading..."}
                </Table.Cell>
                <Table.Cell>
                  {formatDate(session.startTime)}{" "}
                  {formatTime(session.startTime)}
                </Table.Cell>
                <Table.Cell>{session.duration} mins</Table.Cell>
                <Table.Cell>{getStatusBadge(session.status)}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button asChild size="1" variant="soft">
                      <Link to={`/teacher/live-sessions/${session._id}`}>
                        <Pencil2Icon /> View
                      </Link>
                    </Button>

                    {session.status === "scheduled" && (
                      <>
                        <Button asChild size="1" variant="soft">
                          <Link
                            to={`/teacher/live-sessions/${session._id}/edit`}
                          >
                            <Pencil2Icon /> Edit
                          </Link>
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="green"
                          onClick={() => handleStartSession(session._id)}
                          disabled={startLiveSession.isPending}
                        >
                          <PlayIcon /> Start
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => setSessionToDelete(session._id)}
                        >
                          <TrashIcon /> Delete
                        </Button>
                      </>
                    )}

                    {session.status === "live" && (
                      <>
                        <Button asChild size="1" variant="soft" color="blue">
                          <Link
                            to={`/teacher/live-sessions/${session._id}/join`}
                          >
                            <VideoIcon /> Join
                          </Link>
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => handleEndSession(session._id)}
                          disabled={endLiveSession.isPending}
                        >
                          <StopIcon /> End
                        </Button>
                      </>
                    )}

                    {session.status === "ended" && session.recordingUrl && (
                      <Button asChild size="1" variant="soft" color="blue">
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <VideoIcon /> Recording
                        </a>
                      </Button>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {(page - 1) * itemsPerPage + 1}-
            {Math.min(page * itemsPerPage, filteredSessions?.length || 0)} of{" "}
            {filteredSessions?.length} sessions
          </Text>
          <Flex gap="2">
            <Button
              variant="soft"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="soft"
              disabled={page * itemsPerPage >= (filteredSessions?.length || 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root
          open={!!sessionToDelete}
          onOpenChange={(open) => !open && setSessionToDelete(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure you want to delete this live session? This action
              cannot be undone.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant="solid"
                  color="red"
                  onClick={() =>
                    sessionToDelete && handleDeleteSession(sessionToDelete)
                  }
                  disabled={deleteLiveSession.isPending}
                >
                  {deleteLiveSession.isPending
                    ? "Deleting..."
                    : "Delete Session"}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Card>
  );
};

export default LiveSessionManagement;
