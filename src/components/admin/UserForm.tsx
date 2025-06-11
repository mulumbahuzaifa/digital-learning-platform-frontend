// src/components/admin/UserForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Button, 
  TextField, 
  Flex, 
  Checkbox, 
  Select, 
  Text,
  Card,
  Heading,
  Box,
  Grid
} from '@radix-ui/themes';
import { User, UserRole } from "../../types";

// Schema definitions
const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["teacher", "student"]), // Only teacher/student for creation
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "teacher", "student"]),
  password: z.string().optional(), // Password is optional for editing
  // password: z.string().min(8, "Password must be at least 8 characters").optional(),
  isVerified: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
// export type UserFormValues = CreateUserFormData | EditUserFormData;

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: EditUserFormData;
  onSubmit: (data: CreateUserFormData | EditUserFormData) => Promise<void | User>;
  isSubmitting: boolean;
}

export const UserForm = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: UserFormProps) => {
  // const schema = mode === "create" ? baseUserSchema : editUserSchema;
  const schema = (mode === "create" ? createUserSchema : editUserSchema) as z.ZodType<
    CreateUserFormData | EditUserFormData
  >;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserFormData | EditUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: mode === "create" ? {
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      password: "",
    } : {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      role: initialData?.role || "student",
      isVerified: initialData?.isVerified || false,
    },
  });

  const role = watch("role");
  const isVerified = mode === "edit" ? watch("isVerified") : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        <Grid columns="2" gap="4">
          <TextField.Root {...register("firstName")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">First Name</Text>
            </TextField.Slot>
            {errors.firstName && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.firstName.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>

          <TextField.Root {...register("lastName")} size="3">
            <TextField.Slot>
              <Text size="1" weight="bold">Last Name</Text>
            </TextField.Slot>
            {errors.lastName && (
              <TextField.Slot color="red">
                <Text size="1" color="red">{errors.lastName.message}</Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Grid>

        <TextField.Root {...register("email")} size="3">
          <TextField.Slot>
            <Text size="1" weight="bold">Email</Text>
          </TextField.Slot>
          {errors.email && (
            <TextField.Slot color="red">
              <Text size="1" color="red">{errors.email.message}</Text>
            </TextField.Slot>
          )}
        </TextField.Root>

        {mode === "create" && (
          <TextField.Root
            type="password"
            {...register("password")}
            size="3"
          >
            <TextField.Slot>
              <Text size="1" weight="bold">Password</Text>
            </TextField.Slot>
            {mode === "create" && errors.password && (
              <TextField.Slot color="red">
                <Text size="1" color="red">
                  {errors.password.message}
                </Text>
              </TextField.Slot>
            )}
          </TextField.Root>
        )}

        <Flex direction="column" gap="2">
          <Text as="label" size="1" weight="bold">
            User Role
          </Text>
          <Select.Root
            value={role}
            onValueChange={(value: UserRole) => setValue("role", value)}
            size="2"
          >
            <Select.Trigger variant="soft" />
            <Select.Content>
              <Select.Group>
                <Select.Label>Select a role</Select.Label>
                <Select.Item value="teacher">Teacher</Select.Item>
                <Select.Item value="student">Student</Select.Item>
                {mode === "edit" && (
                  <Select.Item value="admin">Admin</Select.Item>
                )}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          {errors.role && (
            <Text size="1" color="red">{errors.role.message}</Text>
          )}
        </Flex>

        {mode === "edit" && (
          <Text as="label" size="2">
            <Flex align="center" gap="2" mt="2">
              <Checkbox 
                id="isVerified"
                checked={isVerified}
                onCheckedChange={(checked) => {
                  setValue("isVerified", checked as boolean, { shouldValidate: true });
                }}
                size="2"
              />
              Verified User
            </Flex>
          </Text>
        )}

        <Flex justify="end" mt="4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="2"
            variant="solid"
            style={{ width: '100%' }}
          >
            {isSubmitting ? "Saving..." : "Save User"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};