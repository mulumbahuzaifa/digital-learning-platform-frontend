import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@radix-ui/themes';
import GradebookForm from '../../../components/admin/GradebookForm';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';
import { gradebookService } from '../../../services/gradebookService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UpdateGradebookData } from '../../../types';

const GradebookEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateGradebook } = useGradebookMutation();

  // Fetch gradebook data for editing
  const { data: gradebook, isLoading } = useQuery({
    queryKey: ['gradebook', id],
    queryFn: () => (id ? gradebookService.getGradebookById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  const handleUpdateGradebook = async (data: UpdateGradebookData | any) => {
    if (id) {
      await updateGradebook.mutateAsync({ id, data: data as UpdateGradebookData });
      navigate(`/admin/gradebook/${id}`);
    }
  };

  if (isLoading || !gradebook) {
    return <LoadingSpinner />;
  }

  return (
    <Card size="4">
      <GradebookForm
        mode="edit"
        initialData={gradebook}
        onSubmit={handleUpdateGradebook}
        isSubmitting={updateGradebook.isPending}
      />
    </Card>
  );
};

export default GradebookEdit; 