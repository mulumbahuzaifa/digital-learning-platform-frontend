import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading } from "@radix-ui/themes";
import { useEffect } from "react";
import { contentService } from "../../services/contentService";
import { ContentForm, ContentFormData } from "../../components/content/ContentForm";
import { useContentMutation } from "../../hooks/useContentMutation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const EditContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateContent } = useContentMutation();

  // Force refetch on component mount
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    }
  }, [id, queryClient]);

  // Fetch content data
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
  });

  const handleSubmit = async (data: ContentFormData) => {
    if (!id) return;
    
    await updateContent.mutateAsync({ 
      id, 
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        class: data.class,
        subject: data.subject,
        tags: data.tags,
        isPublic: data.isPublic,
        accessLevel: data.accessLevel,
      } 
    });
    
    navigate(`/admin/content/${id}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading content: {(error as Error).message}</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <Card size="4">
      <Heading size="5" mb="4">Edit Learning Content</Heading>
      <ContentForm
        mode="edit"
        initialData={content}
        onSubmit={handleSubmit}
        isSubmitting={updateContent.isPending}
      />
    </Card>
  );
};

export default EditContent; 