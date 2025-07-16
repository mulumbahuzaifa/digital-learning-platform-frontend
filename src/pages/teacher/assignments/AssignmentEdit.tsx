import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Heading, Flex, Button } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import { assignmentService } from "../../../services/assignmentService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherAssignmentForm, { EditAssignmentFormData } from "../../../components/teacher/TeacherAssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Class, Subject, UpdateAssignmentData, AssignmentStatus, AssignmentType } from "../../../types";

// Define minimal interfaces for type safety
interface ClassSubjectData {
  _id: string;
  name: string;
  code?: string;
}

interface ClassData {
  class: {
    _id: string;
    name: string;
    code?: string;
    level?: string;
    stream?: string;
  };
  enrolledStudents: Array<{
    enrollmentDetails?: {
      subjects?: Array<{
        subject: ClassSubjectData;
      }>;
    };
  }>;
}

// Interface for subject data from the API
interface SubjectData {
  _id: string;
  name: string;
  code?: string;
}

// Interface for class data from the API
interface AssignmentClassData {
  _id: string;
  name: string;
  code?: string;
  level?: string;
  stream?: string;
}

// Interface for assignment data with the properties we need
interface AssignmentData {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  class: string | { _id: string; name: string; code?: string };
  subject: string | { _id: string; name: string; code?: string };
  instructions?: string;
  status: AssignmentStatus;
  assignmentType: AssignmentType;
  allowLateSubmission: boolean;
  visibleToStudents?: boolean;
}

