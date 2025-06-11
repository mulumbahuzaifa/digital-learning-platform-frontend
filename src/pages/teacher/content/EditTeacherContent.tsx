import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading } from "@radix-ui/themes";
import { useEffect } from "react";
import { contentService } from "../../../services/contentService";
import { ContentForm, ContentFormData } from "../../../components/content/ContentForm";
import { useContentMutation } from "../../../hooks/useContentMutation";
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const EditTeacherContent = () => {
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
  const { data: content, isLoading: isLoadingContent, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch teacher's classes
  const { data: teacherClasses, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
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
    
    navigate("/teacher/content");
  };

  if (isLoadingContent || isLoadingClasses || isLoadingSubjects) return <LoadingSpinner />;
  if (error) return <div>Error loading content: {(error as Error).message}</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <Card size="4">
      <Heading size="5" mb="4">Edit Content</Heading>
      <ContentForm
        mode="edit"
        onSubmit={handleSubmit}
        initialData={content}
        isSubmitting={updateContent.isPending}
        classes={teacherClasses || []}
        subjects={subjects || []}
      />
    </Card>
  );
};

export default EditTeacherContent; 