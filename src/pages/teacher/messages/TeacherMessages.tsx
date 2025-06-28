import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { classService } from "../../../services/classService";
import { Message, CreateMessageData } from "../../../types";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { format } from "date-fns";
import { useMessageMutation } from "../../../hooks/useMessageMutation";
import { TeacherClass } from "../../../types/class";

const TeacherMessages = () => {
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

  // Fetch teacher's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<TeacherClass[]>({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      console.log('Teacher Classes Data:', response);
      return response as TeacherClass[];
    },
  });

  console.log(messages)
  // Extract all students from all classes
  const allStudents = useMemo(() => {
    if (!classes) return [];
    
    const students: {
      _id: string;
      firstName: string;
      lastName: string;
      email?: string;
      classId: string;
      className: string;
    }[] = [];

    classes.forEach(classItem => {
      if (classItem.enrolledStudents && classItem.enrolledStudents.length > 0) {
        classItem.enrolledStudents.forEach(enrollment => {
          // Handle case where student is directly in the enrollment object
          if (enrollment.student) {
            students.push({
              _id: enrollment.student._id,
              firstName: enrollment.student.firstName,
              lastName: enrollment.student.lastName,
              email: enrollment.student.email,
              classId: classItem.class._id,
              className: classItem.class.name
            });
          }
          // Handle case where enrollment might have a different structure
          else if ('enrollmentDetails' in enrollment) {
            // This is for the structure in your example data
            const enrollmentWithDetails = enrollment as unknown as {
              student: {
                _id: string;
                firstName: string;
                lastName: string;
                email?: string;
              };
              enrollmentDetails: {
                academicYear: string;
                term: string;
                status: string;
              };
            };
            
            if (enrollmentWithDetails.student) {
              students.push({
                _id: enrollmentWithDetails.student._id,
                firstName: enrollmentWithDetails.student.firstName,
                lastName: enrollmentWithDetails.student.lastName,
                email: enrollmentWithDetails.student.email,
                classId: classItem.class._id,
                className: classItem.class.name
              });
            }
          }
        });
      }
    });
    
    console.log('Extracted Students:', students);
    return students;
  }, [classes]);

  // Use message mutations
  const { createMessage, deleteMessage: deleteMutation } = useMessageMutation();

  const handleSendMessage = () => {
    if (!messageContent || (!selectedRecipient && !selectedClass)) return;

    const messageData: CreateMessageData = {
      content: messageContent,
      ...(selectedRecipient && { recipient: selectedRecipient }),
      ...(selectedClass && { class: selectedClass }),
    };

    createMessage.mutate(messageData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setMessageContent("");
        setSelectedRecipient("");
        setSelectedClass("");
      }
    });
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
              <Table.ColumnHeaderCell>Recipient</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Content</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Privacy</Table.ColumnHeaderCell>
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
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <PersonIcon />
                      <Text>
                        {message.recipient?.firstName} {message.recipient?.lastName}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{message.content}</Table.Cell>
                  <Table.Cell>
                    {format(new Date(message.createdAt), "PPp")}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={message.isGroupMessage ? "green" : "red"}>
                      {message.isGroupMessage ? "Public" : "Private"}
                    </Badge>
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
            Send a message to a student or class
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Select.Root
              value={selectedRecipient}
              onValueChange={setSelectedRecipient}
            >
              <Select.Trigger placeholder="Select student recipient" />
              <Select.Content>
                {isLoadingClasses ? (
                  <Select.Item value="loading">Loading students...</Select.Item>
                ) : allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <Select.Item key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.className})
                    </Select.Item>
                  ))
                ) : (
                  <Select.Item value="no-students">No students found</Select.Item>
                )}
              </Select.Content>
            </Select.Root>

            <Text size="2" color="gray">OR</Text>

            <Select.Root value={selectedClass} onValueChange={setSelectedClass}>
              <Select.Trigger placeholder="Select a class" />
              <Select.Content>
                {isLoadingClasses ? (
                  <Select.Item value="loading">Loading classes...</Select.Item>
                ) : classes && classes.length > 0 ? (
                  classes.map((classItem) => (
                    <Select.Item key={classItem.class._id} value={classItem.class._id}>
                      {classItem.class.name} ({classItem.class.code})
                    </Select.Item>
                  ))
                ) : (
                  <Select.Item value="no-classes">No classes found</Select.Item>
                )}
              </Select.Content>
            </Select.Root>

          <TextArea
            className="w-full"
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
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
                createMessage.isPending || 
                !messageContent || 
                (!selectedRecipient && !selectedClass)
              }
            >
              {createMessage.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <PaperPlaneIcon /> Send Message
                </>
              )}
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
                  deleteMutation.mutate(messageToDelete)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
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
