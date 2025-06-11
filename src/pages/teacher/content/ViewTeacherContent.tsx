import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Heading,
  Text,
  Box,
  Button,
  Separator,
  Badge,
  IconButton,
} from "@radix-ui/themes";
import {
  FileTextIcon,
  BookmarkIcon,
  FrameIcon,
  VideoIcon,
  SpeakerLoudIcon,
  FileIcon,
  Link1Icon,
  MixerHorizontalIcon,
  DownloadIcon,
  Pencil1Icon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { ContentType } from "../../../types";
import { contentService } from "../../../services/contentService";
import { useAuth } from "../../../context/AuthProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

// Map content types to icons and colors
const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  note: <FileTextIcon width={20} height={20} />,
  assignment: <BookmarkIcon width={20} height={20} />,
  slide: <FrameIcon width={20} height={20} />,
  video: <VideoIcon width={20} height={20} />,
  audio: <SpeakerLoudIcon width={20} height={20} />,
  document: <FileIcon width={20} height={20} />,
  link: <Link1Icon width={20} height={20} />,
  quiz: <MixerHorizontalIcon width={20} height={20} />,
};

const contentTypeColors: Record<
  ContentType,
  "green" | "orange" | "blue" | "indigo" | "red" | "gray" | "purple" | "amber"
> = {
  note: "blue",
  assignment: "orange",
  slide: "green",
  video: "indigo",
  audio: "red",
  document: "gray",
  link: "purple",
  quiz: "amber",
};

const ViewTeacherContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch content data
  const {
    data: content,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["content", id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  // Format dates
  const formatDate = (dateString: Date | string) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Check if user can edit content
  const canEdit =
    content &&
    typeof content.uploadedBy !== "string" &&
    content.uploadedBy._id === user?._id;

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/teacher/content/edit/${id}`);
  };

  // Handle download button click
  const handleDownload = async () => {
    if (!content) return;

    // For link type, open in new tab
    if (content.type === "link" && content.description) {
      window.open(content.description, "_blank");
      return;
    }

    // For other types with file, download the file
    if (content.fileUrl) {
      try {
        // Using direct blob download method with proper authentication
        const blob = await contentService.downloadContent(content._id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", content.title || `${content.type}_file`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
        alert("Failed to download file. Please try again later.");
      }
    } else {
      alert("No file available for download");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div>Error loading content: {(error as Error).message}</div>;
  if (!content) return <div>Content not found</div>;

  // Format subject and class names
  const subjectName =
    typeof content.subject === "string"
      ? content.subject
      : content.subject?.name || "";

  const className =
    typeof content.class === "string"
      ? content.class
      : content.class?.name || "";

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        {/* Header with back button */}
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <IconButton
              variant="ghost"
              size="1"
              onClick={() => navigate("/teacher/content")}
            >
              <ArrowLeftIcon />
            </IconButton>
            <Heading size="5">Content Details</Heading>
          </Flex>
          <Flex gap="2">
            {canEdit && (
              <Button onClick={handleEdit} variant="soft">
                <Pencil1Icon />
                Edit
              </Button>
            )}
            <Button onClick={handleDownload} color="green">
              <DownloadIcon />
              {content.type === "link" ? "Open Link" : "Download"}
            </Button>
          </Flex>
        </Flex>

        <Separator size="4" />

        {/* Content details */}
        <Flex direction="column" gap="4">
          <Flex gap="2" align="center">
            <Box
              style={{ color: `var(--${contentTypeColors[content.type]}-9)` }}
            >
              {contentTypeIcons[content.type]}
            </Box>
            <Badge color={contentTypeColors[content.type]} radius="full">
              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
            </Badge>
            <Badge variant="outline" radius="full">
              {content.accessLevel}
            </Badge>
            {content.isPublic && (
              <Badge color="green" radius="full">
                Public
              </Badge>
            )}
          </Flex>

          <Heading size="4">{content.title}</Heading>

          {content.description && (
            <Text size="2" style={{ whiteSpace: "pre-wrap" }}>
              {content.description}
            </Text>
          )}

          <Card variant="surface" style={{ padding: "16px" }}>
            <Flex justify="between">
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  Subject
                </Text>
                <Text size="2" weight="bold">
                  {subjectName}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  Class
                </Text>
                <Text size="2" weight="bold">
                  {className}
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  Uploaded On
                </Text>
                <Text size="2">{formatDate(content.createdAt)}</Text>
              </Flex>
            </Flex>
          </Card>

          {content.tags && content.tags.length > 0 && (
            <Flex wrap="wrap" gap="2">
              {content.tags.map((tag, index) => (
                <Badge key={index} variant="surface" radius="full">
                  {tag}
                </Badge>
              ))}
            </Flex>
          )}

          {/* File preview or link info */}
          {content.type === "link" ? (
            <Card variant="surface">
              <Flex direction="column" gap="2" p="4">
                <Text size="2" weight="bold">
                  External Link
                </Text>
                <Box
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--gray-3)",
                    borderRadius: "6px",
                    wordBreak: "break-all",
                  }}
                >
                  <Link1Icon />
                  <Text size="1" style={{ marginLeft: "8px" }}>
                    <a
                      href={content.description}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--blue-9)" }}
                    >
                      {content.description}
                    </a>
                  </Text>
                </Box>
              </Flex>
            </Card>
          ) : content.fileUrl ? (
            <Card variant="surface">
              <Flex direction="column" gap="2" p="4">
                <Text size="2" weight="bold">
                  File Details
                </Text>
                <Flex gap="4">
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      File Name
                    </Text>
                    <Text size="2">{content.title || "Unknown"}</Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      File Type
                    </Text>
                    <Text size="2">
                      {content.fileType || content.type || "Unknown"}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      Downloads
                    </Text>
                    <Text size="2">{content.downloads || 0}</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
};

export default ViewTeacherContent;
