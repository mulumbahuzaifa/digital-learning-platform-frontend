import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ClassForm, EditClassFormData } from "../../../components/admin/ClassForm";
import { classService } from "../../../services/classService";
import { Card, Heading, Flex } from '@radix-ui/themes';
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useClassMutation } from "../../../hooks/useClassMutation";

const ClassEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: classData, isLoading, error } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
    enabled: !!id,
  });

  const { updateClass } = useClassMutation();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading class</div>;
  if (!classData) return <div>Class not found</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Edit Class: {classData.name}</Heading>
        
        <ClassForm
          mode="edit"
          initialData={classData as EditClassFormData}
          onSubmit={async (data: EditClassFormData) => {
            await updateClass.mutateAsync({ id: id!, data });
            navigate(`/admin/classes`);
          }}
          isSubmitting={updateClass.isPending}
        />
      </Flex>
    </Card>
  );
};

export default ClassEdit; 