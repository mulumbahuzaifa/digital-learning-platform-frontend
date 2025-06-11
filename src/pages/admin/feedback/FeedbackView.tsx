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
import { ChatBubbleIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { feedbackService } from '../../../services/feedbackService';
import { useFeedbackMutation } from '../../../hooks/useFeedbackMutation';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils/formatters';

// Helper to get color for feedback status badge
const getFeedbackStatusColor = (status: string) => {
  switch(status) {
    case 'submitted': return 'orange';
    case 'reviewed': return 'blue';
    case 'actioned': return 'purple';
    case 'resolved': return 'green';
    default: return 'gray';
  }
};

// Helper to get color for feedback type badge
const getFeedbackTypeColor = (type: string) => {
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

const FeedbackView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteFeedback } = useFeedbackMutation();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => id ? feedbackService.getFeedbackById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (id) {
      await deleteFeedback.mutateAsync(id);
      navigate('/admin/feedback');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!feedback) {
    return (
      <Card size="4">
        <Flex direction="column" gap="3" align="center" justify="center" py="6">
          <Text size="5">Feedback not found</Text>
          <Button onClick={() => navigate('/admin/feedback')}>
            Return to Feedback List
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Feedback Details</Heading>
          <Flex gap="3">
            <Button 
              size="2" 
              onClick={() => navigate(`/admin/feedback/${id}/respond`)}
            >
              <ChatBubbleIcon /> Respond
            </Button>
            <Button 
              size="2" 
              color="amber"
              onClick={() => navigate(`/admin/feedback/${id}/edit`)}
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
          <Flex justify="between" wrap="wrap" gap="3">
            <Badge color={getFeedbackTypeColor(feedback.feedbackType) as any} size="2">
              {feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1)} Feedback
            </Badge>
            <Badge color={getFeedbackStatusColor(feedback.status) as any} size="2">
              {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
            </Badge>
          </Flex>
        </Box>

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">Submitted</Text>
          <Text as="div" size="2">
            {formatDate(feedback.createdAt)}
            {feedback.isAnonymous 
              ? ' (Anonymous)' 
              : feedback.fromUser && typeof feedback.fromUser !== 'string'
                ? ` by ${feedback.fromUser.firstName} ${feedback.fromUser.lastName}`
                : ''}
          </Text>
        </Box>

        {feedback.rating && (
          <Box>
            <Text as="div" size="2" weight="bold" mb="1">Rating</Text>
            <Text as="div" size="3">{feedback.rating}/5</Text>
          </Box>
        )}

        <Box>
          <Text as="div" size="2" weight="bold" mb="1">Content</Text>
          <Card variant="surface" size="2">
            <Box p="3">
              <Text>{feedback.content}</Text>
            </Box>
          </Card>
        </Box>

        {feedback.response && (
          <>
            <Separator size="4" />
            <Box>
              <Text as="div" size="2" weight="bold" mb="1">Response</Text>
              <Card variant="surface" size="2">
                <Box p="3">
                  <Text>{feedback.response}</Text>
                </Box>
              </Card>
              {feedback.respondedAt && (
                <Text as="div" size="1" color="gray" mt="1">
                  Responded on {formatDate(feedback.respondedAt)}
                  {feedback.respondedBy && typeof feedback.respondedBy !== 'string' 
                    ? ` by ${feedback.respondedBy.firstName} ${feedback.respondedBy.lastName}` 
                    : ''}
                </Text>
              )}
            </Box>
          </>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
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
                onClick={handleDelete}
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

export default FeedbackView; 