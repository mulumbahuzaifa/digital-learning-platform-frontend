import { useNavigate } from "react-router-dom";
import { SubjectForm } from "../../../components/admin/SubjectForm";
import { Card } from "@radix-ui/themes";
import { useSubjectMutation } from "../../../hooks/useSubjectMutation";
import { CreateSubjectData } from "../../../types";

const CreateSubject = () => {
  const navigate = useNavigate();
  const { createSubject } = useSubjectMutation();

  const handleSubmit = async (data: CreateSubjectData) => {
    if (!createSubject) {
      console.error("User does not have permission to create subjects");
      return;
    }

    try {
      await createSubject.mutateAsync(data);
      navigate("/admin/subjects");
    } catch (error) {
      console.error("Failed to create subject:", error);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Create New Subject
          </h2>
        </div>
        <SubjectForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={createSubject?.isPending || false}
        />
      </div>
    </Card>
  );
};

export default CreateSubject;
