import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Box,
  Heading, 
  Text, 
  Button, 
  Badge,
  Separator, 
  AlertDialog, 
} from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon, Link1Icon } from '@radix-ui/react-icons';
import { messageService } from '../../../services/messageService';
import { useMessageMutation } from '../../../hooks/useMessageMutation';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils/formatters';

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteMessage } = useMessageMutation();

  const { data: message, isLoading } = useQuery({
    queryKey: ['message', id],
    queryFn: () => id ? messageService.getMessage(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (id) {
      await deleteMessage.mutateAsync(id);
      navigate('/admin/messages');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!message) {
    return (
      <Card size="4">
        <Flex direction="column" gap="3" align="center" justify="center" py="6">
          <Text size="5">Message not found</Text>
          <Button onClick={() => navigate('/admin/messages')}>
            Return to Messages
          </Button>
        </Flex>
      </Card>
    );
  }

  // Helper to get user name
  const getUserName = (user: any) => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return user;
    return `${user.firstName} ${user.lastName}`;
  };

  // Helper to get class name
  const getClassName = (cls: any) => {
    if (!cls) return null;
    if (typeof cls === 'string') return cls;
    return cls.name;
  };

  // Helper to get subject name
  const getSubjectName = (subject: any) => {
    if (!subject) return null;
    if (typeof subject === 'string') return subject;
    return subject.name;
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Message Details</Heading>
          <Flex gap="3">
            <Button 
              size="2" 
              color="amber"
              onClick={() => navigate(`/admin/messages/${id}/edit`)}
            >
              <Pencil2Icon /> Edit
            </Button>
            <Button 
              size="2" 
              color="red"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon /> Delete
            </Button>
          </Flex>
        </Flex>

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">From</Text>
          <Text as="div" size="2">
            {getUserName(message.sender)}
          </Text>
        </Box>

        {message.recipient && (
          <Box>
            <Text as="div" size="2" weight="bold" mb="1">To</Text>
            <Text as="div" size="2">
              {getUserName(message.recipient)}
            </Text>
          </Box>
        )}

        {message.class && (
          <Box>
            <Text as="div" size="2" weight="bold" mb="1">Class</Text>
            <Text as="div" size="2">
              {getClassName(message.class)}
            </Text>
          </Box>
        )}

        {message.subject && (
          <Box>
            <Text as="div" size="2" weight="bold" mb="1">Subject</Text>
            <Text as="div" size="2">
              {getSubjectName(message.subject)}
            </Text>
          </Box>
        )}

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">Date</Text>
          <Text as="div" size="2">
            {formatDate(message.createdAt)}
          </Text>
        </Box>

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">Status</Text>
          <Badge color={message.isRead ? 'green' : 'orange'}>
            {message.isRead ? 'Read' : 'Unread'}
          </Badge>
        </Box>

        <Separator size="4" />

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">Message</Text>
          <Card variant="surface" size="2">
            <Box p="3">
              <Text>{message.content}</Text>
            </Box>
          </Card>
        </Box>

        {message.attachments && message.attachments.length > 0 && (
          <Box>
            <Text as="div" size="2" weight="bold" mb="1">Attachments</Text>
            <Card variant="surface" size="1">
              <Flex direction="column" gap="1">
                {message.attachments.map((attachment: string, index: number) => (
                  <Flex key={index} p="2" justify="between" align="center">
                    <Text size="2" truncate>
                      {attachment.split('/').pop()}
                    </Text>
                    <Button size="1" variant="soft" asChild>
                      <a href={attachment} target="_blank" rel="noopener noreferrer">
                        <Link1Icon /> Open
                      </a>
                    </Button>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Box>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
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
                onClick={handleDelete}
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

export default MessageView; 