const AssignmentEdit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { updateAssignment, publishAssignment } = useAssignmentMutation();

  // Fetch the assignment details
  const { data: assignment, isLoading: isLoadingAssignment } = useQuery<AssignmentData>({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getAssignmentById(id!),
    enabled: !!id,
  });

  // Fetch classes the teacher is assigned to - without specifying the exact return type
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Build classOptions with subjects array for each class
  const classOptions: Class[] = Array.isArray(classes) 
    ? classes.map((item: any) => {
        // Deduplicate subjects for this class
        const subjectMap = new Map<string, ClassSubjectData>();
        item.enrolledStudents?.forEach((enrollment: any) => {
          enrollment.enrollmentDetails?.subjects?.forEach((subj: any) => {
            const subject = subj.subject;
            if (subject && subject._id && !subjectMap.has(subject._id)) {
              subjectMap.set(subject._id, subject);
            }
          });
        });
        
        // Return a class object with a subjects array
        return {
          _id: item.class._id,
          name: item.class.name,
          code: item.class.code || "",
          level: item.class.level || "",
          stream: item.class.stream || "",
          subjects: Array.from(subjectMap.values()).map((subject) => ({
            subject: {
              _id: subject._id,
              name: subject.name,
              code: subject.code || "",
            },
            teachers: [],
          })),
          prefects: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
      })
    : [];

  // Helper to get subjects for the selected class
  function getSubjectsForClass(classId: string | undefined): Subject[] {
    if (!classId || !classOptions) return [];
    const foundClass = classOptions.find((cls) => cls._id === classId);
    
    // Extract flat Subject[] from ClassSubject[]
    return foundClass && Array.isArray(foundClass.subjects)
      ? foundClass.subjects.map((cs) => ({
          _id: cs.subject._id,
          name: cs.subject.name,
          code: cs.subject.code || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      : [];
  }

  if (isLoadingAssignment || isLoadingClasses) return <LoadingSpinner />;
  if (!assignment) return <div>Assignment not found</div>;
  if (!classOptions) return <div>No classes found</div>;

  // Get class and subject IDs, handling both string and object formats
  const classId = typeof assignment.class === 'string'
    ? assignment.class
    : assignment.class?._id;
  const subjectId = typeof assignment.subject === 'string'
    ? assignment.subject
    : assignment.subject?._id;

  // Prepare initial form data
  function formatDateForInput(dateValue: string | Date | undefined): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  // Map API status to form status
  const mapStatus = (status: AssignmentStatus): "draft" | "published" | "archived" => {
    if (status === "closed") return "archived";
    return status === "published" ? "published" : "draft";
  };

  const initialData: EditAssignmentFormData = {
    title: assignment.title,
    description: assignment.description,
    dueDate: formatDateForInput(assignment.dueDate),
    totalMarks: assignment.totalMarks || 100,
    class: classId || "",
    subject: subjectId || "",
    status: mapStatus(assignment.status),
    instructions: assignment.instructions || '',
    allowLateSubmissions: assignment.allowLateSubmission || false,
    visibleToStudents: assignment.visibleToStudents !== false,
  };

  // Subjects for the selected class
  let subjects = getSubjectsForClass(classId);

  // Ensure the assignment's subject is present in the subjects array
  if (subjectId && !subjects.some((s) => s._id === subjectId)) {
    // If assignment.subject is an object, add it; otherwise, add a placeholder
    if (typeof assignment.subject === 'object' && assignment.subject !== null) {
      const subj = assignment.subject as SubjectData;
      subjects = [...subjects, {
        _id: subj._id,
        name: subj.name,
        code: subj.code || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    } else {
      subjects = [...subjects, {
        _id: subjectId,
        name: `Subject ${subjectId.slice(-4)}`,
        code: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    }
  }

  // Ensure the assignment's class is present in the classes array
  let classesWithAssignment = classOptions;
  if (classId && !classOptions.some((c) => c._id === classId)) {
    // If assignment.class is an object, add it; otherwise, add a placeholder
    if (typeof assignment.class === 'object' && assignment.class !== null) {
      const ac = assignment.class as AssignmentClassData;
      // Create minimal ClassSubject[] from subjects
      const placeholderClassSubjects = subjects.map((subject) => ({
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code || "",
        },
        teachers: [],
      }));
      classesWithAssignment = [
        ...classOptions,
        {
          _id: ac._id,
          name: ac.name || `Class ${classId.slice(-4)}`,
          code: ac.code || "",
          level: ac.level || "",
          stream: ac.stream || "",
          subjects: placeholderClassSubjects,
          prefects: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
    } else {
      // Create minimal ClassSubject[] from subjects
      const placeholderClassSubjects = subjects.map((subject) => ({
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code || "",
        },
        teachers: [],
      }));
      classesWithAssignment = [
        ...classOptions,
        {
          _id: classId,
          name: `Class ${classId.slice(-4)}`,
          code: "",
          level: "",
          stream: "",
          subjects: placeholderClassSubjects,
          prefects: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
    }
  }

  // Handle publishing an assignment
  const handlePublish = async () => {
    try {
      await publishAssignment.mutateAsync(id!);
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      navigate("/teacher/assignments");
    } catch (error) {
      console.error("Failed to publish assignment:", error);
    }
  };

  // Map form status to API status
  const mapFormStatusToApiStatus = (status: "draft" | "published" | "archived"): AssignmentStatus => {
    if (status === "archived") return "closed";
    return status as AssignmentStatus;
  };

  // Handle form submission
  const handleSubmit = async (formData: EditAssignmentFormData) => {
    try {
      // Create the update data with required fields
      const updateData: UpdateAssignmentData = {
        ...formData,
        dueDate: formData.dueDate.toString(),
        status: mapFormStatusToApiStatus(formData.status),
        // Keep the existing assignment type and other fields
        assignmentType: assignment.assignmentType,
        // Map form fields to API fields
        allowLateSubmission: formData.allowLateSubmissions,
      };
      
      await updateAssignment.mutateAsync({
        id: id!,
        data: updateData
      });
      
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      navigate("/teacher/assignments");
    } catch (error) {
      console.error("Failed to update assignment:", error);
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="4">Edit Assignment</Heading>
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
          onSubmit={handleSubmit}
          isSubmitting={updateAssignment.isPending}
          classes={classesWithAssignment}
          subjects={subjects}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentEdit; 