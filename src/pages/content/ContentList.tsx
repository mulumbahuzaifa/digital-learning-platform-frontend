import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Flex,
  Heading,
  Button,
  Grid,
  Text,
  Box,
  AlertDialog,
  Badge,
} from "@radix-ui/themes";
import { PlusIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { contentService } from "../../services/contentService";
import { ContentCard } from "../../components/content/ContentCard";
import { ContentFilter } from "../../components/content/ContentFilter";
import { ContentFilterParams, Content } from "../../types";
import { useContentMutation } from "../../hooks/useContentMutation";
import { useAuth } from "../../context/AuthProvider";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ContentList = () => {
  const navigate = useNavigate();
  const { isAdmin, isTeacher } = useAuth();
  const [filters, setFilters] = useState<ContentFilterParams>({});
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);

  // Use deleteContent mutation
  const { deleteContent } = useContentMutation();

  // Fetch content with filters
  const {
    data: content,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["content", filters],
    queryFn: () => contentService.getAllContent(filters),
  });

  // Handle filter changes
  const handleFilter = (newFilters: ContentFilterParams) => {
    setFilters(newFilters);
  };

  // Handle create new content
  const handleCreateContent = () => {
    navigate("/admin/content/create");
  };

  // Handle delete content
  const handleConfirmDelete = async () => {
    if (contentToDelete) {
      await deleteContent.mutateAsync(contentToDelete._id);
      setContentToDelete(null);
      refetch(); // Refresh the content list after deletion
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Box p="4">
        <Text color="red">
          Error loading content: {(error as Error).message}
        </Text>
      </Box>
    );
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Learning Content</Heading>
          {(isAdmin || isTeacher) && (
            <Button onClick={handleCreateContent}>
              <PlusIcon />
              Add Content
            </Button>
          )}
        </Flex>

        <ContentFilter onFilter={handleFilter} initialFilters={filters} />

        {/* Content Stats */}
        <Flex gap="4" wrap="wrap">
          <Card size="1" style={{ minWidth: "150px" }}>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Total Content</Text>
              <Heading size="4">{content?.length || 0}</Heading>
            </Flex>
          </Card>
          
          {/* Count by type */}
          <Card size="1" style={{ minWidth: "150px" }}>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Documents</Text>
              <Heading size="4">
                {content?.filter(item => item.type === "document").length || 0}
              </Heading>
            </Flex>
          </Card>
          
          <Card size="1" style={{ minWidth: "150px" }}>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Assignments</Text>
              <Heading size="4">
                {content?.filter(item => item.type === "assignment").length || 0}
              </Heading>
            </Flex>
          </Card>
        </Flex>

        {/* Search bar for quick filtering */}
        <Box>
          <TextField.Root>
            <TextField.Slot>
              <MagnifyingGlassIcon height={16} width={16} />
            </TextField.Slot>
            <TextField.Input 
              placeholder="Quick search..." 
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </TextField.Root>
        </Box>

        {content && content.length > 0 ? (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {content.map((item) => (
              <ContentCard
                key={item._id}
                content={item}
                onDelete={(id) =>
                  setContentToDelete(content.find((c) => c._id === id) || null)
                }
              />
            ))}
          </Grid>
        ) : (
          <Box p="4" style={{ textAlign: "center" }}>
            <Text color="gray" size="2">
              No content found matching the current filters.
            </Text>
          </Box>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={!!contentToDelete}
        onOpenChange={(open) => !open && setContentToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete "{contentToDelete?.title}"? This
            action cannot be undone.
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
                onClick={handleConfirmDelete}
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

// TextField component for the search input
const TextField = {
  Root: ({ children, ...props }: React.ComponentProps<typeof Box>) => (
    <Box
      {...props}
      style={{
        display: "flex",
        borderRadius: "6px",
        padding: "8px 12px",
        border: "1px solid var(--gray-5)",
        backgroundColor: "white",
        ...props.style,
      }}
    >
      {children}
    </Box>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      style={{
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "14px",
        backgroundColor: "transparent",
        ...props.style,
      }}
    />
  ),
  Slot: ({ children, ...props }: React.ComponentProps<typeof Box>) => (
    <Box
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        paddingRight: "8px",
        color: "var(--gray-9)",
        ...props.style,
      }}
    >
      {children}
    </Box>
  ),
};

export default ContentList;
