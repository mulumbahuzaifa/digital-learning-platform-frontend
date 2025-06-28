import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssignmentForm, EditAssignmentFormData } from "../../../components/admin/AssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Card, Heading, Flex, Button } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { AssignmentAttachment } from "../../../types";

const AssignmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateAssignment, publishAssignment } = useAssignmentMutation();

  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

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

  if (isLoadingAssignment || isLoadingClasses || isLoadingSubjects) return <LoadingSpinner />;

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  // Create a helper function to safely handle the dueDate conversion
  function formatDateToInputValue(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  }

  // Convert attachments to string array for the form if needed
  const attachmentStrings = assignment.attachments?.map(att => att.name || '') || [];

  const initialData = {
    title: assignment.title,
    description: assignment.description,
    dueDate: formatDateToInputValue(assignment.dueDate),
    totalMarks: assignment.totalMarks,
    class: typeof assignment.class === 'string' ? assignment.class : assignment.class._id,
    subject: typeof assignment.subject === 'string' ? assignment.subject : assignment.subject._id,
    assignmentType: assignment.assignmentType || "homework",
    submissionType: assignment.submissionType || "both",
    difficultyLevel: assignment.difficultyLevel || "moderate",
    allowLateSubmission: assignment.allowLateSubmission ?? true,
    latePenalty: assignment.latePenalty || 0,
    status: assignment.status,
    attachments: attachmentStrings
  };

  const handlePublish = async () => {
    if (id) {
      try {
        await publishAssignment.mutateAsync(id);
        navigate("/admin/assignments");
      } catch (error) {
        console.error("Error publishing assignment:", error);
      }
    }
  };

  const handleUpdate = async (data: EditAssignmentFormData) => {
    if (!id) return;
    
    try {
      // Keep the original attachments when updating
      // or create new ones from the form data if modified
      const attachments: AssignmentAttachment[] = assignment.attachments || [];
      
      await updateAssignment.mutateAsync({
        id,
        data: {
          ...data,
          dueDate: new Date(data.dueDate).toISOString(),
          attachments,
          // Ensure all required fields are present
          assignmentType: data.assignmentType,
          submissionType: data.submissionType,
          difficultyLevel: data.difficultyLevel,
          allowLateSubmission: data.allowLateSubmission,
          latePenalty: data.latePenalty
        }
      });
      
      navigate("/admin/assignments");
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Edit Assignment</Heading>
        
        <AssignmentForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleUpdate}
          isSubmitting={updateAssignment.isPending}
          classes={classes || []}
          subjects={subjects}
        />

        {assignment.status === 'draft' && (
          <Flex justify="end" mt="2">
            <Button 
              color="green"
              onClick={handlePublish}
              disabled={publishAssignment.isPending}
            >
              {publishAssignment.isPending ? 'Publishing...' : 'Publish Assignment'}
            </Button>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default AssignmentEdit; 