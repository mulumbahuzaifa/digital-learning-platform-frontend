import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  TextField,
  TextArea,
  Flex,
  Box,
  Text,
} from "@radix-ui/themes";
import { CreateSubjectData } from "../../types";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  defaultValues?: Partial<SubjectFormValues>;
  onSubmit: (data: CreateSubjectData) => Promise<void>;
  isSubmitting: boolean;
}

const SubjectForm = ({ defaultValues, onSubmit, isSubmitting }: SubjectFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="label" size="2" weight="bold">
            Subject Name
          </Text>
          <TextField.Root mt="1">
            <TextField.Input
              placeholder="Enter subject name"
              {...register("name")}
            />
          </TextField.Root>
          {errors.name && (
            <Text size="1" color="red" mt="1">
              {errors.name.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text as="label" size="2" weight="bold">
            Subject Code
          </Text>
          <TextField.Root mt="1">
            <TextField.Input
              placeholder="Enter subject code"
              {...register("code")}
            />
          </TextField.Root>
          {errors.code && (
            <Text size="1" color="red" mt="1">
              {errors.code.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text as="label" size="2" weight="bold">
            Description (Optional)
          </Text>
          <TextArea
            mt="1"
            placeholder="Enter subject description"
            {...register("description")}
          />
        </Box>

        <Flex gap="3">
          <Box flexGrow="1">
            <Text as="label" size="2" weight="bold">
              Category (Optional)
            </Text>
            <TextField.Root mt="1">
              <TextField.Input
                placeholder="Enter category"
                {...register("category")}
              />
            </TextField.Root>
          </Box>

          <Box flexGrow="1">
            <Text as="label" size="2" weight="bold">
              Sub-Category (Optional)
            </Text>
            <TextField.Root mt="1">
              <TextField.Input
                placeholder="Enter sub-category"
                {...register("subCategory")}
              />
            </TextField.Root>
          </Box>
        </Flex>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Subject"}
        </Button>
      </Flex>
    </form>
  );
};

export default SubjectForm;