import {
  Card,
  Flex,
  Text,
  IconButton,
  Heading,
  Box,
  Badge,
} from "@radix-ui/themes";
import { Content, ContentType } from "../../types";
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
  TrashIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { contentService } from "../../services/contentService";
import { useAuth } from "../../context/AuthProvider";

// Map content types to icons
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

// Map content types to colors
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

interface ContentCardProps {
  content: Content;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  editable?: boolean;
}

export const ContentCard = ({
  content,
  onDelete,
  showActions = true,
  editable = true,
}: ContentCardProps) => {
  const navigate = useNavigate();
  const { isAdmin, isTeacher, user } = useAuth();

  // Check if user is authorized to edit/delete (admin or teacher who created it)
  const canModify =
    (isAdmin ||
      (isTeacher &&
        typeof content.uploadedBy !== "string" &&
        content.uploadedBy._id === user?._id)) &&
    editable;

  // Navigation handlers
  const handleView = () => {
    // Direct to the correct route based on user role
    if (isAdmin) {
      navigate(`/admin/content/${content._id}`);
    } else if (isTeacher) {
      navigate(`/teacher/content/${content._id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Direct to the correct edit route based on user role
    if (isAdmin) {
      navigate(`/admin/content/edit/${content._id}`);
    } else if (isTeacher) {
      navigate(`/teacher/content/edit/${content._id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(content._id);
    }
  };

  // Download or open link content
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // For links, open in new tab
    if (content.type === "link" && content.description) {
      window.open(content.description, "_blank");
      return;
    }

    // For other types, download the file
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
        window.alert("Failed to download file. Please try again later.");
      }
    } else {
      window.alert("No file available for download");
    }
  };

  // Format metadata
  const subjectName =
    typeof content.subject === "string"
      ? content.subject
      : content.subject?.name || "No Subject";

  const className =
    typeof content.class === "string" 
      ? content.class 
      : content.class?.name || "No Class";

  return (
    <Card
      size="2"
      style={{
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      className="hover:shadow-lg hover:-translate-y-1"
      onClick={handleView}
    >
      {/* Color coded top bar based on content type */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          backgroundColor: `var(--${contentTypeColors[content.type]}-9)`,
        }}
      />

      <Flex
        direction="column"
        gap="2"
        style={{ height: "100%", paddingTop: "12px" }}
      >
        {/* Header with content type and date */}
        <Flex gap="2" align="center" justify="between">
          <Flex gap="2" align="center">
            <Box
              style={{ color: `var(--${contentTypeColors[content.type]}-9)` }}
            >
              {contentTypeIcons[content.type]}
            </Box>
            <Badge
              size="1"
              color={contentTypeColors[content.type]}
              radius="full"
            >
              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
            </Badge>
          </Flex>
          <Text size="1" color="gray">
            {formatDistanceToNow(new Date(content.createdAt), {
              addSuffix: true,
            })}
          </Text>
        </Flex>

        {/* Content title and description */}
        <Heading size="3" trim="normal" style={{ color: "var(--gray-12)" }}>
          {content.title}
        </Heading>

        <Text size="1" color="gray" style={{ flex: 1 }}>
          {content.description && content.description.length > 100
            ? content.description.substring(0, 100) + "..."
            : content.description}
        </Text>

        {/* Class and subject info */}
        <Flex
          direction="column"
          gap="1"
          mt="2"
          style={{
            background: "var(--gray-2)",
            padding: "8px",
            borderRadius: "6px",
          }}
        >
          <Flex justify="between">
            <Text size="1" weight="bold" style={{ color: "var(--green-9)" }}>
              {subjectName}
            </Text>
            <Text size="1" weight="bold" style={{ color: "var(--orange-9)" }}>
              {className}
            </Text>
          </Flex>
          <Flex justify="end" align="center" gap="1">
            <Flex align="center" gap="1">
              <Box>
                <EyeOpenIcon width={12} height={12} />
              </Box>
              <Text size="1" color="gray">
                {content.views || 0}
              </Text>
            </Flex>
            <Box
              style={{
                width: "1px",
                height: "12px",
                background: "var(--gray-5)",
                margin: "0 4px",
              }}
            />
            <Flex align="center" gap="1">
              <Box>
                <DownloadIcon width={12} height={12} />
              </Box>
              <Text size="1" color="gray">
                {content.downloads || 0}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Action buttons */}
        {showActions && (
          <Flex gap="2" mt="2" justify="between">
            <IconButton
              size="1"
              variant="soft"
              onClick={handleDownload}
              title={content.type === "link" ? "Open Link" : "Download"}
              style={{
                borderRadius: "6px",
                backgroundColor: "var(--green-3)",
                color: "var(--green-9)",
              }}
              className="hover:bg-green-5"
            >
              <DownloadIcon width={16} height={16} />
            </IconButton>

            {canModify && (
              <Flex gap="2">
                <IconButton
                  size="1"
                  variant="soft"
                  onClick={handleEdit}
                  title="Edit"
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "var(--blue-3)",
                    color: "var(--blue-9)",
                  }}
                  className="hover:bg-blue-5"
                >
                  <Pencil1Icon width={16} height={16} />
                </IconButton>
                <IconButton
                  size="1"
                  variant="soft"
                  onClick={handleDelete}
                  title="Delete"
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "var(--red-3)",
                    color: "var(--red-9)",
                  }}
                  className="hover:bg-red-5"
                >
                  <TrashIcon width={16} height={16} />
                </IconButton>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
