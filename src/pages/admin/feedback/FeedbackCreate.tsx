import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import FeedbackForm from '../../../components/admin/FeedbackForm';
import { useFeedbackMutation } from '../../../hooks/useFeedbackMutation';
import { CreateFeedbackData, UpdateFeedbackData } from '../../../types';

const FeedbackCreate = () => {
  const navigate = useNavigate();
  const { createFeedback } = useFeedbackMutation();

  const handleSubmit = async (data: CreateFeedbackData | UpdateFeedbackData) => {
    await createFeedback.mutateAsync(data as CreateFeedbackData);
    navigate('/admin/feedback');
  };

  return (
    <Card size="4">
      <FeedbackForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createFeedback.isPending}
      />
    </Card>
  );
};

export default FeedbackCreate; 