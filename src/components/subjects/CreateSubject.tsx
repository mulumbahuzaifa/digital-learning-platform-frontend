import { useNavigate } from "react-router-dom";
import { Card, Heading } from "@radix-ui/themes";
import SubjectForm from "./SubjectForm";
import { useSubjectMutation } from "../../hooks/useSubjectMutation";

const CreateSubject = () => {
  const navigate = useNavigate();
  const { createSubject } = useSubjectMutation();

  const handleSubmit = async (data: any) => {
    await createSubject.mutateAsync(data);
    navigate('/admin/subjects');
  };

  return (
    <Card size="4">
      <Heading mb="4">Create New Subject</Heading>
      <SubjectForm 
        onSubmit={handleSubmit}
        isSubmitting={createSubject.isPending}
      />
    </Card>
  );
};

export default CreateSubject;