import { Card, Heading } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { ContentForm, ContentFormData } from "../../components/content/ContentForm";
import { useContentMutation } from "../../hooks/useContentMutation";
import { useQuery } from "@tanstack/react-query";
import { classService } from "../../services/classService";
import { subjectService } from "../../services/subjectService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Box, Text } from "@radix-ui/themes";
import { useAuth } from "../../context/AuthProvider";

const CreateContent = () => {
  const navigate = useNavigate();
  const { createContent } = useContentMutation();
  const { isAdmin } = useAuth();

  // Fetch all classes for admins, or just teacher's classes for teachers
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
    await createContent.mutateAsync(data);
    navigate("/admin/content");
  };

  if (classesLoading || subjectsLoading) return <LoadingSpinner />;

  if (classesError || subjectsError) {
    return (
      <Box p="4">
        <Text color="red">
          Error loading data: {((classesError || subjectsError) as Error).message}
        </Text>
      </Box>
    );
  }

  // Extract subjects from the response
  const subjects = subjectsData?.data || [];

  return (
    <Card size="4">
      <Heading size="5" mb="4">Create Learning Content</Heading>
      <ContentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createContent.isPending}
        classes={classes || []}
        subjects={subjects}
      />
    </Card>
  );
};

export default CreateContent;