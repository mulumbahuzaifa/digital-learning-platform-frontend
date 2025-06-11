import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  TextField,
  Badge,
  TextArea,
} from "@radix-ui/themes";
import { messageService } from "../../../services/messageService";
import { useMessageMutation } from "../../../hooks/useMessageMutation";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/formatters";
import { useState } from "react";

const MessageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState("");
  const { createMessage } = useMessageMutation();

  const { data: message, isLoading } = useQuery({
    queryKey: ["message", id],
    queryFn: () => messageService.getMessage(id!),
  });

  if (isLoading || !message) {
    return <LoadingSpinner />;
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    await createMessage.mutateAsync({
      content: replyContent,
      recipient: message.sender._id,
    });

    setReplyContent("");
  };

  const getMessageType = () => {
    if (message.class) return "Class Message";
    if (message.subject) return "Subject Message";
    if (message.recipient) return "Direct Message";
    return "Group Message";
  };

  return (
    <Box p="4">
      <Card size="3">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="5">Message Details</Heading>
            <Button
              variant="soft"
              onClick={() => navigate("/student/messages")}
            >
              Back to Messages
            </Button>
          </Flex>

          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Badge color="blue">{getMessageType()}</Badge>
                <Text size="2" color="gray">
                  {formatDate(message.createdAt)}
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  From
                </Text>
                <Text>
                  {message.sender.firstName} {message.sender.lastName}
                </Text>
              </Flex>

              {message.class && (
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">
                    Class
                  </Text>
                  <Text>
                    {message.class.name} ({message.class.code})
                  </Text>
                </Flex>
              )}

              {message.subject && (
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">
                    Subject
                  </Text>
                  <Text>
                    {message.subject.name} ({message.subject.code})
                  </Text>
                </Flex>
              )}

              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Message
                </Text>
                <Text>{message.content}</Text>
              </Flex>

              {message.attachments && message.attachments.length > 0 && (
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">
                    Attachments
                  </Text>
                  <Flex gap="2">
                    {message.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="soft"
                        onClick={() => window.open(attachment.url, "_blank")}
                      >
                        {attachment.name}
                      </Button>
                    ))}
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Card>

          {message.recipient && (
            <form onSubmit={handleReply}>
              <Flex direction="column" gap="3">
                <TextArea
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ minHeight: "100px" }}
                />
                <Flex justify="end">
                  <Button type="submit" disabled={!replyContent.trim()}>
                    Send Reply
                  </Button>
                </Flex>
              </Flex>
            </form>
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default MessageDetail;
