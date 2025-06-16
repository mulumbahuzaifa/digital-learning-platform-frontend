import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Heading,
  Text,
  Button,
  Box,
  Badge,
  Separator,
  Avatar,
  TextArea,
  ScrollArea,
} from "@radix-ui/themes";
import { liveSessionService } from "../../../services/liveSessionService";
import { useLiveSessionMutation } from "../../../hooks/useLiveSessionMutation";
import { useAuth } from "../../../context/AuthProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  VideoIcon,
  PersonIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleIcon,
  EnterIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { formatDate, formatTime } from "../../../utils/formatters";

const StudentLiveSessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading } = useQuery({
    queryKey: ["live-session", id],
    queryFn: () => liveSessionService.getLiveSessionById(id!),
    enabled: !!id,
    refetchInterval: (data) => (data?.status === "live" ? 5000 : false),
  });

  const { joinLiveSession, leaveLiveSession, addChatMessage } =
    useLiveSessionMutation();

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.chat]);

  const handleJoinSession = () => {
    if (id) joinLiveSession.mutate(id);
  };

  const handleLeaveSession = () => {
    if (id) leaveLiveSession.mutate(id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;

    addChatMessage.mutate(
      {
        id,
        data: { message: message.trim() },
      },
      {
        onSuccess: () => setMessage(""),
      }
    );
  };

  const isParticipant = session?.participants.some(
    (p) => typeof p.user === "object" && p.user._id === user?._id
  );

  if (isLoading) return <LoadingSpinner />;
  if (!session) return <Text>Session not found</Text>;

  const getStatusBadge = () => {
    switch (session.status) {
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

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Box>
            <Flex align="center" gap="2">
              <VideoIcon width={24} height={24} />
              <Heading size="5">{session.title}</Heading>
              {getStatusBadge()}
            </Flex>
            {session.description && (
              <Text color="gray" mt="1">
                {session.description}
              </Text>
            )}
          </Box>

          <Flex gap="2">
            {session.status === "live" && !isParticipant && (
              <Button
                color="blue"
                onClick={handleJoinSession}
                disabled={joinLiveSession.isPending}
              >
                <EnterIcon /> Join Session
              </Button>
            )}

            {session.status === "live" && isParticipant && (
              <Button
                color="red"
                variant="soft"
                onClick={handleLeaveSession}
                disabled={leaveLiveSession.isPending}
              >
                <ExitIcon /> Leave Session
              </Button>
            )}

            <Button
              variant="soft"
              onClick={() => navigate("/student/live-sessions")}
            >
              Back to Sessions
            </Button>
          </Flex>
        </Flex>

        <Separator size="4" />

        <Flex gap="4">
          <Card style={{ width: "30%" }}>
            <Flex direction="column" gap="3">
              <Heading size="3">Session Details</Heading>

              <Flex align="center" gap="2">
                <CalendarIcon />
                <Text>
                  {formatDate(session.startTime)}{" "}
                  {formatTime(session.startTime)}
                </Text>
              </Flex>

              <Flex align="center" gap="2">
                <ClockIcon />
                <Text>{session.duration} minutes</Text>
              </Flex>

              <Box>
                <Text weight="bold">Class:</Text>
                <Text>
                  {typeof session.class === "object"
                    ? session.class.name
                    : "Loading..."}
                </Text>
              </Box>

              <Box>
                <Text weight="bold">Subject:</Text>
                <Text>
                  {typeof session.subject === "object"
                    ? session.subject.name
                    : "Loading..."}
                </Text>
              </Box>

              <Box>
                <Text weight="bold">Teacher:</Text>
                <Text>
                  {typeof session.teacher === "object"
                    ? `${session.teacher.firstName} ${session.teacher.lastName}`
                    : "Loading..."}
                </Text>
              </Box>

              {session.status === "live" &&
                session.meetingUrl &&
                isParticipant && (
                  <Box>
                    <Text weight="bold">Meeting Link:</Text>
                    <Button asChild mt="1">
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Meeting
                      </a>
                    </Button>
                  </Box>
                )}

              {session.status === "ended" && session.recordingUrl && (
                <Box>
                  <Text weight="bold">Recording:</Text>
                  <Button asChild mt="1">
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Recording
                    </a>
                  </Button>
                </Box>
              )}
            </Flex>
          </Card>

          <Card style={{ width: "70%" }}>
            <Flex direction="column" gap="3" height="100%">
              <Flex justify="between" align="center">
                <Heading size="3">
                  <Flex align="center" gap="2">
                    <PersonIcon />
                    Participants ({session.participants.length})
                  </Flex>
                </Heading>
              </Flex>

              <ScrollArea style={{ height: "150px" }}>
                <Flex direction="column" gap="2">
                  {session.participants.map((participant) => (
                    <Flex
                      key={
                        typeof participant.user === "object"
                          ? participant.user._id
                          : participant.user
                      }
                      align="center"
                      gap="2"
                    >
                      <Avatar
                        fallback={
                          typeof participant.user === "object"
                            ? participant.user.firstName[0] +
                              participant.user.lastName[0]
                            : "U"
                        }
                        size="2"
                      />
                      <Text>
                        {typeof participant.user === "object"
                          ? `${participant.user.firstName} ${participant.user.lastName}`
                          : "Loading..."}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </ScrollArea>

              <Separator size="4" />

              {session.status === "live" &&
                session.settings.enableChat &&
                isParticipant && (
                  <>
                    <Heading size="3">
                      <Flex align="center" gap="2">
                        <ChatBubbleIcon />
                        Chat
                      </Flex>
                    </Heading>

                    <ScrollArea style={{ height: "300px" }}>
                      <Flex direction="column" gap="2">
                        {session.chat.map((chatMessage, index) => (
                          <Box
                            key={index}
                            style={{
                              alignSelf:
                                typeof chatMessage.user === "object" &&
                                chatMessage.user._id === user?._id
                                  ? "flex-end"
                                  : "flex-start",
                            }}
                          >
                            <Card
                              style={{
                                backgroundColor:
                                  typeof chatMessage.user === "object" &&
                                  chatMessage.user._id === user?._id
                                    ? "var(--accent-3)"
                                    : "var(--gray-3)",
                              }}
                            >
                              <Flex direction="column" gap="1">
                                <Text size="1" weight="bold">
                                  {typeof chatMessage.user === "object"
                                    ? `${chatMessage.user.firstName} ${chatMessage.user.lastName}`
                                    : "Unknown User"}
                                </Text>
                                <Text>{chatMessage.message}</Text>
                                <Text size="1" color="gray">
                                  {formatTime(chatMessage.timestamp)}
                                </Text>
                              </Flex>
                            </Card>
                          </Box>
                        ))}
                        <div ref={chatEndRef} />
                      </Flex>
                    </ScrollArea>

                    <form onSubmit={handleSendMessage}>
                      <Flex gap="2">
                        <TextArea
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          style={{ flexGrow: 1 }}
                        />
                        <Button type="submit" disabled={!message.trim()}>
                          Send
                        </Button>
                      </Flex>
                    </form>
                  </>
                )}

              {session.status === "live" && !isParticipant && (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap="2"
                  p="4"
                >
                  <Text color="gray">Join the session to access the chat</Text>
                  <Button
                    color="blue"
                    onClick={handleJoinSession}
                    disabled={joinLiveSession.isPending}
                  >
                    <EnterIcon /> Join Session
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Card>
  );
};

export default StudentLiveSessionDetail;
