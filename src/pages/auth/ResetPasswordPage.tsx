import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { useAuthActions } from "../../hooks/useAuthActions";
import AuthLayout from "../../components/layouts/AuthLayout";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";

// Define reset password schema with Zod
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { resetPassword } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    try {
      await resetPassword.mutateAsync({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSubmitted(true);
    } catch {
      // Error handling is done in the mutation
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="container mx-auto px-4 h-full">
          <div className="relative h-[500px] flex items-center justify-center">
            <Card size="3" className="w-full max-w-md">
              <Flex direction="column" p="6" gap="4" align="center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <Text size="3" color="red" align="center">
                  Invalid or missing reset token. Please request a new password
                  reset link.
                </Text>
                <Button variant="outline" size="3" asChild>
                  <Link to="/forgot-password">Request New Reset Link</Link>
                </Button>
              </Flex>
            </Card>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 h-full">
        <div className="relative h-[500px] flex items-center justify-center">
          <Card size="3" className="w-full max-w-md">
            <Flex direction="column" p="6" gap="4">
              <Flex direction="column" mb="4">
                <Heading size="5" mb="1">
                  Reset Password
                </Heading>
                <Text size="2" color="gray">
                  {email
                    ? `Enter your new password for ${email}`
                    : "Enter your new password"}
                </Text>
              </Flex>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Box>
                    <Text
                      as="label"
                      size="2"
                      weight="bold"
                      mb="1"
                      className="block"
                    >
                      New Password
                    </Text>
                    <TextField.Root
                      size="2"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...formRegister("password")}
                    >
                      <TextField.Slot>
                        <Lock className="h-4 w-4 text-gray-500" />
                      </TextField.Slot>
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
                        Password must be at least 8 characters and include
                        uppercase, lowercase, number, and special character
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
                      Confirm Password
                    </Text>
                    <TextField.Root
                      size="2"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      {...formRegister("confirmPassword")}
                    >
                      <TextField.Slot>
                        <Lock className="h-4 w-4 text-gray-500" />
                      </TextField.Slot>
                      <TextField.Slot pr="3">
                        <IconButton
                          size="2"
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeClosedIcon width={20} height={20} />
                          ) : (
                            <EyeOpenIcon width={20} height={20} />
                          )}
                        </IconButton>
                      </TextField.Slot>
                    </TextField.Root>
                    {errors.confirmPassword && (
                      <Text size="1" color="red" mt="1">
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    variant="solid"
                    color="blue"
                    size="3"
                    className="w-full mt-4"
                    disabled={!isValid || resetPassword.isPending}
                  >
                    {resetPassword.isPending ? (
                      <Flex align="center" gap="2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <Text>Resetting Password...</Text>
                      </Flex>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              ) : (
                <Flex direction="column" gap="4" align="center">
                  <Text size="3" align="center">
                    Password has been reset successfully! You will be redirected
                    to the login page shortly.
                  </Text>
                  <Button variant="outline" size="3" asChild>
                    <Link to="/login">Go to Login</Link>
                  </Button>
                </Flex>
              )}

              <Flex direction="column" align="center" mt="4">
                <Box className="relative w-full my-3">
                  <hr className="border-t border-gray-300" />
                  <Text
                    size="1"
                    color="gray"
                    className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white px-2"
                  >
                    Remember your password?
                  </Text>
                </Box>

                <Button variant="outline" size="3" className="w-full" asChild>
                  <Link to="/login">Sign in instead</Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
