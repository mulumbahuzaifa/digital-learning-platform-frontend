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
  Tabs,
} from "@radix-ui/themes";
import { PlusIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { contentService } from "../../../services/contentService";
import { classService } from "../../../services/classService";
import { ContentCard } from "../../../components/content/ContentCard";
import { ContentFilter } from "../../../components/content/ContentFilter";
import { ContentFilterParams, Content, Class } from "../../../types";
import { useContentMutation } from "../../../hooks/useContentMutation";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const TeacherContentManagement = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ContentFilterParams>({});
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("my-content");

  // Use deleteContent mutation
  const { deleteContent } = useContentMutation();

  // Fetch teacher's classes
  const { data: teacherClasses, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Fetch content with filters
  const {
    data: content,
    isLoading: isLoadingContent,
    error,
  } = useQuery<Content[]>({
    queryKey: ["teacher-content", filters, selectedTab],
    queryFn: async () => {
      const params = { ...filters };
      
      // For "class-content" tab, we want all content from teacher's classes
      if (selectedTab === "class-content" && teacherClasses && teacherClasses.length > 0) {
        const classIds = teacherClasses.map(c => c._id);
        return contentService.getAllContent({ ...params, class: classIds[0] }); // Can only filter by one class at a time in UI
      }
      
      // For "my-content" tab, we only want content created by this teacher
      return contentService.getMyContent(params);
    },
    enabled: !isLoadingClasses,
  });

  // Handle filter changes
  const handleFilter = (newFilters: ContentFilterParams) => {
    setFilters(newFilters);
  };

  // Handle create new content
  const handleCreateContent = () => {
    navigate("/teacher/content/create");
  };

  // Handle delete content
  const handleConfirmDelete = async () => {
    if (contentToDelete) {
      await deleteContent.mutateAsync(contentToDelete._id);
      setContentToDelete(null);
    }
  };

  if (isLoadingContent || isLoadingClasses) return <LoadingSpinner />;

  if (error) {
    return (
      <Box p="4">
        <Text color="red">Error loading content: {(error as Error).message}</Text>
      </Box>
    );
  }

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Learning Content</Heading>
          <Button onClick={handleCreateContent}>
            <PlusIcon />
            Add Content
          </Button>
        </Flex>

        <Tabs.Root 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value)}
        >
          <Tabs.List>
            <Tabs.Trigger value="my-content">My Content</Tabs.Trigger>
            <Tabs.Trigger value="class-content">Class Content</Tabs.Trigger>
          </Tabs.List>
          
          <Box pt="4">
            <ContentFilter 
              onFilter={handleFilter} 
              initialFilters={filters} 
              classes={teacherClasses || []}
            />

            <Tabs.Content value="my-content">
              {content && content.length > 0 ? (
                <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mt="4">
                  {content.map((item) => (
                    <ContentCard
                      key={item._id}
                      content={item}
                      onDelete={(id) => setContentToDelete(content.find((c) => c._id === id) || null)}
                      editable={true}
                    />
                  ))}
                </Grid>
              ) : (
                <Box p="4" style={{ textAlign: "center" }}>
                  <Text color="gray" size="2">
                    You haven't created any content yet.
                  </Text>
                  <Button onClick={handleCreateContent} mt="2">
                    Create Content
                  </Button>
                </Box>
              )}
            </Tabs.Content>

            <Tabs.Content value="class-content">
              {content && content.length > 0 ? (
                <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mt="4">
                  {content.map((item) => (
                    <ContentCard
                      key={item._id}
                      content={item}
                      onDelete={(id) => setContentToDelete(content.find((c) => c._id === id) || null)}
                      editable={false}
                    />
                  ))}
                </Grid>
              ) : (
                <Box p="4" style={{ textAlign: "center" }}>
                  <Text color="gray" size="2">
                    No content found for your classes. 
                  </Text>
                </Box>
              )}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={!!contentToDelete} onOpenChange={(open) => !open && setContentToDelete(null)}>
        <AlertDialog.Content>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be
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

export default TeacherContentManagement; 