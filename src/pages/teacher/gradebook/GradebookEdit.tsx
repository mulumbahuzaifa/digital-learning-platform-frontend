import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from '@radix-ui/themes';
import { gradebookService } from "../../../services/gradebookService";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TeacherGradebookForm from "../../../components/teacher/TeacherGradebookForm";
import { useGradebookMutation } from "../../../hooks/useGradebookMutation";
import { CreateGradebookData, UpdateGradebookData } from "../../../types";
import { useAuthActions } from "../../../hooks/useAuthActions";

const GradebookEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateGradebook } = useGradebookMutation();
  const { currentUser } = useAuthActions();
  
  // Fetch gradebook data by ID
  const { data: gradebook, isLoading: isLoadingGradebook } = useQuery({
    queryKey: ["gradebook", id],
    queryFn: () => id ? gradebookService.getGradebookById(id) : null,
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
  if (isLoadingGradebook || isLoadingClasses || !gradebook) {
    return <LoadingSpinner />;
  }

  // Check if the current teacher is authorized to edit this gradebook
  const teacherId = currentUser.data?._id;
  const isAuthorized = 
    teacherId && 
    (typeof gradebook.teacher === 'string' 
      ? gradebook.teacher === teacherId
      : gradebook.teacher._id === teacherId);

  if (!isAuthorized) {
    // Redirect if not authorized
    navigate("/teacher/gradebook");
    return null;
  }

  // Define a type-safe handler for form submission
  const handleSubmit = async (data: CreateGradebookData | UpdateGradebookData) => {
    if (!id) return;
    
    await updateGradebook.mutateAsync({
      id,
      data: data as UpdateGradebookData
    });
    
    // Invalidate gradebook queries to ensure lists and details are refreshed
    queryClient.invalidateQueries({ queryKey: ["gradebook", id] });
    queryClient.invalidateQueries({ queryKey: ["teacher-gradebooks"] });
    
    // Navigate back to gradebook details
    navigate(`/teacher/gradebook/${id}`);
  };

  return (
    <Card size="4">
      <TeacherGradebookForm
        mode="edit"
        initialData={gradebook}
        onSubmit={handleSubmit}
        isSubmitting={updateGradebook.isPending}
        classes={formattedClasses || []}
        subjects={subjects || []}
      />
    </Card>
  );
};

export default GradebookEdit; 