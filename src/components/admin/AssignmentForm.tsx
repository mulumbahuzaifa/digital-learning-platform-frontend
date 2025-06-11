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
  Grid
} from '@radix-ui/themes';
import { AssignmentStatus } from "../../types";

// Schema definitions based on form mode
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalMarks: z.number().min(1, "Total marks must be greater than 0"),
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  attachments: z.array(z.string()).optional(),
});

const editAssignmentSchema = createAssignmentSchema.extend({
  status: z.enum(["draft", "published", "closed"]),
});

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
export type EditAssignmentFormData = z.infer<typeof editAssignmentSchema>;

interface AssignmentFormProps {
  mode: "create" | "edit";
  initialData?: EditAssignmentFormData;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  classes: Array<{ _id: string; name: string }>;
  subjects: Array<{ _id: string; name: string }>;
}

// Component for creating a new assignment
const CreateAssignmentForm = ({
  onSubmit,
  isSubmitting,
  classes,
  subjects,
}: Pick<AssignmentFormProps, 'onSubmit' | 'isSubmitting' | 'classes' | 'subjects'>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      totalMarks: 0,
      class: "",
      subject: "",
      attachments: [],
    },
  });

  const selectedClass = watch("class");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <TextField.Root {...register("title")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">Title</Text>
          </TextField.Slot>
          {errors.title && (
            <TextField.Slot color="red">
              <Text size="1" color="red">{errors.title.message}</Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <TextField.Root {...register("description")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">Description</Text>
          </TextField.Slot>
          {errors.description && (
            <TextField.Slot color="red">
              <Text size="1" color="red">{errors.description.message}</Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Grid columns="2" gap="4">
          <TextField.Root {...register("dueDate")} type="datetime-local" size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">Due Date</Text>
            </TextField.Slot>
            {errors.dueDate && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.dueDate.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("totalMarks", { valueAsNumber: true })} type="number" size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">Total Marks</Text>
            </TextField.Slot>
            {errors.totalMarks && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.totalMarks.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <Grid columns="2" gap="4">
          <Flex direction="column" gap="2">
            <Text as="label" size="1" weight="bold">
              Class
            </Text>
            <Select.Root
              value={selectedClass}
              onValueChange={(value) => setValue("class", value)}
              size="2"
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select a class</Select.Label>
                  {classes.map((cls) => (
                    <Select.Item key={cls._id} value={cls._id}>
                      {cls.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.class && (
              <Text size="1" color="red">{errors.class.message}</Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="1" weight="bold">
              Subject
            </Text>
            <Select.Root
              value={watch("subject")}
              onValueChange={(value) => setValue("subject", value)}
              size="2"
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select a subject</Select.Label>
                  {subjects.map((subject) => (
                    <Select.Item key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.subject && (
              <Text size="1" color="red">{errors.subject.message}</Text>
            )}
          </Flex>
        </Grid>

        <Flex justify="end" mt="4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="2"
            variant="solid"
            style={{ width: '100%' }}
          >
            {isSubmitting ? "Saving..." : "Create Assignment"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

// Component for editing an existing assignment
const EditAssignmentForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  classes,
  subjects,
}: Pick<AssignmentFormProps, 'initialData' | 'onSubmit' | 'isSubmitting' | 'classes' | 'subjects'>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditAssignmentFormData>({
    resolver: zodResolver(editAssignmentSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate || "",
      totalMarks: initialData?.totalMarks || 0,
      class: initialData?.class || "",
      subject: initialData?.subject || "",
      attachments: initialData?.attachments || [],
      status: initialData?.status || "draft",
    },
  });

  const selectedClass = watch("class");
  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <TextField.Root {...register("title")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">Title</Text>
          </TextField.Slot>
          {errors.title && (
            <TextField.Slot color="red">
              <Text size="1" color="red">{errors.title.message}</Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <TextField.Root {...register("description")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">Description</Text>
          </TextField.Slot>
          {errors.description && (
            <TextField.Slot color="red">
              <Text size="1" color="red">{errors.description.message}</Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Grid columns="2" gap="4">
          <TextField.Root {...register("dueDate")} type="datetime-local" size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">Due Date</Text>
            </TextField.Slot>
            {errors.dueDate && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.dueDate.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("totalMarks", { valueAsNumber: true })} type="number" size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">Total Marks</Text>
            </TextField.Slot>
            {errors.totalMarks && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.totalMarks.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <Grid columns="2" gap="4">
          <Flex direction="column" gap="2">
            <Text as="label" size="1" weight="bold">
              Class
            </Text>
            <Select.Root
              value={selectedClass}
              onValueChange={(value) => setValue("class", value)}
              size="2"
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select a class</Select.Label>
                  {classes.map((cls) => (
                    <Select.Item key={cls._id} value={cls._id}>
                      {cls.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.class && (
              <Text size="1" color="red">{errors.class.message}</Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="1" weight="bold">
              Subject
            </Text>
            <Select.Root
              value={watch("subject")}
              onValueChange={(value) => setValue("subject", value)}
              size="2"
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select a subject</Select.Label>
                  {subjects.map((subject) => (
                    <Select.Item key={subject._id} value={subject._id}>
                      {subject.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            {errors.subject && (
              <Text size="1" color="red">{errors.subject.message}</Text>
            )}
          </Flex>
        </Grid>

        <Flex direction="column" gap="2">
          <Text as="label" size="1" weight="bold">
            Status
          </Text>
          <Select.Root
            value={status}
            onValueChange={(value: AssignmentStatus) => setValue("status", value)}
            size="2"
          >
            <Select.Trigger variant="soft" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select status</Select.Label>
                <Select.Item value="draft">Draft</Select.Item>
                <Select.Item value="published">Published</Select.Item>
                <Select.Item value="closed">Closed</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
          {errors.status && (
            <Text size="1" color="red">{errors.status.message}</Text>
          )}
        </Flex>

        <Flex justify="end" mt="4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="2"
            variant="solid"
            style={{ width: '100%' }}
          >
            {isSubmitting ? "Saving..." : "Update Assignment"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

// Main component that determines which form to render
export const AssignmentForm = (props: AssignmentFormProps) => {
  const { mode } = props;

  return mode === "create" 
    ? <CreateAssignmentForm 
        onSubmit={props.onSubmit} 
        isSubmitting={props.isSubmitting}
        classes={props.classes}
        subjects={props.subjects}
      />
    : <EditAssignmentForm 
        initialData={props.initialData} 
        onSubmit={props.onSubmit} 
        isSubmitting={props.isSubmitting}
        classes={props.classes}
        subjects={props.subjects}
      />;
}; 