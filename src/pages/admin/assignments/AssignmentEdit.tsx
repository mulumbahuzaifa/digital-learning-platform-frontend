import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssignmentForm, EditAssignmentFormData } from "../../../components/admin/AssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Card, Heading, Flex } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const AssignmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateAssignment } = useAssignmentMutation();

  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAllClasses(),
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
  });

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

  const initialData = {
    title: assignment.title,
    description: assignment.description,
    dueDate: formatDateToInputValue(assignment.dueDate),
    totalMarks: assignment.totalMarks,
    class: typeof assignment.class === 'string' ? assignment.class : assignment.class._id,
    subject: typeof assignment.subject === 'string' ? assignment.subject : assignment.subject._id,
    status: assignment.status,
    attachments: assignment.attachments
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Edit Assignment</Heading>
        
        <AssignmentForm
          mode="edit"
          initialData={initialData}
          onSubmit={async (data: EditAssignmentFormData) => {
            await updateAssignment.mutateAsync({
              id: id!,
              data: {
                ...data,
                dueDate: new Date(data.dueDate)
              }
            });
            navigate("/admin/assignments");
          }}
          isSubmitting={updateAssignment.isPending}
          classes={classes || []}
          subjects={subjects || []}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentEdit; 