import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthActions } from "../../hooks/useAuthActions";
import AuthLayout from "../../components/layouts/AuthLayout";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";

// Define register schema with Zod
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["teacher", "student"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthActions();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: "student", // Default role
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register.mutateAsync(data);
      // The success message and navigation are handled in the mutation's onSuccess callback
    } catch {
      // Error handling is done in the mutation
    }
  };

  return (
    <AuthLayout>
      <div className="container relative h-[300px] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            NEWSOMA
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Join our community of educators and learners to transform
                the educational experience.&rdquo;
              </p>
              <footer className="text-sm">Dr. Sarah Johnson</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Card size="3">
              <Flex direction="column" p="4">
                <Flex direction="column" mb="4">
                  <Heading size="5" mb="1">
                    Create an account
                  </Heading>
                  <Text size="2" color="gray">
                    Enter your details to join our platform
                  </Text>
                </Flex>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Flex gap="4">
                    <Box className="flex-1">
                      <Text
                        as="label"
                        size="2"
                        weight="bold"
                        mb="1"
                        className="block"
                      >
                        First Name
                      </Text>
                      <TextField.Root
                        size="2"
                        placeholder="John"
                        {...formRegister("firstName")}
                      ></TextField.Root>
                      {errors.firstName && (
                        <Text size="1" color="red" mt="1">
                          {errors.firstName.message}
                        </Text>
                      )}
                    </Box>

                    <Box className="flex-1">
                      <Text
                        as="label"
                        size="2"
                        weight="bold"
                        mb="1"
                        className="block"
                      >
                        Last Name
                      </Text>
                      <TextField.Root
                        size="2"
                        placeholder="Doe"
                        {...formRegister("lastName")}
                      ></TextField.Root>
                      {errors.lastName && (
                        <Text size="1" color="red" mt="1">
                          {errors.lastName.message}
                        </Text>
                      )}
                    </Box>
                  </Flex>

                  <Box>
                    <Text
                      as="label"
                      size="2"
                      weight="bold"
                      mb="1"
                      className="block"
                    >
                      Email
                    </Text>
                    <TextField.Root
                      size="2"
                      placeholder="your@email.com"
                      type="email"
                      {...formRegister("email")}
                    ></TextField.Root>
                    {errors.email && (
                      <Text size="1" color="red" mt="1">
                        {errors.email.message}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text
                      as="label"
                      size="2"
                      weight="bold"
                      mb="1"
                      className="block"
                    >
                      Password
                    </Text>
                    <TextField.Root
                      size="2"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...formRegister("password")}
                    >
                      <TextField.Slot></TextField.Slot>
                      <TextField.Slot pr="3">
                        <IconButton
                          size="2"
                          type="button"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeClosedIcon width={20} height={20} />
                          ) : (
                            <EyeOpenIcon width={20} height={20} />
                          )}
                        </IconButton>
                      </TextField.Slot>
                    </TextField.Root>
                    {errors.password ? (
                      <Text size="1" color="red" mt="1">
                        {errors.password.message}
                      </Text>
                    ) : (
                      <Text size="1" color="gray" mt="1">
                        At least 8 characters with uppercase, lowercase, and
                        number
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text
                      as="label"
                      size="2"
                      weight="bold"
                      mb="1"
                      className="block"
                    >
                      Role
                    </Text>
                    <Select.Root
                      defaultValue={watch("role")}
                      onValueChange={(value) => {
                        setValue("role", value as "teacher" | "student", {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <Select.Trigger className="w-full" />
                      <Select.Content>
                        <Select.Item value="teacher">Teacher</Select.Item>
                        <Select.Item value="student">Student</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    {errors.role && (
                      <Text size="1" color="red" mt="1">
                        {errors.role.message}
                      </Text>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    variant="solid"
                    color="green"
                    size="3"
                    className="w-full mt-4"
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <Flex align="center" gap="2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <Text>Creating Account...</Text>
                      </Flex>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <Flex direction="column" align="center" mt="4">
                  <Box className="relative w-full my-3">
                    <hr className="border-t border-gray-300" />
                    <Text
                      size="1"
                      color="gray"
                      className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white px-2"
                    >
                      Already have an account?
                    </Text>
                  </Box>

                  <Button variant="outline" size="3" className="w-full" asChild>
                    <Link to="/login">Sign in instead</Link>
                  </Button>
                </Flex>
              </Flex>
            </Card>

            <Text size="1" color="gray" align="center" className="mt-4">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-indigo-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
