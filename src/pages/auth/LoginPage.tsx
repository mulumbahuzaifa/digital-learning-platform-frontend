import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";
import AuthLayout from "../../components/layouts/AuthLayout";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";

// Define login schema with Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Get the intended destination from location state or use dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === "admin"
          ? "/admin"
          : user.role === "teacher"
          ? "/teacher"
          : "/student";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    console.log("Submitting:", data);
    setIsSubmitting(true);

    try {
      console.log("Before login mutation");
      const success = await login(data);
      console.log("After login mutation", success);

      // The toast and redirection are now handled inside the login function
      // so we don't need to add additional logic here
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 h-full">
        <div className="relative h-[400px] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r rounded-l-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900" />


            <div className="relative z-20 flex items-center text-2xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-4 h-8 w-8"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              NEWSOMA LEARNING PLATFORM
            </div>

            <div className="relative z-20 mt-10 max-w-md">
              <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-2">
                  Transform Your Education Experience
                </h3>
                <p className="opacity-90 mb-4">
                  Unlock a world of interactive learning materials, personalized
                  assignments, and collaborative tools designed for the modern
                  classroom.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Personalized learning paths
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Interactive content libraries
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Real-time progress tracking
                  </li>
                </ul>
              </div>

              <blockquote className="space-y-2">
                <p className="text-lg italic">
                  &ldquo;This platform has revolutionized how our students
                  engage with learning materials and how teachers track
                  progress.&rdquo;
                </p>
                <footer className="text-sm font-medium opacity-80">
                  Dr. Sarah Johnson, Education Director
                </footer>
              </blockquote>
            </div>
          </div>

          <div className="p-8 bg-white rounded-r-xl shadow-2xl">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              <Card size="3" className="border border-gray-200">
                <Flex direction="column" p="6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Box className="space-y-2">
                      <Text
                        as="label"
                        size="2"
                        weight="medium"
                        className="block text-gray-700"
                      >
                        Email Address
                      </Text>
                      <TextField.Root
                        size="3"
                        placeholder="you@example.com"
                        {...register("email")}
                        className="focus-within:ring-2 focus-within:ring-blue-500"
                      >
                        <TextField.Slot>
                          <Mail className="h-4 w-4 text-gray-500" />
                        </TextField.Slot>
                      </TextField.Root>
                      {errors.email && (
                        <Text size="1" color="red" className="font-medium">
                          {errors.email.message}
                        </Text>
                      )}
                    </Box>

                    <Box className="space-y-2">
                      <Flex justify="between" align="center">
                        <Text
                          as="label"
                          size="2"
                          weight="medium"
                          className="text-gray-700"
                        >
                          Password
                        </Text>
                        <Link to="/forgot-password">
                          <Text
                            size="1"
                            color="blue"
                            className="font-semibold hover:underline"
                          >
                            Forgot password?
                          </Text>
                        </Link>
                      </Flex>
                      <TextField.Root
                        size="3"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        className="focus-within:ring-2 focus-within:ring-blue-500"
                      >
                        <TextField.Slot>
                          <Lock className="h-4 w-4 text-gray-500" />
                        </TextField.Slot>
                        <TextField.Slot>
                          <IconButton
                            size="1"
                            variant="ghost"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeClosedIcon
                                width={16}
                                height={16}
                                className="text-gray-500"
                              />
                            ) : (
                              <EyeOpenIcon
                                width={16}
                                height={16}
                                className="text-gray-500"
                              />
                            )}
                          </IconButton>
                        </TextField.Slot>
                      </TextField.Root>
                      {errors.password && (
                        <Text size="1" color="red" className="font-medium">
                          {errors.password.message}
                        </Text>
                      )}
                    </Box>

                    <Flex gap="2" align="center">
                      <Checkbox
                        size="1"
                        color="indigo"
                        {...register("remember")}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <Text as="label" size="2" className="text-gray-600">
                        Remember me for 30 days
                      </Text>
                    </Flex>

                    <Button
                      type="submit"
                      size="3"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                      disabled={!isValid || isLoading || isSubmitting}
                    >
                      {isLoading || isSubmitting ? (
                        <Flex align="center" justify="center" gap="2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <Text>Signing In...</Text>
                        </Flex>
                      ) : (
                        <Flex align="center" justify="center" gap="2">
                          <LogIn className="h-4 w-4" />
                          <Text>Sign In</Text>
                        </Flex>
                      )}
                    </Button>
                  </form>

            
                </Flex>
              </Card>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Create an account
                </Link>
              </p>

              <p className="text-center text-xs text-gray-500 mt-4">
                By signing in, you agree to our{" "}
                <Link to="/terms" className="text-indigo-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
