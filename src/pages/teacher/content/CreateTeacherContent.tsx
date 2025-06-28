import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Heading } from "@radix-ui/themes";
import { ContentForm, ContentFormData } from "../../../components/content/ContentForm";
import { useContentMutation } from "../../../hooks/useContentMutation";
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { TeacherClass, EnrolledStudent, StudentClass } from "../../../types/class";

interface SubjectType {
  _id: string;
  name: string;
  code?: string;
}

interface ContentFormClassType {
  _id: string;
  name: string;
  subjects?: Array<{
    subject: string | { _id: string };
    teachers?: Array<{ status: string }>;
  }>;
}

const CreateTeacherContent = () => {
  const navigate = useNavigate();
  const { createContent } = useContentMutation();

  // Fetch teacher's classes
  const { data: teacherClasses, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  const handleSubmit = async (data: ContentFormData) => {
    await createContent.mutateAsync(data);
    navigate("/teacher/content");
  };

  if (isLoadingClasses) return <LoadingSpinner />;

  // Extract unique subjects from teacherClasses
  const extractedSubjects: SubjectType[] = [];

  // Process each class
  if (teacherClasses) {
    teacherClasses.forEach((classItem) => {
      if ('class' in classItem) {
        // This is a TeacherClass
        const teacherClassItem = classItem as TeacherClass;
        
        // Add subjects directly from the subjects array if they exist
        if (teacherClassItem.subjects) {
          teacherClassItem.subjects.forEach(subject => {
            extractedSubjects.push({
              _id: subject._id,
              name: subject.name,
              code: subject.code
            });
          });
        }
        
        // Add subjects from enrolledStudents if they exist
        if (teacherClassItem.enrolledStudents) {
          teacherClassItem.enrolledStudents.forEach((student: EnrolledStudent) => {
            student.enrollmentDetails?.subjects?.forEach(subjectItem => {
              extractedSubjects.push({
                _id: subjectItem.subject._id,
                name: subjectItem.subject.name,
                code: subjectItem.subject.code
              });
            });
          });
        }
      } else {
        // This is a StudentClass
        const studentClassItem = classItem as StudentClass;
        
        // Add subjects from StudentClass
        if (studentClassItem.subjects) {
          studentClassItem.subjects.forEach(subject => {
            extractedSubjects.push({
              _id: subject._id,
              name: subject.name,
              code: subject.code
            });
          });
        }
      }
    });
  }

  // Remove duplicates by subject _id
  const uniqueSubjects = Array.from(
    new Map(extractedSubjects.map(subject => [subject._id, subject])).values()
  );

  // Transform classes to match ContentForm expected structure
  const formattedClasses: ContentFormClassType[] = [];
  
  if (teacherClasses) {
    teacherClasses.forEach((classItem) => {
      if ('class' in classItem) {
        // TeacherClass format
        const teacherClassItem = classItem as TeacherClass;
        formattedClasses.push({
          _id: teacherClassItem.class._id,
          name: teacherClassItem.class.name,
          subjects: teacherClassItem.subjects?.map(subject => ({
            subject: subject._id,
            teachers: [{ status: "approved" }]
          }))
        });
      } else {
        // StudentClass format
        const studentClassItem = classItem as StudentClass;
        formattedClasses.push({
          _id: studentClassItem._id,
          name: studentClassItem.name,
          subjects: studentClassItem.subjects?.map(subject => ({
            subject: subject._id,
            teachers: [{ status: "approved" }]
          }))
        });
      }
    });
  }

  return (
    <Card size="4">
      <Heading size="5" mb="4">Create New Content</Heading>
      <ContentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createContent.isPending}
        classes={formattedClasses}
        subjects={uniqueSubjects}
      />
    </Card>
  );
};

export default CreateTeacherContent; 