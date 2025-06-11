import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import MessageForm from '../../../components/admin/MessageForm';
import { useMessageMutation } from '../../../hooks/useMessageMutation';
import { CreateMessageData } from '../../../types';

const MessageCreate = () => {
  const navigate = useNavigate();
  const { sendMessage } = useMessageMutation();

  const handleSubmit = async (data: CreateMessageData, files?: File[]) => {
    await sendMessage.mutateAsync({
      ...data,
      attachments: files
    });
    navigate('/admin/messages');
  };

  return (
    <Card size="4">
      <MessageForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={sendMessage.isPending}
      />
    </Card>
  );
};

export default MessageCreate; 