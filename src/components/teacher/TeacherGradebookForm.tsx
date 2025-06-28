import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Button, 
  Text, 
  Grid, 
  Select, 
  TextField,
  Table,
  IconButton,
  TextArea
} from '@radix-ui/themes';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '../../services/assignmentService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { 
  Gradebook, 
  CreateGradebookData, 
  UpdateGradebookData, 
  Class, 
  Subject, 
  User,
  GradebookAssignment,
  GradebookTest,
  GradebookExam
} from '../../types';

// Validation schema for gradebook form
const gradebookSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  class: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.enum(['Term 1', 'Term 2', 'Term 3'], {
    errorMap: () => ({ message: 'Term is required' }),
  }),
  assignments: z.array(
    z.object({
      assignment: z.string().min(1, 'Assignment is required'),
      marks: z.number().min(0, 'Marks must be positive'),
      weight: z.number().min(0, 'Weight must be positive').optional(),
      feedback: z.string().optional(),
    })
  ).optional(),
  tests: z.array(
    z.object({
      name: z.string().min(1, 'Test name is required'),
      marks: z.number().min(0, 'Marks must be positive'),
      date: z.string().min(1, 'Date is required'),
      weight: z.number().min(0, 'Weight must be positive').optional(),
    })
  ).optional(),
  exams: z.array(
    z.object({
      name: z.string().min(1, 'Exam name is required'),
      marks: z.number().min(0, 'Marks must be positive'),
      date: z.string().min(1, 'Date is required'),
      weight: z.number().min(0, 'Weight must be positive').optional(),
    })
  ).optional(),
  remarks: z.string().optional(),
  finalGrade: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
  totalMarks: z.number().optional(),
});

type GradebookFormData = z.infer<typeof gradebookSchema>;

interface TeacherGradebookFormProps {
  initialData?: Gradebook;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateGradebookData | UpdateGradebookData) => Promise<void>;
  isSubmitting: boolean;
  classes?: Class[] | any[];
  subjects?: Subject[] | any[];
}

// Type for student objects from the classes data
interface StudentData {
  _id: string;
  firstName: string;
  lastName: string;
}

