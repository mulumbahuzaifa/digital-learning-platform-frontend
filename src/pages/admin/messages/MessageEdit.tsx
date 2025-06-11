import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@radix-ui/themes';
import { messageService } from '../../../services/messageService';
import { useMessageMutation } from '../../../hooks/useMessageMutation';
import MessageForm from '../../../components/admin/MessageForm';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UpdateMessageData } from '../../../types';

const MessageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateMessage } = useMessageMutation();

  const { data: message, isLoading } = useQuery({
    queryKey: ['message', id],
    queryFn: () => id ? messageService.getMessage(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });

  const handleSubmit = async (data: UpdateMessageData, files?: File[]) => {
    if (id) {
      await updateMessage.mutateAsync({ 
        id, 
        data: {
          ...data,
          attachments: files
        } 
      });
      navigate(`/admin/messages/${id}`);
    }
  };

  if (isLoading || !message) {
    return <LoadingSpinner />;
  }

  return (
    <Card size="4">
      <MessageForm
        initialData={message}
        mode="edit"
        onSubmit={handleSubmit}
        isSubmitting={updateMessage.isPending}
      />
    </Card>
  );
};

export default MessageEdit; 