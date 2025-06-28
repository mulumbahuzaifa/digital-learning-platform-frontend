import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssignmentForm, CreateAssignmentFormData } from "../../../components/admin/AssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Card, Heading, Flex, Text } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { AssignmentAttachment } from "../../../types";

const AssignmentCreate = () => {
  const navigate = useNavigate();
  const { createAssignment } = useAssignmentMutation();

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAllClasses(),
  });

  const { data: subjectsResponse, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Extract subjects array from the response
  const subjects = subjectsResponse?.data || [];

  if (isLoadingClasses || isLoadingSubjects) return <LoadingSpinner />;

  const handleSubmit = async (data: CreateAssignmentFormData) => {
    try {
      // Convert string attachments to AssignmentAttachment objects
      const attachments: AssignmentAttachment[] = data.attachments?.map(attachment => ({
        type: 'file',
        name: attachment,
        path: attachment
      })) || [];

      await createAssignment.mutateAsync({
        ...data,
        dueDate: data.dueDate.toString(),
        attachments,
        // Ensure required fields are present
        assignmentType: data.assignmentType || 'homework',
        submissionType: data.submissionType || 'both',
        difficultyLevel: data.difficultyLevel || 'moderate',
        allowLateSubmission: data.allowLateSubmission ?? true,
        latePenalty: data.latePenalty || 0
      });
      
      navigate("/admin/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Create New Assignment</Heading>
        
        <Text color="gray" size="2">
          Fill out the form below to create a new assignment. Required fields are marked with an asterisk (*).
        </Text>
        
        <AssignmentForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={createAssignment.isPending}
          classes={classes || []}
          subjects={subjects}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentCreate; 