const TeacherGradebookForm: React.FC<TeacherGradebookFormProps> = ({
  initialData,
  mode,
  onSubmit,
  isSubmitting,
  classes,
  subjects,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    typeof initialData?.class === 'string' ? initialData.class : initialData?.class?._id || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    typeof initialData?.subject === 'string' ? initialData.subject : initialData?.subject?._id || ''
  );
  const [approvedStudents, setApprovedStudents] = useState<StudentData[]>([]);
  const [calculatedTotalMarks, setCalculatedTotalMarks] = useState<number>(0);
  const [calculatedGrade, setCalculatedGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F' | ''>('');

  const initialFinalGrade = initialData?.finalGrade as ('A' | 'B' | 'C' | 'D' | 'F' | undefined);

  const { 
    control, 
    handleSubmit, 
    register, 
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<GradebookFormData>({
    resolver: zodResolver(gradebookSchema),
    defaultValues: initialData ? {
      student: typeof initialData.student === 'string' ? initialData.student : initialData.student._id,
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class._id,
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject._id,
      academicYear: initialData.academicYear,
      term: initialData.term,
      assignments: initialData.assignments?.map(a => ({
        assignment: typeof a.assignment === 'string' ? a.assignment : a.assignment._id,
        marks: a.marks,
        weight: a.weight,
        feedback: a.feedback
      })) || [],
      tests: initialData.tests?.map(t => ({
        name: t.name,
        marks: t.marks,
        date: typeof t.date === 'string' ? t.date.split('T')[0] : new Date(t.date).toISOString().split('T')[0],
        weight: t.weight
      })) || [],
      exams: initialData.exams?.map(e => ({
        name: e.name,
        marks: e.marks,
        date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0],
        weight: e.weight
      })) || [],
      remarks: initialData.remarks || '',
      finalGrade: initialFinalGrade,
      totalMarks: initialData.totalMarks || 0
    } : {
      student: '',
      class: '',
      subject: '',
      academicYear: new Date().getFullYear().toString(),
      term: 'Term 1',
      assignments: [],
      tests: [],
      exams: [],
      remarks: '',
      finalGrade: undefined,
      totalMarks: 0
    }
  });

  // Field arrays for repeating sections
  const { fields: assignmentFields, append: appendAssignment, remove: removeAssignment } = useFieldArray({
    control,
    name: 'assignments'
  });

  const { fields: testFields, append: appendTest, remove: removeTest } = useFieldArray({
    control,
    name: 'tests'
  });

  const { fields: examFields, append: appendExam, remove: removeExam } = useFieldArray({
    control,
    name: 'exams'
  });

  // Process approved students from the selected class data
  useEffect(() => {
    if (selectedClass && classes) {
      const selectedClassObj = classes.find((c: any) => c.class._id === selectedClass);
      
      if (selectedClassObj && selectedClassObj.students) {
        // Get students directly from the students array
        const filteredStudents = selectedClassObj.students.map((student: any) => ({
          _id: student._id,
          firstName: student.firstName || '',
          lastName: student.lastName || ''
        }));
          
        setApprovedStudents(filteredStudents);
      } else {
        setApprovedStudents([]);
      }
    } else {
      setApprovedStudents([]);
    }
  }, [selectedClass, classes]);

  // Fetch assignments for the selected subject and class
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments', { class: selectedClass, subject: selectedSubject }],
    queryFn: () => assignmentService.getAllAssignments({ 
      class: selectedClass, 
      subject: selectedSubject 
    }),
    enabled: !!(selectedClass && selectedSubject),
  });

  // Watch class and subject to handle dependencies
  const watchedClass = watch('class');
  const watchedSubject = watch('subject');

  // Update local state when the form values change
  useEffect(() => {
    if (watchedClass !== selectedClass) {
      setSelectedClass(watchedClass);
    }
  }, [watchedClass, selectedClass]);

  useEffect(() => {
    if (watchedSubject !== selectedSubject) {
      setSelectedSubject(watchedSubject);
      // Clear assignments when subject changes
      setValue('assignments', []);
    }
  }, [watchedSubject, selectedSubject, setValue]);

  // Generate academic years (current year and 2 years before/after)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  // Helper function to calculate total marks
  const calculateTotalMarks = () => {
    const formValues = getValues();
    let total = 0;
    
    // Add assignment marks
    if (formValues.assignments && formValues.assignments.length > 0) {
      total += formValues.assignments.reduce((sum, assignment) => 
        sum + (assignment.marks || 0), 0);
    }
    
    // Add test marks
    if (formValues.tests && formValues.tests.length > 0) {
      total += formValues.tests.reduce((sum, test) => 
        sum + (test.marks || 0), 0);
    }
    
    // Add exam marks
    if (formValues.exams && formValues.exams.length > 0) {
      total += formValues.exams.reduce((sum, exam) => 
        sum + (exam.marks || 0), 0);
    }
    
    return total;
  };

  // Helper function to calculate grade based on total marks
  const calculateGrade = (totalMarks: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    // Define grade thresholds
    if (totalMarks >= 90) return 'A';
    if (totalMarks >= 80) return 'B';
    if (totalMarks >= 70) return 'C';
    if (totalMarks >= 60) return 'D';
    return 'F';
  };

  // Update total marks and grade when form values change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // Only recalculate if assignments, tests, exams change
      if (name?.includes('assignments') || name?.includes('tests') || 
          name?.includes('exams')) {
        const total = calculateTotalMarks();
        setCalculatedTotalMarks(total);
        
        const grade = calculateGrade(total);
        setCalculatedGrade(grade);
        
        // Update the form fields
        setValue('totalMarks', total);
        setValue('finalGrade', grade);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Calculate initial total marks and grade when component mounts
  useEffect(() => {
    const total = calculateTotalMarks();
    setCalculatedTotalMarks(total);
    
    const grade = calculateGrade(total);
    setCalculatedGrade(grade);
    
    // Update the form fields if they're not already set
    if (!getValues('totalMarks')) {
      setValue('totalMarks', total);
    }
    if (!getValues('finalGrade')) {
      setValue('finalGrade', grade);
    }
  }, []);

  const handleFormSubmit: SubmitHandler<GradebookFormData> = async (data) => {
    // Calculate final marks and grade before submission
    const totalMarks = calculateTotalMarks();
    const finalGrade = calculateGrade(totalMarks);
    
    // Format the data for API
    const formattedData: CreateGradebookData = {
      student: data.student,
      class: data.class,
      subject: data.subject,
      academicYear: data.academicYear,
      term: data.term as "Term 1" | "Term 2" | "Term 3",
      // Add calculated total marks and grade
      totalMarks: totalMarks,
      finalGrade: finalGrade,
      // Convert marks to numbers for assignments
      assignments: data.assignments?.map(a => ({
        assignment: a.assignment,
        marks: Number(a.marks),
        weight: a.weight ? Number(a.weight) : undefined,
        feedback: a.feedback
      })),
      // Convert marks to numbers for tests
      tests: data.tests?.map(t => ({
        name: t.name,
        marks: Number(t.marks),
        date: t.date,
        weight: t.weight ? Number(t.weight) : undefined,
      })),
      // Convert marks to numbers for exams
      exams: data.exams?.map(e => ({
        name: e.name,
        marks: Number(e.marks),
        date: e.date,
        weight: e.weight ? Number(e.weight) : undefined,
      })),
      remarks: data.remarks
    };

    await onSubmit(formattedData);
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="5">
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <Flex direction="column" gap="3">
          {/* Class Selection */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Class <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="class"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                  disabled={mode === 'edit'}
                >
                  <Select.Trigger 
                    placeholder="Select a class" 
                    variant="soft"
                    color={errors.class ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Classes</Select.Label>
                      {classes?.map(cls => (
                        <Select.Item key={cls.class._id} value={cls.class._id}>
                          {cls.class.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.class && (
              <Text size="1" color="red" mt="1">
                {errors.class.message}
              </Text>
            )}
          </Box>
          {/* Subject Selection */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Subject <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                  disabled={mode === 'edit'}
                >
                  <Select.Trigger 
                    placeholder="Select a subject" 
                    variant="soft"
                    color={errors.subject ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Subjects</Select.Label>
                      {subjects?.map(subject => (
                        <Select.Item key={subject._id} value={subject._id}>
                          {subject.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.subject && (
              <Text size="1" color="red" mt="1">
                {errors.subject.message}
              </Text>
            )}
          </Box>
          {/* Student Selection */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Student <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="student"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                  disabled={mode === 'edit'}
                >
                  <Select.Trigger 
                    placeholder={approvedStudents.length > 0 ? "Select a student" : "No approved students"}
                    variant="soft"
                    color={errors.student ? 'red' : undefined}
                  />
                  
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Students</Select.Label>
                      {approvedStudents.length > 0 ? (
                        approvedStudents.map(student => (
                          <Select.Item key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                          </Select.Item>
                        ))
                      ) : (
                        <Select.Item value="no_students" disabled>
                          No approved students in this class
                        </Select.Item>
                      )}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.student && (
              <Text size="1" color="red" mt="1">
                {errors.student.message}
              </Text>
            )}
          </Box>
          </Flex>
          {/* Academic Year */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Academic Year <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="academicYear"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select year" 
                    variant="soft"
                    color={errors.academicYear ? 'red' : undefined}
                  />
                  <Select.Content>
                    {academicYears.map(year => (
                      <Select.Item key={year} value={year}>
                        {year}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.academicYear && (
              <Text size="1" color="red" mt="1">
                {errors.academicYear.message}
              </Text>
            )}
          </Box>

          {/* Term */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Term <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="term"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select a term" 
                    variant="soft"
                    color={errors.term ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="Term 1">Term 1</Select.Item>
                    <Select.Item value="Term 2">Term 2</Select.Item>
                    <Select.Item value="Term 3">Term 3</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.term && (
              <Text size="1" color="red" mt="1">
                {errors.term.message}
              </Text>
            )}
          </Box>
        </Grid>

        {/* Assignments */}
        <Card mt="4">
          <Heading size="3" mb="3">Assignments</Heading>
          
          {assignmentFields.length > 0 && (
            <Table.Root mb="3">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Feedback</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {assignmentFields.map((field, index) => (
                  <Table.Row key={field.id}>
                    <Table.Cell>
                      <Controller
                        control={control}
                        name={`assignments.${index}.assignment`}
                        render={({ field }) => (
                          <Select.Root
                            value={field.value}
                            onValueChange={field.onChange}
                            size="2"
                          >
                            <Select.Trigger placeholder="Select assignment" />
                            <Select.Content>
                              {assignments?.map(assignment => (
                                <Select.Item key={assignment._id} value={assignment._id}>
                                  {assignment.title}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root size="2" {...register(`assignments.${index}.marks` as const, { 
                        valueAsNumber: true 
                      })}>
                    
                      </TextField.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root size="2" {...register(`assignments.${index}.weight` as const, { 
                        valueAsNumber: true 
                      })}>

                      </TextField.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root size="2" {...register(`assignments.${index}.feedback` as const)}>

                      </TextField.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton 
                        size="1" 
                        variant="soft" 
                        color="red" 
                        onClick={() => removeAssignment(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
          
          <Button 
            variant="soft" 
            onClick={() => appendAssignment({ assignment: '', marks: 0, weight: 0, feedback: '' })}
            disabled={!selectedSubject || loadingAssignments || (assignments && assignments.length === 0)}
          >
            <PlusIcon /> Add Assignment
          </Button>
        </Card>

        {/* Tests */}
        <Card mt="4">
          <Heading size="3" mb="3">Tests</Heading>
          
          {testFields.length > 0 && (
            <Table.Root mb="3">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Test Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {testFields.map((field, index) => (
                  <Table.Row key={field.id}>
                    <Table.Cell>
                      <TextField.Root size="2" placeholder="Test name"
                            {...register(`tests.${index}.name` as const)}
                            style={{ width: '100%' }}
                            >
                      </TextField.Root>
                    </Table.Cell>
                    <Table.Cell>
      
                          <input
                            type="number"
                            placeholder="Marks"
                            {...register(`tests.${index}.marks` as const, { 
                              valueAsNumber: true 
                            })}
                            />
                    </Table.Cell>
                    <Table.Cell>
            
                          <input
                            type="date"
                            {...register(`tests.${index}.date` as const)}
                          />
               
                    </Table.Cell>
                    <Table.Cell>
               
                          <input
                            type="number"
                            placeholder="Weight"
                            {...register(`tests.${index}.weight` as const, { 
                              valueAsNumber: true 
                            })}
                          />
          
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton 
                        size="1" 
                        variant="soft" 
                        color="red" 
                        onClick={() => removeTest(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
          
          <Button 
            variant="soft" 
            onClick={() => appendTest({ name: '', marks: 0, date: new Date().toISOString().split('T')[0], weight: 0 })}
          >
            <PlusIcon /> Add Test
          </Button>
        </Card>

        {/* Exams */}
        <Card mt="4">
          <Heading size="3" mb="3">Exams</Heading>
          
          {examFields.length > 0 && (
            <Table.Root mb="3">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Exam Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {examFields.map((field, index) => (
                  <Table.Row key={field.id}>
                    <Table.Cell>
                      <TextField.Root size="2" placeholder="Exam name"
                            {...register(`exams.${index}.name` as const)}>
                       
                      </TextField.Root>
                    </Table.Cell>
                    <Table.Cell>
                      <input
                            type="number"
                            placeholder="Marks"
                            {...register(`exams.${index}.marks` as const, { valueAsNumber: true })}
                          />
                    </Table.Cell>
                    <Table.Cell>
                      <input
                            type="date"
                            {...register(`exams.${index}.date` as const)}
                          />
                    </Table.Cell>
                    <Table.Cell>
                      <input
                            type="number"
                            placeholder="Weight"
                            {...register(`exams.${index}.weight` as const, { valueAsNumber: true })}
                          />
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton 
                        size="1" 
                        variant="soft" 
                        color="red" 
                        onClick={() => removeExam(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
          
          <Button 
            variant="soft" 
            onClick={() => appendExam({ name: '', marks: 0, date: new Date().toISOString().split('T')[0], weight: 0 })}
          >
            <PlusIcon /> Add Exam
          </Button>
        </Card>

        {/* Total Marks and Grade */}
        <Card mt="4">
          <Heading size="3" mb="3">Summary</Heading>
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Total Marks
              </Text>
              <Text size="4" weight="medium" color="blue">
                {calculatedTotalMarks}
              </Text>
            </Box>
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Final Grade
              </Text>
              <Text 
                size="4" 
                weight="bold" 
                color={
                  calculatedGrade === 'A' ? 'green' : 
                  calculatedGrade === 'B' ? 'blue' : 
                  calculatedGrade === 'C' ? 'orange' : 
                  calculatedGrade === 'D' ? 'amber' : 'red'
                }
              >
                {calculatedGrade}
              </Text>
            </Box>
          </Grid>
        </Card>
        
        {/* Remarks */}
        <Box mt="4">
          <Text as="label" size="2" weight="bold" mb="1">
            Remarks
          </Text>
          <TextArea
            placeholder="Enter any remarks or feedback for the student"
            {...register('remarks')}
            style={{ minHeight: '100px' }}
          />
        </Box>

        <Flex gap="3" justify="end" mt="4">
          <Button variant="soft" type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button variant="solid" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Gradebook Entry' : 'Update Gradebook Entry'}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default TeacherGradebookForm;