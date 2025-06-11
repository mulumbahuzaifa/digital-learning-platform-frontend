import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthActions } from "../../hooks/useAuthActions";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthActions();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setVerificationStatus("error");
        setErrorMessage("Invalid verification link");
        return;
      }

      try {
        const success = await verifyEmail.mutateAsync(token);
        if (success) {
          setVerificationStatus("success");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to verify email"
        );
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail, navigate]);

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 h-full">
        <div className="relative h-[500px] flex items-center justify-center">
          <Card size="3" className="w-full max-w-md">
            <Flex direction="column" align="center" p="6" gap="4">
              {verificationStatus === "loading" && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <Heading size="5" align="center">
                    Verifying your email...
                  </Heading>
                  <Text size="2" color="gray" align="center">
                    Please wait while we verify your email address.
                  </Text>
                </>
              )}

              {verificationStatus === "success" && (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <Heading size="5" align="center">
                    Email Verified Successfully!
                  </Heading>
                  <Text size="2" color="gray" align="center">
                    Your email has been verified. You will be redirected to the
                    login page shortly.
                  </Text>
                </>
              )}

              {verificationStatus === "error" && (
                <>
                  <XCircle className="h-12 w-12 text-red-500" />
                  <Heading size="5" align="center">
                    Verification Failed
                  </Heading>
                  <Text size="2" color="gray" align="center">
                    {errorMessage}
                  </Text>
                  <Box className="mt-4">
                    <Text size="2" color="gray" align="center">
                      Please try again or contact support if the problem
                      persists.
                    </Text>
                  </Box>
                </>
              )}
            </Flex>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
