import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading, Flex } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherAssignmentForm, { CreateAssignmentFormData } from "../../../components/teacher/TeacherAssignmentForm";
import { useAssignmentMutation } from "../../../hooks/useAssignmentMutation";
import { Class, Subject, CreateAssignmentData, AssignmentType } from "../../../types";

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

const AssignmentCreate = () => {
  const navigate = useNavigate();
  const { createAssignment } = useAssignmentMutation();

  // Fetch classes the teacher is assigned to
  const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassData[]>({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Build classOptions with subjects array for each class
  const classOptions: Class[] = Array.isArray(classes) 
    ? classes.map((item: ClassData) => {
        // Deduplicate subjects for this class
        const subjectMap = new Map<string, ClassSubjectData>();
        item.enrolledStudents?.forEach((enrollment) => {
          enrollment.enrollmentDetails?.subjects?.forEach((subj) => {
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
            teachers: []
          })),
          prefects: [],
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
      })
    : [];

  // Extract unique subjects from all enrolled students in all classes
  const subjectMap = new Map<string, ClassSubjectData>();
  if (Array.isArray(classes)) {
    classes.forEach((item: ClassData) => {
      item.enrolledStudents?.forEach((enrollment) => {
        enrollment.enrollmentDetails?.subjects?.forEach((subj) => {
          const subject = subj.subject;
          if (subject && subject._id && !subjectMap.has(subject._id)) {
            subjectMap.set(subject._id, subject);
          }
        });
      });
    });
  }
  
  const subjectOptions: Subject[] = Array.from(subjectMap.values()).map((subject) => ({
    _id: subject._id,
    name: subject.name,
    code: subject.code || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Handle form submission
  const handleSubmit = async (data: CreateAssignmentFormData) => {
    try {
      // Create the assignment data with required fields
      const assignmentData: CreateAssignmentData = {
        ...data,
        dueDate: data.dueDate.toString(),
        assignmentType: "homework" as AssignmentType, // Default assignment type
        submissionType: "text", // Default submission type
      };
      
      await createAssignment.mutateAsync(assignmentData);
      navigate("/teacher/assignments");
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  if (isLoadingClasses) return <LoadingSpinner />;

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="4">Create New Assignment</Heading>
        <TeacherAssignmentForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={createAssignment.isPending}
          classes={classOptions}
          subjects={subjectOptions}
        />
      </Flex>
    </Card>
  );
};

export default AssignmentCreate; 