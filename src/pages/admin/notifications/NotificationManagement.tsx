import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Heading, 
  Button, 
  Table, 
  Text, 
  Badge, 
  Box,
  AlertDialog,
} from '@radix-ui/themes';
import { notificationService } from '../../../services/notificationService';
import { useNotificationMutation } from '../../../hooks/useNotificationMutation';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { EyeOpenIcon, TrashIcon, CheckIcon } from '@radix-ui/react-icons';
import { Notification } from '../../../types';
import { formatDate } from '../../../utils/formatters';

const NotificationManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const itemsPerPage = 10;

  const { 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearNotifications 
  } = useNotificationMutation();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const paginatedNotifications = notifications 
    ? notifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];
  
  const totalPages = notifications 
    ? Math.ceil(notifications.length / itemsPerPage) 
    : 0;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification.mutateAsync(id);
  };

  const handleClearNotifications = async () => {
    await clearNotifications.mutateAsync();
    setShowClearDialog(false);
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Notifications</Heading>
          <Flex gap="3">
            <Button 
              variant="soft" 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckIcon /> Mark All as Read
            </Button>
            <Button 
              variant="soft" 
              color="red"
              onClick={() => setShowClearDialog(true)}
            >
              <TrashIcon /> Clear All
            </Button>
          </Flex>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Message</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedNotifications.length > 0 ? (
              paginatedNotifications.map((notification: Notification) => (
                <Table.Row key={notification._id}>
                  <Table.Cell>
                    <Text weight={notification.isRead ? undefined : 'bold'}>
                      {notification.title}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text 
                      truncate 
                      style={{ maxWidth: '300px' }}
                      weight={notification.isRead ? undefined : 'bold'}
                    >
                      {notification.message}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text weight={notification.isRead ? undefined : 'bold'}>
                      {formatDate(notification.createdAt)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={notification.isRead ? 'green' : 'blue'}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      {!notification.isRead && (
                        <Button 
                          size="1" 
                          variant="soft" 
                          onClick={() => handleMarkAsRead(notification._id)}
                          disabled={markAsRead.isPending}
                        >
                          <EyeOpenIcon /> Mark as Read
                        </Button>
                      )}
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="red"
                        onClick={() => handleDeleteNotification(notification._id)}
                        disabled={deleteNotification.isPending}
                      >
                        <TrashIcon />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={5} align="center">
                  <Box py="4">
                    <Text align="center">No notifications found</Text>
                  </Box>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {notifications && notifications.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, notifications.length)} of {notifications.length} notifications
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

      {/* Clear All Confirmation Dialog */}
      <AlertDialog.Root
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Clear All Notifications</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to clear all notifications? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="red" 
                disabled={clearNotifications.isPending}
                onClick={handleClearNotifications}
              >
                {clearNotifications.isPending ? 'Clearing...' : 'Clear All'}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default NotificationManagement; 