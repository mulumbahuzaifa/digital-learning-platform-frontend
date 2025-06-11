import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading, Flex } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherAssignmentForm, { CreateAssignmentFormData } from "../../../components/teacher/TeacherAssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Class } from "../../../types/class";
import { Subject } from "../../../types";

interface ClassSubject {
  subject: any;
  teachers?: Array<{
    teacher: any;
    status: string;
    isLeadTeacher?: boolean;
    _id: string;
  }>;
  _id: string;
}

const AssignmentCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createAssignment } = useAssignmentMutation();

  // Fetch classes the teacher is assigned to
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Extract all subjects from classes where teacher is approved
  const extractSubjectsFromClasses = () => {
    if (!classes) return [];

    const authorizedSubjects: any[] = [];
    const subjectMap = new Map<string, any>();

    // Loop through each class
    classes.forEach((classData: any) => {
      if (classData.subjects) {
        // Loop through each subject in the class
        classData.subjects.forEach((classSubject: ClassSubject) => {
          // Check if this subject has an approved teacher entry for the current teacher
          const isApprovedTeacher = classSubject.teachers && 
            classSubject.teachers.some(teacher => teacher.status === 'approved');
          
          // Extract subject data
          const subjectData = typeof classSubject.subject === 'string'
            ? { _id: classSubject.subject, name: 'Unknown', code: '' }
            : classSubject.subject;
          
          // If teacher is approved for this subject and we haven't added it yet
          if (isApprovedTeacher && subjectData && !subjectMap.has(subjectData._id)) {
            subjectMap.set(subjectData._id, subjectData);
            authorizedSubjects.push(subjectData);
          }
        });
      }
    });

    return authorizedSubjects;
  };

  // Extract subjects from classes
  const subjects = extractSubjectsFromClasses();

  if (isLoadingClasses) return <LoadingSpinner />;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="4">Create New Assignment</Heading>
        
        <TeacherAssignmentForm
          mode="create"
          onSubmit={async (data: CreateAssignmentFormData) => {
            await createAssignment.mutateAsync({
              ...data,
              dueDate: data.dueDate.toString(),
            });
            
            // Invalidate teacher-assignments query to ensure table is refreshed
            queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
            
            // Navigate back to assignments list
            navigate("/teacher/assignments");
          }}
          isSubmitting={createAssignment.isPending}
          classes={classes as Class[] || []}
          subjects={subjects}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentCreate; 