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
  Box,
  TextField,
  Select,
  Grid,
  Tabs,
} from "@radix-ui/themes";
import { liveSessionService } from "../../../services/liveSessionService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  VideoIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  EnterIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { useLiveSessionMutation } from "../../../hooks/useLiveSessionMutation";
import { LiveSession, LiveSessionStatus } from "../../../types";
import { formatDate, formatTime } from "../../../utils/formatters";
import { useAuth } from "../../../context/AuthProvider";

const StudentLiveSessions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<LiveSessionStatus | "all">("all");
  const { user } = useAuth();

  const {
    data: liveSessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-live-sessions"],
    queryFn: () => liveSessionService.getAllLiveSessions(),
    refetchInterval: 30000, // Refetch every 30 seconds to check for new sessions
  });

  const { joinLiveSession, leaveLiveSession } = useLiveSessionMutation();

  const filteredSessions = liveSessions?.filter(
    (session) =>
      (status === "all" || session.status === status) &&
      (session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const scheduledSessions = filteredSessions?.filter(
    (session) => session.status === "scheduled"
  );

  const liveSessions_ = filteredSessions?.filter(
    (session) => session.status === "live"
  );

  const pastSessions = filteredSessions?.filter(
    (session) => session.status === "ended"
  );

  const handleJoinSession = (id: string) => {
    joinLiveSession.mutate(id);
  };

  const handleLeaveSession = (id: string) => {
    leaveLiveSession.mutate(id);
  };

  const isParticipant = (session: LiveSession) => {
    return session.participants.some(
      (p) => typeof p.user === "object" && p.user._id === user?._id
    );
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

  const renderSessionCard = (session: LiveSession) => (
    <Card key={session._id}>
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <VideoIcon />
          <Heading size="3">{session.title}</Heading>
          {getStatusBadge(session.status)}
        </Flex>

        {session.description && (
          <Text color="gray" size="2">
            {session.description}
          </Text>
        )}

        <Flex gap="4">
          <Flex align="center" gap="1">
            <CalendarIcon />
            <Text size="2">
              {formatDate(session.startTime)} {formatTime(session.startTime)}
            </Text>
          </Flex>
          <Flex align="center" gap="1">
            <ClockIcon />
            <Text size="2">{session.duration} mins</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="bold">
            Class:
          </Text>
          <Text size="2">
            {typeof session.class === "object"
              ? session.class.name
              : "Loading..."}
          </Text>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="bold">
            Subject:
          </Text>
          <Text size="2">
            {typeof session.subject === "object"
              ? session.subject.name
              : "Loading..."}
          </Text>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="bold">
            Teacher:
          </Text>
          <Text size="2">
            {typeof session.teacher === "object"
              ? `${session.teacher.firstName} ${session.teacher.lastName}`
              : "Loading..."}
          </Text>
        </Flex>

        <Flex justify="end" gap="2">
          <Button asChild size="2" variant="soft">
            <Link to={`/student/live-sessions/${session._id}`}>Details</Link>
          </Button>

          {session.status === "live" && !isParticipant(session) && (
            <Button
              size="2"
              color="blue"
              onClick={() => handleJoinSession(session._id)}
              disabled={joinLiveSession.isPending}
            >
              <EnterIcon /> Join
            </Button>
          )}

          {session.status === "live" && isParticipant(session) && (
            <Button
              size="2"
              color="red"
              variant="soft"
              onClick={() => handleLeaveSession(session._id)}
              disabled={leaveLiveSession.isPending}
            >
              <ExitIcon /> Leave
            </Button>
          )}

          {session.status === "ended" && session.recordingUrl && (
            <Button asChild size="2" color="blue" variant="soft">
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
      </Flex>
    </Card>
  );

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">
            Live Sessions
          </Heading>
        </Flex>

        {/* Session Counter Cards */}
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
                  Upcoming
                </Text>
                <Text size="5" weight="bold">
                  {scheduledSessions?.length || 0}
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
                  Live Now
                </Text>
                <Text size="5" weight="bold">
                  {liveSessions_?.length || 0}
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
                <VideoIcon width="20" height="20" />
              </Box>
              <Flex direction="column">
                <Text size="2" color="gray">
                  Past
                </Text>
                <Text size="5" weight="bold">
                  {pastSessions?.length || 0}
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

        <Tabs.Root defaultValue="live">
          <Tabs.List>
            <Tabs.Trigger value="live">Live Now</Tabs.Trigger>
            <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
            <Tabs.Trigger value="past">Past Sessions</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="live">
              {liveSessions_?.length ? (
                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                  {liveSessions_.map(renderSessionCard)}
                </Grid>
              ) : (
                <Card>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="2"
                    p="4"
                  >
                    <Text color="gray">No live sessions at the moment</Text>
                  </Flex>
                </Card>
              )}
            </Tabs.Content>

            <Tabs.Content value="upcoming">
              {scheduledSessions?.length ? (
                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                  {scheduledSessions.map(renderSessionCard)}
                </Grid>
              ) : (
                <Card>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="2"
                    p="4"
                  >
                    <Text color="gray">No upcoming sessions scheduled</Text>
                  </Flex>
                </Card>
              )}
            </Tabs.Content>

            <Tabs.Content value="past">
              {pastSessions?.length ? (
                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                  {pastSessions.map(renderSessionCard)}
                </Grid>
              ) : (
                <Card>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="2"
                    p="4"
                  >
                    <Text color="gray">No past sessions</Text>
                  </Flex>
                </Card>
              )}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Card>
  );
};

export default StudentLiveSessions;
