import { useNavigate } from "react-router-dom";
import { ClassForm, CreateClassFormData } from "../../../components/admin/ClassForm";
import { useClassMutation } from "../../../hooks/useClassMutation";
import { Card, Heading, Flex } from '@radix-ui/themes';

const ClassCreate = () => {
  const navigate = useNavigate();
  const { createClass } = useClassMutation();

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Create New Class</Heading>
        
        <ClassForm
          mode="create"
          onSubmit={async (data: CreateClassFormData) => {
            await createClass.mutateAsync(data);
            navigate("/admin/classes");
          }}
          isSubmitting={createClass.isPending}
        />
      </Flex>
    </Card>
  );
};

export default ClassCreate; 