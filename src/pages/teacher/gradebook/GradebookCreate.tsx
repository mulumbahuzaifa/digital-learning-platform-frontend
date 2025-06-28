import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from '@radix-ui/themes';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherGradebookForm from "../../../components/teacher/TeacherGradebookForm";
import { useGradebookMutation } from "../../../hooks/useGradebookMutation";
import { CreateGradebookData, UpdateGradebookData } from "../../../types";
import { useAuthActions } from "../../../hooks/useAuthActions";

const GradebookCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createGradebook } = useGradebookMutation();
  const { currentUser } = useAuthActions();
  
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
      // Extract enrolled students' subjects
      if (classData.enrolledStudents) {
        classData.enrolledStudents.forEach((enrollment: any) => {
          if (enrollment.enrollmentDetails?.subjects) {
            enrollment.enrollmentDetails.subjects.forEach((subjectEntry: any) => {
              const subjectData = subjectEntry.subject;
              
              // If we haven't added this subject yet
              if (subjectData && !subjectMap.has(subjectData._id)) {
                subjectMap.set(subjectData._id, subjectData);
                authorizedSubjects.push(subjectData);
              }
            });
          }
        });
      }
    });

    return authorizedSubjects;
  };

  // Get subjects the teacher is authorized to teach
  const subjects = extractSubjectsFromClasses();

  // Format classes data for the form
  const formatClassesForForm = () => {
    if (!classes) return [];
    
    return classes.map((classData: any) => ({
      class: classData.class || classData,
      students: classData.enrolledStudents?.map((enrollment: any) => enrollment.student) || []
    }));
  };

  const formattedClasses = formatClassesForForm();

  // Handle loading states
  if (isLoadingClasses) {
    return <LoadingSpinner />;
  }

  // Define a type-safe handler for form submission
  const handleSubmit = async (data: CreateGradebookData | UpdateGradebookData) => {
    // Cast the data to CreateGradebookData since we're creating a new gradebook
    await createGradebook.mutateAsync(data as CreateGradebookData);
    
    // Invalidate gradebook queries to ensure lists are refreshed
    queryClient.invalidateQueries({ queryKey: ["teacher-gradebooks"] });
    
    // Navigate back to gradebook list
    navigate("/teacher/gradebook");
  };

  return (
    <Card size="4">
      <TeacherGradebookForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createGradebook.isPending}
        classes={formattedClasses || []}
        subjects={subjects || []}
      />
    </Card>
  );
};

export default GradebookCreate; 