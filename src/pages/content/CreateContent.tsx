import { Card, Heading } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { ContentForm, ContentFormData } from "../../components/content/ContentForm";
import { useContentMutation } from "../../hooks/useContentMutation";

const CreateContent = () => {
  const navigate = useNavigate();
  const { createContent } = useContentMutation();

  const handleSubmit = async (data: ContentFormData) => {
    await createContent.mutateAsync(data);
    navigate("/admin/content");
  };

  return (
    <Card size="4">
      <Heading size="5" mb="4">Create Learning Content</Heading>
      <ContentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createContent.isPending}
      />
    </Card>
  );
};

export default CreateContent; 