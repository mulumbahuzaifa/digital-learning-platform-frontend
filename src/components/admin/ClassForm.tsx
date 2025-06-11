import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  TextField,
  Flex,
  Select,
  Text,
  Card,
  Heading,
  Box,
  Grid,
} from "@radix-ui/themes";

// Schema definitions based on form mode
const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  stream: z.string().min(1, "Stream is required"),
  description: z.string().optional(),
});

const editClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  code: z.string().min(1, "Class code is required"),
  level: z.string().min(1, "Level is required"),
  stream: z.string().min(1, "Stream is required"),
  description: z.string().optional(),
});

export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type EditClassFormData = z.infer<typeof editClassSchema>;

interface ClassFormProps {
  mode: "create" | "edit";
  initialData?: EditClassFormData;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

// Component for creating a new class (without code field)
const CreateClassForm = ({
  onSubmit,
  isSubmitting,
}: Pick<ClassFormProps, "onSubmit" | "isSubmitting">) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      level: "",
      stream: "",
      description: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <TextField.Root {...register("name")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">
              Class Name
            </Text>
          </TextField.Slot>
          {errors.name && (
            <TextField.Slot color="red">
              <Text size="1" color="red">
                {errors.name.message}
              </Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Grid columns="2" gap="4">
          <TextField.Root {...register("level")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">
                Level
              </Text>
            </TextField.Slot>
            {errors.level && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.level.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("stream")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">
                Stream
              </Text>
            </TextField.Slot>
            {errors.stream && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.stream.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <TextField.Root {...register("description")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">
              Description (Optional)
            </Text>
          </TextField.Slot>
          {errors.description && (
            <TextField.Slot color="red">
              <Text size="1" color="red">
                {errors.description.message}
              </Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Text size="1" color="gray" mt="2">
          Note: Class code will be automatically generated based on the level
          and stream.
        </Text>

        <Flex justify="end" mt="4">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="2"
            variant="solid"
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Saving..." : "Create Class"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

// Component for editing an existing class (with code field)
const EditClassForm = ({
  initialData,
  onSubmit,
  isSubmitting,
}: Pick<ClassFormProps, "initialData" | "onSubmit" | "isSubmitting">) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditClassFormData>({
    resolver: zodResolver(editClassSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      level: initialData?.level || "",
      stream: initialData?.stream || "",
      description: initialData?.description || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <Grid columns="2" gap="4">
          <TextField.Root {...register("name")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">
                Class Name
              </Text>
            </TextField.Slot>
            {errors.name && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.name.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("code")} size="3" disabled>
            <TextField.Slot>
              <Text size="1" weight="bold">
                Class Code
              </Text>
            </TextField.Slot>
            {errors.code && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.code.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <Grid columns="2" gap="4">
          <TextField.Root {...register("level")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">
                Level
              </Text>
            </TextField.Slot>
            {errors.level && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.level.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("stream")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">
                Stream
              </Text>
            </TextField.Slot>
            {errors.stream && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.stream.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <TextField.Root {...register("description")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">
              Description (Optional)
            </Text>
          </TextField.Slot>
          {errors.description && (
            <TextField.Slot color="red">
              <Text size="1" color="red">
                {errors.description.message}
              </Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Flex justify="end" mt="4">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="2"
            variant="solid"
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Saving..." : "Update Class"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

// Main component that determines which form to render
export const ClassForm = (props: ClassFormProps) => {
  const { mode } = props;

  return mode === "create" ? (
    <CreateClassForm
      onSubmit={props.onSubmit}
      isSubmitting={props.isSubmitting}
    />
  ) : (
    <EditClassForm
      initialData={props.initialData}
      onSubmit={props.onSubmit}
      isSubmitting={props.isSubmitting}
    />
  );
};
