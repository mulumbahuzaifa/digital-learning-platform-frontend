import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Text,
  Heading,
  Button,
  TextField,
  Select,
  Table,
  Badge,
  Dialog,
  AlertDialog,
  TextArea,
} from "@radix-ui/themes";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Cross2Icon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { messageService } from "../../../services/messageService";
import { Message, CreateMessageData } from "../../../types";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { format } from "date-fns";

const TeacherMessages = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Fetch messages
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.getMessages(),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: CreateMessageData) => messageService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setIsDialogOpen(false);
      setMessageContent("");
      setSelectedRecipient("");
      setSelectedClass("");
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => messageService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
  });

  const handleSendMessage = () => {
    if (!messageContent || (!selectedRecipient && !selectedClass)) return;

    const messageData: CreateMessageData = {
      content: messageContent,
      ...(selectedRecipient && { recipient: selectedRecipient }),
      ...(selectedClass && { class: selectedClass }),
    };

    sendMessageMutation.mutate(messageData);
  };

  // Filter messages based on search term
  const filteredMessages = messages?.filter(
    (message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      message.sender.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Messages</Heading>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusIcon /> New Message
        </Button>
      </Flex>

      {/* Search */}
      <Card variant="classic" className="p-4">
        <Flex direction="column" gap="4">
          <Text weight="bold">Search Messages</Text>
          <TextField.Root
            placeholder="Search by content or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </Card>

      {/* Messages List */}
      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Sender</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Content</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredMessages?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text align="center" color="gray">
                    No messages found
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredMessages?.map((message) => (
                <Table.Row key={message._id}>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <PersonIcon />
                      <Text>
                        {message.sender.firstName} {message.sender.lastName}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{message.content}</Table.Cell>
                  <Table.Cell>
                    {format(new Date(message.createdAt), "PPp")}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={message.isRead ? "green" : "yellow"}>
                      {message.isRead ? "Read" : "Unread"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="1"
                      color="red"
                      variant="soft"
                      onClick={() => {
                        setMessageToDelete(message._id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Cross2Icon />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* New Message Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>New Message</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Send a message to a recipient or class
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Select.Root
              value={selectedRecipient}
              onValueChange={setSelectedRecipient}
            >
              <Select.Trigger placeholder="Select recipient" />
              <Select.Content>
                {/* Add recipient options here */}
                <Select.Item value="recipient1">John Doe</Select.Item>
                <Select.Item value="recipient2">Jane Smith</Select.Item>
              </Select.Content>
            </Select.Root>

            <Select.Root value={selectedClass} onValueChange={setSelectedClass}>
              <Select.Trigger placeholder="Or select a class" />
              <Select.Content>
                {/* Add class options here */}
                <Select.Item value="class1">Class A</Select.Item>
                <Select.Item value="class2">Class B</Select.Item>
              </Select.Content>
            </Select.Root>

            <TextField.Root>
              <TextArea
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </TextField.Root>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleSendMessage}
              disabled={
                !messageContent || (!selectedRecipient && !selectedClass)
              }
            >
              <PaperPlaneIcon /> Send Message
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Message</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this message? This action cannot be
            undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color="red"
                onClick={() =>
                  messageToDelete &&
                  deleteMessageMutation.mutate(messageToDelete)
                }
                disabled={deleteMessageMutation.isPending}
              >
                {deleteMessageMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default TeacherMessages;
