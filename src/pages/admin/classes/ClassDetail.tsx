import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Card, 
  Flex, 
  Heading, 
  Tabs,
  Button,
  AlertDialog,
  Box
} from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import ClassSubjectsTable from "../../../components/classes/ClassSubjectsTable";
import ClassStudentsTable from "../../../components/classes/ClassStudentsTable";
import ClassPrefectsTable from "../../../components/classes/ClassPrefectsTable";
import ClassDetailsCard from "../../../components/classes/ClassDetailsCard";
import { Link } from "react-router-dom";

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: classData, isLoading, error } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => classService.deleteClass(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
      navigate('/admin/classes');
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: string) => classService.removeStudentFromClass(id!, studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class', id] }),
  });

  const removeSubjectMutation = useMutation({
    mutationFn: (subjectId: string) => classService.removeSubjectFromClass(id!, subjectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class', id] }),
  });

  const removeTeacherMutation = useMutation({
    mutationFn: ({subjectId, teacherId}: {subjectId: string, teacherId: string}) => 
      classService.removeTeacherFromSubject(id!, subjectId, teacherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class', id] }),
  });

  const removePrefectMutation = useMutation({
    mutationFn: (prefectId: string) => classService.removePrefect(id!, prefectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class', id] }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading class</div>;
  if (!classData) return <div>Class not found</div>;

  return (
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Button variant="ghost" onClick={() => navigate('/admin/classes')}>
            <ArrowLeftIcon /> Back to Classes
          </Button>
          <Flex gap="2">
            <Button asChild variant="soft">
              <Link to={`/admin/classes/${id}/edit`}>
                Edit Class
              </Link>
            </Button>
            <Button 
              variant="soft" 
              color="red"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete Class
            </Button>
          </Flex>
        </Flex>

        <Tabs.Root defaultValue="subjects">
          <Tabs.List>
            <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
            <Tabs.Trigger value="students">Students</Tabs.Trigger>
            <Tabs.Trigger value="prefects">Prefects</Tabs.Trigger>
            <Tabs.Trigger value="details">Class Details</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="subjects">
              <ClassSubjectsTable
                subjects={classData.subjects}
                classId={classData._id}
                onRemoveSubject={(subjectId) => removeSubjectMutation.mutate(subjectId)}
                onRemoveTeacher={(subjectId, teacherId) => 
                  removeTeacherMutation.mutate({subjectId, teacherId})
                }
              />
            </Tabs.Content>

            <Tabs.Content value="students">
              <ClassStudentsTable
                students={classData.students}
                classId={classData._id}
                onRemoveStudent={(studentId) => removeStudentMutation.mutate(studentId)}
              />
            </Tabs.Content>

            <Tabs.Content value="prefects">
              <ClassPrefectsTable
                prefects={classData.prefects}
                classId={classData._id}
                onRemovePrefect={(prefectId) => removePrefectMutation.mutate(prefectId)}
              />
            </Tabs.Content>

            <Tabs.Content value="details">
              <ClassDetailsCard classData={classData} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Card>
  );
};

export default ClassDetail;