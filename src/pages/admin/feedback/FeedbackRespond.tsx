import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Flex, Heading, Text, Box } from '@radix-ui/themes';
import { feedbackService } from '../../../services/feedbackService';
import { useFeedbackMutation } from '../../../hooks/useFeedbackMutation';
import FeedbackResponseForm from '../../../components/admin/FeedbackResponseForm';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { FeedbackResponseData } from '../../../types';

const FeedbackRespond = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { respondToFeedback } = useFeedbackMutation();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => id ? feedbackService.getFeedbackById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  const handleSubmit = async (data: FeedbackResponseData) => {
    if (id) {
      await respondToFeedback.mutateAsync({ id, data });
      navigate(`/admin/feedback/${id}`);
    }
  };

  if (isLoading || !feedback) {
    return <LoadingSpinner />;
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="4">Respond to Feedback</Heading>
        
        <Box>
          <Text weight="bold">Original Feedback:</Text>
          <Card variant="surface" size="1" mt="2">
            <Box p="3">
              <Text>{feedback.content}</Text>
              {feedback.rating && (
                <Text size="2" color="gray" mt="2">
                  Rating: {feedback.rating}/5
                </Text>
              )}
            </Box>
          </Card>
        </Box>
        
        <FeedbackResponseForm
          currentStatus={feedback.status}
          onSubmit={handleSubmit}
          isSubmitting={respondToFeedback.isPending}
        />
      </Flex>
    </Card>
  );
};

export default FeedbackRespond; 