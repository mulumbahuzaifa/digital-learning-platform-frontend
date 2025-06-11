import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Table, 
  Text,
  Button, 
  Badge,
  Select,
  AlertDialog,
} from '@radix-ui/themes';
import { Link, useNavigate } from 'react-router-dom';
import { messageService } from '../../../services/messageService';
import { userService } from '../../../services/userService';
import { classService } from '../../../services/classService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { PlusIcon, Pencil2Icon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useMessageMutation } from '../../../hooks/useMessageMutation';
import { Message, User, Class, MessageFilterParams } from '../../../types';
import { formatDate } from '../../../utils/formatters';

const MessageManagement = () => {
  const navigate = useNavigate();
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const itemsPerPage = 10;

  const { deleteMessage } = useMessageMutation();

  // Fetch messages data
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', { class: classFilter, recipient: recipientFilter }],
    queryFn: () => {
      const params: MessageFilterParams = {};
      if (classFilter !== 'all') params.class = classFilter;
      if (recipientFilter !== 'all') params.recipient = recipientFilter;
      return messageService.getMessages(params);
    },
  });

  // Fetch users data for display names
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch classes data
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  if (isLoadingMessages || isLoadingUsers || isLoadingClasses) {
    return <LoadingSpinner />;
  }

  // Get user details
  const getUserName = (userId: string) => {
    const user = users?.find(u => u._id === userId) as User;
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  // Get class name
  const getClassName = (classId: string) => {
    const targetClass = classes?.find(c => c._id === classId) as Class;
    return targetClass ? targetClass.name : 'Unknown Class';
  };

  // Filter and paginate message data
  const filteredMessages = messagesData || [];
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteMessage = async () => {
    if (messageToDelete) {
      await deleteMessage.mutateAsync(messageToDelete);
      setMessageToDelete(null);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Message Management</Heading>
          <Button asChild>
            <Link to="/admin/messages/create">
              <PlusIcon /> New Message
            </Link>
          </Button>
        </Flex>

        <Flex gap="3" wrap="wrap">
          <Select.Root 
            value={classFilter} 
            onValueChange={setClassFilter}
          >
            <Select.Trigger placeholder="Filter by class" />
            <Select.Content>
              <Select.Item value="all">All Classes</Select.Item>
              {classes?.map(cls => (
                <Select.Item key={cls._id} value={cls._id}>
                  {cls.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root 
            value={recipientFilter} 
            onValueChange={setRecipientFilter}
          >
            <Select.Trigger placeholder="Filter by recipient" />
            <Select.Content>
              <Select.Item value="all">All Recipients</Select.Item>
              {users?.map(user => (
                <Select.Item key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role})
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Sender</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Recipient</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Message</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedMessages.length > 0 ? (
              paginatedMessages.map((message: Message) => (
                <Table.Row key={message._id}>
                  <Table.Cell>
                    {typeof message.sender === 'string' 
                      ? getUserName(message.sender) 
                      : `${message.sender.firstName} ${message.sender.lastName}`
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {message.recipient ? (
                      typeof message.recipient === 'string' 
                        ? getUserName(message.recipient) 
                        : `${message.recipient.firstName} ${message.recipient.lastName}`
                    ) : (
                      <Text color="gray">Group/Class Message</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {message.class && (
                      typeof message.class === 'string'
                        ? getClassName(message.class)
                        : message.class.name
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text truncate style={{ maxWidth: '200px' }}>
                      {message.content}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(message.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={message.isRead ? 'green' : 'orange'}>
                      {message.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => navigate(`/admin/messages/${message._id}`)}
                      >
                        <EyeOpenIcon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="amber"
                        onClick={() => navigate(`/admin/messages/${message._id}/edit`)}
                      >
                        <Pencil2Icon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="red"
                        onClick={() => setMessageToDelete(message._id)}
                      >
                        <TrashIcon />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Text align="center">No messages found</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {filteredMessages.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length} items
            </Text>
            <Flex gap="2">
              <Button 
                variant="soft" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="soft" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={!!messageToDelete}
        onOpenChange={() => setMessageToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Message</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this message? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="red" 
                disabled={deleteMessage.isPending}
                onClick={handleDeleteMessage}
              >
                {deleteMessage.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default MessageManagement; 