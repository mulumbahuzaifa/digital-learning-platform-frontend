import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading, Flex, Button } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherAssignmentForm, { EditAssignmentFormData } from "../../../components/teacher/TeacherAssignmentForm";
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

const AssignmentEdit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { updateAssignment, publishAssignment } = useAssignmentMutation();

  // Fetch the assignment details
  const { data: assignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  // Fetch classes the teacher is assigned to
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Extract all subjects from classes where teacher is approved
  const extractSubjectsFromClasses = () => {
    if (!classes) return [];
    if (!assignment) return [];

    const authorizedSubjects: any[] = [];
    const subjectMap = new Map<string, any>();

    // Get the assignment's subject ID
    const assignmentSubjectId = typeof assignment.subject === 'string' 
      ? assignment.subject 
      : assignment.subject?._id;

    console.log('Assignment subject ID:', assignmentSubjectId);

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
          
          // If this is the assignment's subject and we haven't added it yet, add it regardless
          if (subjectData && subjectData._id === assignmentSubjectId && !subjectMap.has(subjectData._id)) {
            console.log('Adding assignment subject to available subjects:', subjectData);
            subjectMap.set(subjectData._id, subjectData);
            authorizedSubjects.push(subjectData);
          }
        });
      }
    });

    // Check if we found the assignment's subject
    if (assignmentSubjectId && !subjectMap.has(assignmentSubjectId)) {
      console.log('Assignment subject not found in any class, will need to add it manually');
      
      // If the assignment subject has detailed info, use it
      if (typeof assignment.subject === 'object' && assignment.subject) {
        const subjectData = {
          _id: assignment.subject._id,
          name: assignment.subject.name || 'Unknown Subject',
          code: assignment.subject.code || '',
        };
        console.log('Adding subject from assignment data:', subjectData);
        subjectMap.set(assignmentSubjectId, subjectData);
        authorizedSubjects.push(subjectData);
      } else {
        // Create a placeholder subject entry
        const subjectData = {
          _id: assignmentSubjectId,
          name: 'Subject ' + assignmentSubjectId.slice(-4),
          code: '',
        };
        console.log('Adding placeholder subject:', subjectData);
        subjectMap.set(assignmentSubjectId, subjectData);
        authorizedSubjects.push(subjectData);
      }
    }

    console.log('Available subjects for form:', authorizedSubjects);
    return authorizedSubjects;
  };

  // Extract subjects from classes
  const subjects = extractSubjectsFromClasses();

  if (isLoadingAssignment || isLoadingClasses) return <LoadingSpinner />;

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  console.log('Assignment data:', assignment);

  // Create a helper function to safely format date for form input
  function formatDateForInput(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DDTHH:MM
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  }

  // Get class and subject IDs, handling both string and object formats
  const classId = typeof assignment.class === 'string' 
    ? assignment.class 
    : assignment.class?._id;
    
  const subjectId = typeof assignment.subject === 'string' 
    ? assignment.subject 
    : assignment.subject?._id;

  console.log('Extracted class ID:', classId);
  console.log('Extracted subject ID:', subjectId);

  // Prepare initial form data
  const initialData: EditAssignmentFormData = {
    title: assignment.title,
    description: assignment.description,
    dueDate: formatDateForInput(assignment.dueDate),
    totalMarks: assignment.totalMarks || 100,
    class: classId,
    subject: subjectId,
    status: assignment.status || 'draft',
    instructions: assignment.instructions || '',
    allowLateSubmissions: assignment.allowLateSubmissions || false,
    visibleToStudents: assignment.visibleToStudents !== false, // Default to true if not specified
  };

  console.log('Initial form data:', initialData);

  // Handle publishing an assignment
  const handlePublish = async () => {
    await publishAssignment.mutateAsync(id!);
    
    // Invalidate teacher-assignments query to ensure table is refreshed
    queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    
    navigate("/teacher/assignments");
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="4">Edit Assignment</Heading>
          
          {/* Only show publish button if assignment is in draft status */}
          {assignment.status === 'draft' && (
            <Button 
              onClick={handlePublish}
              disabled={publishAssignment.isPending}
              color="green"
            >
              {publishAssignment.isPending ? 'Publishing...' : 'Publish Assignment'}
            </Button>
          )}
        </Flex>
        
        <TeacherAssignmentForm
          mode="edit"
          initialData={initialData}
          onSubmit={async (data: EditAssignmentFormData) => {
            console.log('Form submission data:', data);
            await updateAssignment.mutateAsync({
              id: id!,
              data: {
                ...data,
                dueDate: data.dueDate.toString(),
              }
            });
            
            // Invalidate teacher-assignments query to ensure table is refreshed
            queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
            
            navigate("/teacher/assignments");
          }}
          isSubmitting={updateAssignment.isPending}
          classes={classes as Class[] || []}
          subjects={subjects}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentEdit; 