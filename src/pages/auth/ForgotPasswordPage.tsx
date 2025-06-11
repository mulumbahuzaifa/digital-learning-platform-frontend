import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { useAuthActions } from "../../hooks/useAuthActions";
import AuthLayout from "../../components/layouts/AuthLayout";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";

// Define forgot password schema with Zod
const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthActions();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword.mutateAsync(data.email);
    } catch {
      // Error handling is done in the mutation
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 h-full">
        <div className="relative h-[500px] flex items-center justify-center">
          <Card size="3" className="w-full max-w-md">
            <Flex direction="column" p="6" gap="4">
              <Flex direction="column" mb="4">
                <Heading size="5" mb="1">
                  Forgot Password
                </Heading>
                <Text size="2" color="gray">
                  Enter your email to receive a password reset link
                </Text>
              </Flex>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  >
                    <TextField.Slot>
                      <Mail className="h-4 w-4 text-gray-500" />
                    </TextField.Slot>
                  </TextField.Root>
                  {errors.email && (
                    <Text size="1" color="red" mt="1">
                      {errors.email.message}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="solid"
                  color="blue"
                  size="3"
                  className="w-full mt-4"
                  disabled={!isValid || forgotPassword.isPending}
                >
                  {forgotPassword.isPending ? (
                    <Flex align="center" gap="2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <Text>Sending Reset Link...</Text>
                    </Flex>
                  ) : (
                    "Send Reset Link"
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
