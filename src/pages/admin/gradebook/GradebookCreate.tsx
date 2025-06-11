import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import GradebookForm from '../../../components/admin/GradebookForm';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';
import { CreateGradebookData } from '../../../types';

const GradebookCreate = () => {
  const navigate = useNavigate();
  const { createGradebook } = useGradebookMutation();

  const handleCreateGradebook = async (data: CreateGradebookData | any) => {
    await createGradebook.mutateAsync(data as CreateGradebookData);
    navigate('/admin/gradebook');
  };

  return (
    <Card size="4">
      <GradebookForm
        mode="create"
        onSubmit={handleCreateGradebook}
        isSubmitting={createGradebook.isPending}
      />
    </Card>
  );
};

export default GradebookCreate; 