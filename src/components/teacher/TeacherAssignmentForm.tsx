import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Button, 
  TextField, 
  Flex, 
  Select, 
  Text,
  Card,
  Heading,
  Box,
  Grid,
  TextArea,
  RadioGroup
} from '@radix-ui/themes';
import { AssignmentStatus, Subject } from "../../types";
import { Class } from "../../types/class";
import { useState, useEffect } from "react";

// Schema definitions based on form mode
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalMarks: z.number().min(1, "Total marks must be greater than 0"),
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  instructions: z.string().optional(),
  allowLateSubmissions: z.boolean().optional(),
  visibleToStudents: z.boolean().default(true),
});

const editAssignmentSchema = createAssignmentSchema.extend({
  status: z.enum(["draft", "published", "archived"]),
});

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
export type EditAssignmentFormData = z.infer<typeof editAssignmentSchema>;

interface TeacherAssignmentFormProps {
  mode: "create" | "edit";
  initialData?: EditAssignmentFormData;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  classes: Class[];
  subjects: Subject[];
}

const TeacherAssignmentForm = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  classes,
  subjects,
}: TeacherAssignmentFormProps) => {
  // State for subjects that a teacher can assign to (based on class selection)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(subjects || []);
  
  // Default schema based on mode
  const schema = mode === "create" ? createAssignmentSchema : editAssignmentSchema;
  
  // Use the correct form type based on mode
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      title: "",
      description: "",
      dueDate: "",
      totalMarks: 100,
      class: "",
      subject: "",
      instructions: "",
      allowLateSubmissions: false,
      visibleToStudents: true,
      ...(mode === "edit" && { status: "draft" }),
    },
  } as any); // Type assertion to avoid resolver mismatch

  const selectedClass = watch("class");
  const selectedStatus = watch("status");
  const visibleToStudents = watch("visibleToStudents");
  
  // Function to set tomorrow as the default due date
  const setDefaultDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59);
    
    const formattedDate = tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    setValue("dueDate", formattedDate);
  };
  
  // Set default due date on initial render for create mode
  useEffect(() => {
    if (mode === "create" && !initialData?.dueDate) {
      setDefaultDueDate();
    }
  }, [mode, initialData]);
  
  // Load subjects based on selected class
  useEffect(() => {
    if (selectedClass && classes.length > 0) {
      const selectedClassObj = classes.find(c => c._id === selectedClass);
      
      if (selectedClassObj && selectedClassObj.subjects && subjects && subjects.length > 0) {
        // Filter subjects based on the selected class and the teacher's authorized subjects
        const authorizedSubjects = [];
        let includesCurrentSubject = false;
        const currentSubject = watch("subject");
        
        // Loop through each subject in the selected class
        for (const classSubject of selectedClassObj.subjects) {
          // Get the subject ID
          const subjectId = typeof classSubject.subject === 'string' 
            ? classSubject.subject 
            : classSubject.subject._id;
          
          // Check if this is the currently assigned subject
          if (currentSubject && currentSubject === subjectId) {
            includesCurrentSubject = true;
          }
          
          // Check if this teacher is assigned to teach this subject
          const isAssignedTeacher = classSubject.teachers && 
            classSubject.teachers.some(teacher => teacher.status === 'approved');
          
          // Find the full subject details from the subjects array
          const subjectDetails = subjects.find(s => s._id === subjectId);
          
          // Only include subjects where the teacher is authorized
          if (isAssignedTeacher && subjectDetails) {
            authorizedSubjects.push(subjectDetails);
          }
        }
        
        // If we're in edit mode and the current subject isn't in the authorized subjects
        // but it is assigned to this assignment, find and add it to the available subjects
        if (mode === "edit" && currentSubject && !includesCurrentSubject) {
          const subjectDetails = subjects.find(s => s._id === currentSubject);
          if (subjectDetails) {
            authorizedSubjects.push(subjectDetails);
          }
        }
        
        setAvailableSubjects(authorizedSubjects);
      } else {
        setAvailableSubjects([]);
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedClass, classes, subjects, mode, watch]);

  // Clear subject selection when class changes (only in create mode)
  useEffect(() => {
    // Only reset subject when class changes in create mode
    if (mode === "create") {
      setValue("subject", "");
    }
  }, [selectedClass, setValue, mode]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="5">
        {/* Basic Information */}
        <Card>
          <Heading size="3" mb="4">Basic Information</Heading>
          
          <Flex direction="column" gap="4">
            <TextField.Root {...register("title")}>
              <TextField.Slot>
                <Text size="2" weight="bold">Title</Text>
              </TextField.Slot>
              {errors.title && (
                <TextField.Slot>
                  <Text size="1" color="red">{errors.title.message as string}</Text>
                </TextField.Slot>
              )}
            </TextField.Root>
            
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Description
              </Text>
              <TextArea 
                placeholder="Enter assignment description..." 
                {...register("description")}
                style={{ minHeight: '100px' }}
              />
              {errors.description && (
                <Text size="1" color="red">{errors.description.message as string}</Text>
              )}
            </Box>
          
            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">
                  Due Date
                </Text>
                <TextField.Root 
                  type="datetime-local" 
                  {...register("dueDate")}
                />
                {errors.dueDate && (
                  <Text size="1" color="red">{errors.dueDate.message as string}</Text>
                )}
              </Flex>
              
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">
                  Total Marks
                </Text>
                <TextField.Root 
                  type="number" 
                  {...register("totalMarks", { valueAsNumber: true })}
                />
                {errors.totalMarks && (
                  <Text size="1" color="red">{errors.totalMarks.message as string}</Text>
                )}
              </Flex>
            </Grid>
            
            <Grid columns="2" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">
                  Class
                </Text>
                <Select.Root
                  value={selectedClass}
                  onValueChange={(value) => setValue("class", value)}
                >
                  <Select.Trigger variant="soft" placeholder="Select a class" />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Your Classes</Select.Label>
                      {classes.map((cls) => (
                        <Select.Item key={cls._id} value={cls._id}>
                          {cls.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                {errors.class && (
                  <Text size="1" color="red">{errors.class.message as string}</Text>
                )}
              </Flex>
              
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="bold">
                  Subject
                </Text>
                <Select.Root
                  value={watch("subject")}
                  onValueChange={(value) => setValue("subject", value)}
                  disabled={!selectedClass || availableSubjects.length === 0}
                >
                  <Select.Trigger 
                    variant="soft" 
                    placeholder={
                      !selectedClass 
                        ? "Select a class first" 
                        : availableSubjects.length === 0
                          ? "No subjects available"
                          : "Select a subject"
                    } 
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Available Subjects</Select.Label>
                      {availableSubjects.map((subject) => (
                        <Select.Item key={subject._id} value={subject._id}>
                          {subject.name} {subject.code ? `(${subject.code})` : ''}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                {errors.subject && (
                  <Text size="1" color="red">{errors.subject.message as string}</Text>
                )}
              </Flex>
            </Grid>
          </Flex>
        </Card>
        
        {/* Additional Information */}
        <Card>
          <Heading size="3" mb="4">Additional Information</Heading>
          
          <Flex direction="column" gap="4">
            <Box>
              <Text 
                as="label" 
                size="2" 
                weight="bold" 
                mb="1"
              >
                Instructions (Optional)
              </Text>
              <TextArea 
                placeholder="Enter detailed instructions for students..." 
                {...register("instructions")}
                style={{ minHeight: '100px' }}
              />
            </Box>
            
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Assignment Visibility
              </Text>
              <RadioGroup.Root 
                defaultValue={visibleToStudents ? "visible" : "hidden"}
                onValueChange={(value) => setValue("visibleToStudents", value === "visible")}
              >
                <Flex gap="2" direction="column">
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="visible" /> Visible to Students
                    </Flex>
                  </Text>
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="hidden" /> Hidden from Students
                    </Flex>
                  </Text>
                </Flex>
              </RadioGroup.Root>
            </Flex>
            
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Late Submissions
              </Text>
              <RadioGroup.Root 
                defaultValue={watch("allowLateSubmissions") ? "allow" : "disallow"}
                onValueChange={(value) => setValue("allowLateSubmissions", value === "allow")}
              >
                <Flex gap="2" direction="column">
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="allow" /> Allow Late Submissions
                    </Flex>
                  </Text>
                  <Text as="label" size="2">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="disallow" /> Disallow Late Submissions
                    </Flex>
                  </Text>
                </Flex>
              </RadioGroup.Root>
            </Flex>
            
            {/* Status - Edit mode only */}
            {mode === "edit" && (
              <Flex direction="column" gap="1">
                <Text 
                  as="label" 
                  size="2" 
                  weight="bold" 
                  mb="1"
                >
                  Status
                </Text>
                <Select.Root
                  value={selectedStatus}
                  onValueChange={(value: AssignmentStatus) => setValue("status", value)}
                >
                  <Select.Trigger variant="soft" />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Status</Select.Label>
                      <Select.Item value="draft">Draft</Select.Item>
                      <Select.Item value="published">Published</Select.Item>
                      <Select.Item value="archived">Archived</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                {errors.status && (
                  <Text size="1" color="red">{errors.status.message as string}</Text>
                )}
              </Flex>
            )}
          </Flex>
        </Card>
        
        {/* Submit button */}
        <Flex justify="end" gap="3">
          {mode === "edit" && (
            <Button 
              type="button" 
              variant="soft" 
              onClick={() => reset(initialData)}
              disabled={isSubmitting}
            >
              Reset Changes
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            style={{ minWidth: '120px' }}
          >
            {isSubmitting 
              ? "Saving..." 
              : mode === "create" 
                ? "Create Assignment" 
                : "Update Assignment"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default TeacherAssignmentForm; 