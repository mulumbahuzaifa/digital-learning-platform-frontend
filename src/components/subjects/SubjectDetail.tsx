import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  Flex, 
  Text, 
  Badge,
  Heading,
  Tabs,
  Button,
  Table,
  Box
} from '@radix-ui/themes';
import { subjectService } from "../../services/subjectService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useNavigate } from "react-router-dom";
import { useSubjectMutation } from "../../hooks/useSubjectMutation";
import DeleteConfirmationDialog from "../../components/ui/DeleteConfirmationDialog";
import { useState } from "react";

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteSubject } = useSubjectMutation();

  const { data: subject, isLoading, error } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubjectById(id!),
  });

  const { data: classes } = useQuery({
    queryKey: ["subjectClasses", id],
    queryFn: () => subjectService.getSubjectClasses(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading subject</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Button variant="ghost" onClick={() => navigate('/admin/subjects')}>
            <ArrowLeftIcon /> Back to Subjects
          </Button>
          <Flex gap="2">
            <Button asChild variant="soft">
              <Link to={`/admin/subjects/${id}/edit`}>
                Edit Subject
              </Link>
            </Button>
            <Button 
              variant="soft" 
              color="red"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Subject
            </Button>
          </Flex>
        </Flex>

        <Tabs.Root defaultValue="details">
          <Tabs.List>
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="classes">Classes</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="details">
              <Flex direction="column" gap="3">
                <Heading size="4">Subject Details</Heading>
                <Card>
                  <Flex direction="column" gap="2">
                    <Text>
                      <Text weight="bold">Name:</Text> {subject.name}
                    </Text>
                    <Text>
                      <Text weight="bold">Code:</Text> <Badge variant="soft">{subject.code}</Badge>
                    </Text>
                    <Text>
                      <Text weight="bold">Description:</Text> {subject.description || 'None'}
                    </Text>
                    {subject.category && (
                      <Text>
                        <Text weight="bold">Category:</Text> {subject.category}
                      </Text>
                    )}
                    {subject.subCategory && (
                      <Text>
                        <Text weight="bold">Sub-Category:</Text> {subject.subCategory}
                      </Text>
                    )}
                    <Text>
                      <Text weight="bold">Created At:</Text> {new Date(subject.createdAt).toLocaleDateString()}
                    </Text>
                    <Text>
                      <Text weight="bold">Last Updated:</Text> {new Date(subject.updatedAt).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Card>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="classes">
              <Flex direction="column" gap="3">
                <Heading size="4">Classes Teaching This Subject</Heading>
                {classes?.length > 0 ? (
                  <Table.Root variant="surface">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Year</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Term</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {classes.map((cls) => (
                        <Table.Row key={cls._id}>
                          <Table.Cell>
                            <Link to={`/admin/classes/${cls._id}`} className="hover:underline">
                              {cls.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{cls.year}</Table.Cell>
                          <Table.Cell>{cls.academicTerm}</Table.Cell>
                          <Table.Cell>
                            {cls.subjects
                              .find(s => s.subject._id === id)
                              ?.teachers.map(t => t.teacher.firstName + ' ' + t.teacher.lastName)
                              .join(', ') || 'None'}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                ) : (
                  <Card>
                    <Text>This subject is not being taught in any classes yet.</Text>
                  </Card>
                )}
              </Flex>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            deleteSubject.mutate(id!);
            navigate('/admin/subjects');
          }}
          title="Confirm Deletion"
          description="Are you sure you want to delete this subject? This action cannot be undone."
          confirmText={deleteSubject.isPending ? 'Deleting...' : 'Delete Subject'}
          isPending={deleteSubject.isPending}
        />
      </Flex>
    </Card>
  );
};

export default SubjectDetail;