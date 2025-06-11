import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Heading,
  Text,
  Button,
  Box,
  Separator,
  Badge,
  AlertDialog,
} from "@radix-ui/themes";
import {
  DownloadIcon,
  ArrowLeftIcon,
  Pencil1Icon,
  TrashIcon,
  EyeOpenIcon,
  Share1Icon,
  CalendarIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { contentService } from "../../services/contentService";
import { useContentMutation } from "../../hooks/useContentMutation";
import { useAuth } from "../../context/AuthProvider";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Content, ContentType } from "../../types";
import { format } from "date-fns";

// Map content types to colors
const contentTypeColors: Record<ContentType, "blue" | "crimson" | "orange" | "indigo" | "green" | "gray" | "violet" | "amber"> = {
  note: "blue",
  assignment: "crimson",
  slide: "orange",
  video: "indigo",
  audio: "green",
  document: "gray",
  link: "violet",
  quiz: "amber"
};

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isTeacher, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteContent } = useContentMutation();

  // Fetch content data
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  // Check if the user can modify this content
  const canModify = content && (
    isAdmin || 
    (isTeacher && 
     typeof content.uploadedBy !== 'string' && 
     content.uploadedBy._id === user?._id)
  );

  const handleDownload = () => {
    if (!content) return;
    
    // For links, open in new tab
    if (content.type === 'link' && content.description) {
      window.open(content.description, '_blank');
      return;
    }
    
    // For other types, download the file
    if (content.fileUrl) {
      window.open(contentService.getDownloadUrl(content._id), '_blank');
    }
  };

  const handleEdit = () => {
    navigate(`/admin/content/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteContent.mutateAsync(id);
    navigate('/admin/content');
  };

  const handleBack = () => {
    navigate('/admin/content');
  };

  // Format uploaded by
  const getUploaderName = (content: Content) => {
    if (typeof content.uploadedBy === 'string') {
      return "Unknown";
    }
    return `${content.uploadedBy.firstName} ${content.uploadedBy.lastName}`;
  };

  // Get class and subject names
  const getClassName = (content: Content) => {
    return typeof content.class === 'string' 
      ? content.class 
      : content.class.name;
  };

  const getSubjectName = (content: Content) => {
    return typeof content.subject === 'string' 
      ? content.subject 
      : content.subject.name;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading content: {(error as Error).message}</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Button variant="soft" onClick={handleBack}>
            <ArrowLeftIcon />
            Back to Content
          </Button>
          
          <Flex gap="2">
            {content.type !== 'link' && content.fileUrl && (
              <Button onClick={handleDownload}>
                <DownloadIcon />
                Download
              </Button>
            )}
            
            {content.type === 'link' && content.description && (
              <Button onClick={handleDownload}>
                <Share1Icon />
                Open Link
              </Button>
            )}
            
            {canModify && (
              <>
                <Button variant="soft" onClick={handleEdit}>
                  <Pencil1Icon />
                  Edit
                </Button>
                <Button variant="soft" color="red" onClick={() => setShowDeleteDialog(true)}>
                  <TrashIcon />
                  Delete
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        <Box>
          <Badge size="2" color={contentTypeColors[content.type]}>
            {content.type}
          </Badge>
          <Heading size="6" mt="2">
            {content.title}
          </Heading>
        </Box>

        <Separator size="4" />

        <Flex gap="4" wrap="wrap">
          <Flex align="center" gap="1">
            <CalendarIcon />
            <Text size="2">
              {format(new Date(content.createdAt), 'MMM d, yyyy')}
            </Text>
          </Flex>
          
          <Flex align="center" gap="1">
            <PersonIcon />
            <Text size="2">
              {getUploaderName(content)}
            </Text>
          </Flex>
          
          <Flex align="center" gap="1">
            <EyeOpenIcon />
            <Text size="2">
              {content.views || 0} views
            </Text>
          </Flex>
          
          <Flex align="center" gap="1">
            <DownloadIcon />
            <Text size="2">
              {content.downloads || 0} downloads
            </Text>
          </Flex>
        </Flex>

        <Separator size="4" />

        <Box>
          <Text as="div" size="2" weight="bold">
            Description
          </Text>
          <Text as="div" size="3" mt="2">
            {content.description || "No description provided."}
          </Text>
        </Box>

        <Flex gap="4" wrap="wrap">
          <Box>
            <Text as="div" size="2" weight="bold">
              Class
            </Text>
            <Text as="div" size="3">
              {getClassName(content)}
            </Text>
          </Box>
          
          <Box>
            <Text as="div" size="2" weight="bold">
              Subject
            </Text>
            <Text as="div" size="3">
              {getSubjectName(content)}
            </Text>
          </Box>
          
          <Box>
            <Text as="div" size="2" weight="bold">
              Access Level
            </Text>
            <Text as="div" size="3">
              {content.accessLevel.charAt(0).toUpperCase() + content.accessLevel.slice(1)}
            </Text>
          </Box>
        </Flex>

        {content.tags && content.tags.length > 0 && (
          <Box>
            <Text as="div" size="2" weight="bold">
              Tags
            </Text>
            <Flex gap="2" mt="2" wrap="wrap">
              {content.tags.map((tag, index) => (
                <Badge key={index} radius="full" size="1">
                  {tag}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Content>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete "{content.title}"? This action cannot be
            undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="red" 
                onClick={handleDelete}
                disabled={deleteContent.isPending}
              >
                {deleteContent.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default ContentDetail; 