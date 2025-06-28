import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Flex, Button } from '@radix-ui/themes';
import { useState } from 'react';
import toast from 'react-hot-toast';
import GradebookForm from '../../../components/admin/GradebookForm';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';
import { gradebookService } from '../../../services/gradebookService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UpdateGradebookData } from '../../../types';

const GradebookEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateGradebook, publishGradebook } = useGradebookMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch gradebook data for editing
  const { data: gradebook, isLoading } = useQuery({
    queryKey: ['gradebook', id],
    queryFn: () => (id ? gradebookService.getGradebookById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  const handleUpdateGradebook = async (data: UpdateGradebookData | any) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateGradebook.mutateAsync({ id, data: data as UpdateGradebookData });
      toast.success('Gradebook entry updated successfully');
      navigate(`/admin/gradebook/${id}`);
    } catch (error) {
      toast.error('Failed to update gradebook entry');
      console.error('Error updating gradebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishGradebook = async () => {
    if (!id) return;
    
    try {
      setIsPublishing(true);
      await publishGradebook.mutateAsync(id);
      toast.success('Gradebook published successfully');
      navigate(`/admin/gradebook/${id}`);
    } catch (error) {
      toast.error('Failed to publish gradebook');
      console.error('Error publishing gradebook:', error);
    } finally {
      setIsPublishing(false);
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
        isSubmitting={isSubmitting || updateGradebook.isPending}
      />
      
      {!gradebook.isPublished && (
        <Flex justify="end" mt="4">
          <Button 
            color="green" 
            onClick={handlePublishGradebook}
            disabled={isPublishing || publishGradebook.isPending}
          >
            {isPublishing || publishGradebook.isPending ? 'Publishing...' : 'Publish Gradebook'}
          </Button>
        </Flex>
      )}
    </Card>
  );
};

export default GradebookEdit; 