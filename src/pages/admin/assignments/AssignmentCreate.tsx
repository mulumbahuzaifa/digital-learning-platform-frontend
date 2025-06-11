import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssignmentForm, CreateAssignmentFormData } from "../../../components/admin/AssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Card, Heading, Flex } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const AssignmentCreate = () => {
  const navigate = useNavigate();
  const { createAssignment } = useAssignmentMutation();

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAllClasses(),
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAllSubjects(),
  });

  if (isLoadingClasses || isLoadingSubjects) return <LoadingSpinner />;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Create New Assignment</Heading>
        
        <AssignmentForm
          mode="create"
          onSubmit={async (data: CreateAssignmentFormData) => {
            await createAssignment.mutateAsync({
              ...data,
              dueDate: data.dueDate.toString()
            });
            navigate("/admin/assignments");
          }}
          isSubmitting={createAssignment.isPending}
          classes={classes || []}
          subjects={subjects || []}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentCreate; 