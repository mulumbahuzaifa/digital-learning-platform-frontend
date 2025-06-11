import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  TextField,
  Flex,
  Text,
  Grid,
  Select,
  TextArea,
  Box,
  Switch,
} from "@radix-ui/themes";
import { useState } from "react";

// Subject category options from backend model
const SUBJECT_CATEGORIES = ["compulsory", "elective"] as const;
type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];

// Subject subcategory options from backend model
const SUBJECT_SUBCATEGORIES = [
  "languages",
  "sciences",
  "mathematics",
  "humanities",
  "vocational",
  "arts",
  "technology",
] as const;
type SubjectSubCategory = (typeof SUBJECT_SUBCATEGORIES)[number];

// Schema definitions
const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required").toUpperCase(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  category: z.enum(["compulsory", "elective"]),
  subCategory: z.enum([
    "languages",
    "sciences",
    "mathematics",
    "humanities",
    "vocational",
    "arts",
    "technology",
  ]),
  isActive: z.boolean().default(true),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  mode: "create" | "edit";
  initialData?: Partial<SubjectFormData>;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const SubjectForm = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: SubjectFormProps) => {
  // Use state to track values for select components
  const [category, setCategory] = useState<SubjectCategory>(
    (initialData?.category as SubjectCategory) || "compulsory"
  );
  const [subCategory, setSubCategory] = useState<SubjectSubCategory>(
    (initialData?.subCategory as SubjectSubCategory) || "sciences"
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive ?? true
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      category: (initialData?.category as SubjectCategory) || "compulsory",
      subCategory:
        (initialData?.subCategory as SubjectSubCategory) || "sciences",
      isActive: initialData?.isActive ?? true,
    },
  });

  // Update form values when selects change
  const handleCategoryChange = (value: string) => {
    setCategory(value as SubjectCategory);
    setValue("category", value as SubjectCategory);
  };

  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value as SubjectSubCategory);
    setValue("subCategory", value as SubjectSubCategory);
  };

  const handleIsActiveChange = (checked: boolean) => {
    setIsActive(checked);
    setValue("isActive", checked);
  };

  const onFormSubmit = async (data: SubjectFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Flex direction="column" gap="4">
        <Grid columns="2" gap="4">
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Subject Name *
            </Text>
            <TextField.Root
              placeholder="e.g., Mathematics"
              size="3"
              {...register("name")}
            />
            {errors.name && (
              <Text size="1" color="red" mt="1">
                {errors.name.message}
              </Text>
            )}
          </Box>

          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Subject Code *
            </Text>
            <TextField.Root
              placeholder="e.g., MATH101"
              size="3"
              {...register("code")}
            />
            <Text size="1" color="gray" mt="1">
              Will be converted to uppercase
            </Text>
            {errors.code && (
              <Text size="1" color="red" mt="1">
                {errors.code.message}
              </Text>
            )}
          </Box>
        </Grid>

        <Grid columns="2" gap="4">
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Category *
            </Text>
            <Select.Root
              value={category}
              onValueChange={handleCategoryChange}
              size="3"
            >
              <Select.Trigger variant="soft" radius="medium" />
              <Select.Content position="popper">
                <Select.Group>
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <Select.Item key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.category && (
              <Text size="1" color="red" mt="1">
                {errors.category.message}
              </Text>
            )}
          </Box>

          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Sub-category *
            </Text>
            <Select.Root
              value={subCategory}
              onValueChange={handleSubCategoryChange}
              size="3"
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  {SUBJECT_SUBCATEGORIES.map((subCat) => (
                    <Select.Item key={subCat} value={subCat}>
                      {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.subCategory && (
              <Text size="1" color="red" mt="1">
                {errors.subCategory.message}
              </Text>
            )}
          </Box>
        </Grid>

        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Description
          </Text>
          <TextArea
            placeholder="Describe the subject (optional)"
            size="3"
            {...register("description")}
            style={{ minHeight: "120px" }}
          />
          <Text size="1" color="gray" mt="1">
            Maximum 1000 characters
          </Text>
          {errors.description && (
            <Text size="1" color="red" mt="1">
              {errors.description.message}
            </Text>
          )}
        </Box>

        <Box>
          <Flex align="center" gap="2">
            <Switch
              checked={isActive}
              onCheckedChange={handleIsActiveChange}
              size="3"
            />
            <Text size="2" weight="bold">
              Active Status
            </Text>
          </Flex>
          <Text size="1" color="gray" mt="1">
            {isActive
              ? "Subject is currently active"
              : "Subject is currently inactive"}
          </Text>
        </Box>

        <Flex justify="end" mt="4">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="3"
            variant="solid"
            style={{ width: "100%" }}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Create Subject"
              : "Update Subject"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};
