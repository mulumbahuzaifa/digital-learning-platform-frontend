import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@radix-ui/themes';
import { feedbackService } from '../../../services/feedbackService';
import { useFeedbackMutation } from '../../../hooks/useFeedbackMutation';
import FeedbackForm from '../../../components/admin/FeedbackForm';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UpdateFeedbackData } from '../../../types';

const FeedbackEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateFeedback } = useFeedbackMutation();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => id ? feedbackService.getFeedbackById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  const handleSubmit = async (data: UpdateFeedbackData) => {
    if (id) {
      await updateFeedback.mutateAsync({ id, data });
      navigate(`/admin/feedback/${id}`);
    }
  };

  if (isLoading || !feedback) {
    return <LoadingSpinner />;
  }

  return (
    <Card size="4">
      <FeedbackForm
        initialData={feedback}
        mode="edit"
        onSubmit={handleSubmit}
        isSubmitting={updateFeedback.isPending}
      />
    </Card>
  );
};

export default FeedbackEdit; 