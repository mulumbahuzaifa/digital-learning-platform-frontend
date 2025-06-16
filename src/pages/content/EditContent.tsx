import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading, Box, Text } from "@radix-ui/themes";
import { useEffect } from "react";
import { contentService } from "../../services/contentService";
import { ContentForm, ContentFormData } from "../../components/content/ContentForm";
import { useContentMutation } from "../../hooks/useContentMutation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { classService } from "../../services/classService";
import { subjectService } from "../../services/subjectService";
import { useAuth } from "../../context/AuthProvider";

const EditContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateContent } = useContentMutation();
  const { isAdmin } = useAuth();

  // Force refetch on component mount
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    }
  }, [id, queryClient]);

  // Fetch content data
  const { data: content, isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch classes - for admins get all classes, for teachers get only their classes
  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: ["classes", isAdmin ? "all" : "my-classes"],
    queryFn: () => isAdmin ? classService.getAllClasses() : classService.getMyClasses(),
  });

  // Fetch all subjects
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
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

  if (contentLoading || classesLoading || subjectsLoading) return <LoadingSpinner />;

  if (contentError || classesError || subjectsError) {
    const error = contentError || classesError || subjectsError;
    return <Box p="4"><Text color="red">Error loading data: {(error as Error).message}</Text></Box>;
  }

  if (!content) return <Box p="4"><Text color="red">Content not found</Text></Box>;

  // Extract subjects from the response
  const subjects = subjectsData?.data || [];

  return (
    <Card size="4">
      <Heading size="5" mb="4">Edit Learning Content</Heading>
      <ContentForm
        mode="edit"
        initialData={content}
        onSubmit={handleSubmit}
        isSubmitting={updateContent.isPending}
        classes={classes || []}
        subjects={subjects}
      />
    </Card>
  );
};

export default EditContent;