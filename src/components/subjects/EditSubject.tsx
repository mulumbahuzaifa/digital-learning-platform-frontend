import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading } from "@radix-ui/themes";
import SubjectForm from "./SubjectForm";
import { subjectService } from "../../services/subjectService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSubjectMutation } from "../../hooks/useSubjectMutation";

const EditSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateSubject } = useSubjectMutation();

  const { data: subject, isLoading } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubjectById(id!),
  });

  const handleSubmit = async (data: any) => {
    await updateSubject.mutateAsync({ id: id!, data });
    navigate(`/admin/subjects/${id}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!subject) return <div>Subject not found</div>;

  return (
    <Card size="4">
      <Heading mb="4">Edit Subject</Heading>
      <SubjectForm 
        defaultValues={{
          name: subject.name,
          code: subject.code,
          description: subject.description,
          category: subject.category,
          subCategory: subject.subCategory,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateSubject.isPending}
      />
    </Card>
  );
};

export default EditSubject;