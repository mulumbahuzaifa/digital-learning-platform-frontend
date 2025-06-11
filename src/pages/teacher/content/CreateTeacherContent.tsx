import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading } from "@radix-ui/themes";
import { ContentForm, ContentFormData } from "../../../components/content/ContentForm";
import { useContentMutation } from "../../../hooks/useContentMutation";
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const CreateTeacherContent = () => {
  const navigate = useNavigate();
  const { createContent } = useContentMutation();

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
    await createContent.mutateAsync(data);
    navigate("/teacher/content");
  };

  if (isLoadingClasses || isLoadingSubjects) return <LoadingSpinner />;

  return (
    <Card size="4">
      <Heading size="5" mb="4">Create New Content</Heading>
      <ContentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createContent.isPending}
        classes={teacherClasses || []}
        subjects={subjects || []}
      />
    </Card>
  );
};

export default CreateTeacherContent; 