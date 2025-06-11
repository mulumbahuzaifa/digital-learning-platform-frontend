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
import { feedbackService } from '../../../services/feedbackService';
import { userService } from '../../../services/userService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { 
  PlusIcon, 
  Pencil2Icon, 
  TrashIcon, 
  EyeOpenIcon, 
  ChatBubbleIcon 
} from '@radix-ui/react-icons';
import { useFeedbackMutation } from '../../../hooks/useFeedbackMutation';
import { 
  Feedback, 
  FeedbackStatus, 
  FeedbackType, 
  User, 
  FeedbackFilterParams 
} from '../../../types';
import { formatDate } from '../../../utils/formatters';

// Helper to get color for feedback status badge
const getFeedbackStatusColor = (status: FeedbackStatus) => {
  switch(status) {
    case 'submitted': return 'orange';
    case 'reviewed': return 'blue';
    case 'actioned': return 'purple';
    case 'resolved': return 'green';
    default: return 'gray';
  }
};

// Helper to get color for feedback type badge
const getFeedbackTypeColor = (type: FeedbackType) => {
  switch(type) {
    case 'teacher': return 'indigo';
    case 'student': return 'cyan';
    case 'content': return 'blue';
    case 'assignment': return 'violet';
    case 'platform': return 'orange';
    case 'system': return 'red';
    default: return 'gray';
  }
};

const FeedbackManagement = () => {
  const navigate = useNavigate();
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 10;

  const { deleteFeedback } = useFeedbackMutation();

  // Fetch feedback data
  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['feedback', { type: typeFilter, status: statusFilter }],
    queryFn: () => {
      const params: FeedbackFilterParams = {};
      if (typeFilter !== 'all') params.type = typeFilter as FeedbackType;
      if (statusFilter !== 'all') params.status = statusFilter as FeedbackStatus;
      return feedbackService.getFeedback(params);
    },
  });

  // Fetch users data for display names
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  if (isLoadingFeedback || isLoadingUsers) {
    return <LoadingSpinner />;
  }

  // Get user details
  const getUserName = (userId: string) => {
    const user = users?.find(u => u._id === userId) as User;
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  // Filter and paginate feedback data
  const filteredFeedback = feedbackData || [];
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteFeedback = async () => {
    if (feedbackToDelete) {
      await deleteFeedback.mutateAsync(feedbackToDelete);
      setFeedbackToDelete(null);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Feedback Management</Heading>
          <Button asChild>
            <Link to="/admin/feedback/create">
              <PlusIcon /> Submit Feedback
            </Link>
          </Button>
        </Flex>

        <Flex gap="3" wrap="wrap">
          <Select.Root 
            value={typeFilter} 
            onValueChange={setTypeFilter}
          >
            <Select.Trigger placeholder="Filter by type" />
            <Select.Content>
              <Select.Item value="all">All Types</Select.Item>
              <Select.Item value="teacher">Teacher Feedback</Select.Item>
              <Select.Item value="student">Student Feedback</Select.Item>
              <Select.Item value="content">Content Feedback</Select.Item>
              <Select.Item value="assignment">Assignment Feedback</Select.Item>
              <Select.Item value="platform">Platform Feedback</Select.Item>
              <Select.Item value="system">System Feedback</Select.Item>
            </Select.Content>
          </Select.Root>

          <Select.Root 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Item value="all">All Statuses</Select.Item>
              <Select.Item value="submitted">Submitted</Select.Item>
              <Select.Item value="reviewed">Reviewed</Select.Item>
              <Select.Item value="actioned">Actioned</Select.Item>
              <Select.Item value="resolved">Resolved</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant="surface">
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
            {paginatedFeedback.length > 0 ? (
              paginatedFeedback.map((feedback: Feedback) => (
                <Table.Row key={feedback._id}>
                  <Table.Cell>
                    <Badge color={getFeedbackTypeColor(feedback.feedbackType) as any}>
                      {feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {feedback.isAnonymous ? 'Anonymous' : (
                      typeof feedback.fromUser === 'string' 
                        ? getUserName(feedback.fromUser) 
                        : `${feedback.fromUser.firstName} ${feedback.fromUser.lastName}`
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text truncate style={{ maxWidth: '200px' }}>
                      {feedback.content}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(feedback.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getFeedbackStatusColor(feedback.status) as any}>
                      {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => navigate(`/admin/feedback/${feedback._id}`)}
                      >
                        <EyeOpenIcon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="blue"
                        onClick={() => navigate(`/admin/feedback/${feedback._id}/respond`)}
                      >
                        <ChatBubbleIcon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="amber"
                        onClick={() => navigate(`/admin/feedback/${feedback._id}/edit`)}
                      >
                        <Pencil2Icon />
                      </Button>
                      <Button 
                        size="1" 
                        variant="soft" 
                        color="red"
                        onClick={() => setFeedbackToDelete(feedback._id)}
                      >
                        <TrashIcon />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text align="center">No feedback found</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {filteredFeedback.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredFeedback.length)} of {filteredFeedback.length} items
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
        open={!!feedbackToDelete}
        onOpenChange={() => setFeedbackToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Feedback</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="red" 
                disabled={deleteFeedback.isPending}
                onClick={handleDeleteFeedback}
              >
                {deleteFeedback.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default FeedbackManagement; 