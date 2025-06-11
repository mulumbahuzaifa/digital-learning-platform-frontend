import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Table,
  Select,
  Badge,
  Button,
  TextField,
  IconButton,
} from "@radix-ui/themes";
import { messageService } from "../../../services/messageService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/formatters";
import { useState } from "react";
import { Message, MessageFilterParams } from "../../../types";
import { useMessageMutation } from "../../../hooks/useMessageMutation";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const StudentMessages = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MessageFilterParams>({
    status: "unread",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", filter],
    queryFn: () => messageService.getMessages(filter),
  });

  const { deleteMessage } = useMessageMutation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSearch = () => {
    setFilter((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage.mutateAsync(id);
    }
  };

  const getMessageType = (message: Message) => {
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
            <Heading size="5">My Messages</Heading>
            <Button onClick={() => navigate("/student/messages/compose")}>
              New Message
            </Button>
          </Flex>

          <Flex gap="3" align="center">
            <TextField.Root
              style={{ flex: 1 }}
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            ></TextField.Root>
            <Select.Root
              value={filter.status}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  status: value as "read" | "unread",
                }))
              }
            >
              <Select.Trigger placeholder="Filter by status" />
              <Select.Content>
                <Select.Item value="unread">Unread</Select.Item>
                <Select.Item value="read">Read</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Content</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {messages.map((message: Message) => (
                <Table.Row key={message._id}>
                  <Table.Cell>
                    <Badge color="blue">{getMessageType(message)}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {message.sender.firstName} {message.sender.lastName}
                  </Table.Cell>
                  <Table.Cell>
                    <Text truncate style={{ maxWidth: "300px" }}>
                      {message.content}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{formatDate(message.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={message.isRead ? "green" : "yellow"}>
                      {message.isRead ? "Read" : "Unread"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <IconButton
                        variant="ghost"
                        color="blue"
                        onClick={() =>
                          navigate(`/student/messages/${message._id}`)
                        }
                      >
                        <Pencil1Icon width="16" height="16" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        color="red"
                        onClick={() => handleDelete(message._id)}
                      >
                        <TrashIcon width="16" height="16" />
                      </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
              {messages.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6}>
                    <Text align="center" color="gray">
                      No messages found
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>
    </Box>
  );
};

export default StudentMessages;
