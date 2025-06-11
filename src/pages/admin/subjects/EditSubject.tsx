import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  SubjectForm,
  SubjectFormData,
} from "../../../components/admin/SubjectForm";
import { subjectService } from "../../../services/subjectService";
import { Card } from "@radix-ui/themes";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useSubjectMutation } from "../../../hooks/useSubjectMutation";
import { Subject, UpdateSubjectData } from "../../../types";
import { useEffect } from "react";

const EditSubject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Force refetch on component mount to ensure fresh data
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
    }
  }, [id, queryClient]);

  const {
    data: subjectResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubjectById(id!),
    enabled: !!id,
    staleTime: 0, // Always treat data as stale to ensure fresh fetches
  });

  const { updateSubject } = useSubjectMutation();

  // Transform Subject from backend to form data type
  const mapSubjectToFormData = (
    subject: Subject
  ): Partial<SubjectFormData> => ({
    name: subject.name,
    code: subject.code,
    description: subject.description,
    category:
      subject.category === "compulsory" || subject.category === "elective"
        ? subject.category
        : "compulsory",
    subCategory: [
      "languages",
      "sciences",
      "mathematics",
      "humanities",
      "vocational",
      "arts",
      "technology",
    ].includes(subject.subCategory || "")
      ? (subject.subCategory as any)
      : "sciences",
    isActive: subject.isActive,
  });

  const handleSubmit = async (data: UpdateSubjectData) => {
    if (!updateSubject || !id) {
      console.error(
        "User does not have permission to update subjects or missing subject ID"
      );
      return;
    }

    try {
      await updateSubject.mutateAsync({ id, data });
      navigate("/admin/subjects");
    } catch (error) {
      console.error("Failed to update subject:", error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading subject</div>;
  if (!subjectResponse?.data) return <div>Subject not found</div>;

  const initialFormData = mapSubjectToFormData(subjectResponse.data);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Edit Subject</h2>
        </div>
        <SubjectForm
          mode="edit"
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isSubmitting={updateSubject?.isPending || false}
        />
      </div>
    </Card>
  );
};

export default EditSubject;
