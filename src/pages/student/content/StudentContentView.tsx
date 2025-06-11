import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Text,
  Heading,
  Box,
  Button,
  Badge,
  Separator,
} from "@radix-ui/themes";
import { contentService } from "../../../services/contentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";
import { Content } from "../../../types";
import { DownloadIcon } from "@radix-ui/react-icons";

const StudentContentView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: content, isLoading } = useQuery<Content>({
    queryKey: ["content", id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!content) return;
    try {
      const blob = await contentService.downloadContent(content._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = content.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!content) {
    return (
      <Box p="4">
        <Card size="3">
          <Flex
            direction="column"
            gap="4"
            align="center"
            justify="center"
            p="6"
          >
            <Heading size="5" align="center">
              Content Not Found
            </Heading>
            <Text color="gray" align="center">
              The content you're looking for doesn't exist or has been removed.
            </Text>
            <Button asChild>
              <Link to="/student/content">Back to Content</Link>
            </Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="6">
        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Box>
                <Heading size="5">{content.title}</Heading>
                <Flex gap="2" align="center" mt="1">
                  <Badge color="blue" variant="soft">
                    {content.type}
                  </Badge>
                  <Text size="1" color="gray">
                    Created: {formatDate(content.createdAt)}
                  </Text>
                </Flex>
              </Box>
              <Button variant="soft" color="blue" asChild>
                <Link to="/student/content">Back to Content</Link>
              </Button>
            </Flex>
            <Separator size="4" />
            <Box>
              <Heading size="3" mb="2">
                Description
              </Heading>
              <Text>{content.description}</Text>
            </Box>
            {content.fileUrl && (
              <Box>
                <Heading size="3" mb="2">
                  Content File
                </Heading>
                <Flex direction="column" gap="2">
                  <Button
                    variant="soft"
                    onClick={handleDownload}
                    disabled={!content.fileUrl}
                  >
                    <DownloadIcon width="16" height="16" />
                    <Text>Download {content.title}</Text>
                  </Button>
                  {content.fileSize && (
                    <Text size="1" color="gray">
                      File size: {(content.fileSize / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </Text>
                  )}
                </Flex>
              </Box>
            )}
            {content.tags && content.tags.length > 0 && (
              <Box>
                <Heading size="3" mb="2">
                  Tags
                </Heading>
                <Flex gap="2" wrap="wrap">
                  {content.tags.map((tag) => (
                    <Badge key={tag} variant="soft">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};

export default StudentContentView;
