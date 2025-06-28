import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import GradebookForm from '../../../components/admin/GradebookForm';
import { useGradebookMutation } from '../../../hooks/useGradebookMutation';
import { CreateGradebookData } from '../../../types';

const GradebookCreate = () => {
  const navigate = useNavigate();
  const { createGradebook } = useGradebookMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGradebook = async (data: CreateGradebookData | any) => {
    try {
      setIsSubmitting(true);
      await createGradebook.mutateAsync(data as CreateGradebookData);
      toast.success('Gradebook entry created successfully');
      navigate('/admin/gradebook');
    } catch (error) {
      toast.error('Failed to create gradebook entry');
      console.error('Error creating gradebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card size="4">
      <GradebookForm
        mode="create"
        onSubmit={handleCreateGradebook}
        isSubmitting={isSubmitting || createGradebook.isPending}
      />
    </Card>
  );
};

export default GradebookCreate; 