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
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { assignmentService } from '../../services/assignmentService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Gradebook, CreateGradebookData, UpdateGradebookData } from '../../types';

const gradebookSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  class: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().min(1, 'Teacher is required'),
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
  totalMarks: z.number().min(0, 'Total marks must be positive').optional(),
  finalGrade: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
  remarks: z.string().optional(),
});

type GradebookFormData = z.infer<typeof gradebookSchema>;

interface GradebookFormProps {
  initialData?: Gradebook;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateGradebookData | UpdateGradebookData) => Promise<void>;
  isSubmitting: boolean;
}

const GradebookForm: React.FC<GradebookFormProps> = ({
  initialData,
  mode,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    typeof initialData?.class === 'string' ? initialData.class : initialData?.class?._id || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    typeof initialData?.subject === 'string' ? initialData.subject : initialData?.subject?._id || ''
  );

  const { 
    control, 
    handleSubmit, 
    register, 
    formState: { errors },
    setValue,
    watch
  } = useForm<GradebookFormData>({
    resolver: zodResolver(gradebookSchema),
    defaultValues: initialData ? {
      student: typeof initialData.student === 'string' ? initialData.student : initialData.student._id,
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class._id,
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject._id,
      teacher: typeof initialData.teacher === 'string' ? initialData.teacher : initialData.teacher._id,
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
      totalMarks: initialData.totalMarks,
      finalGrade: initialData.finalGrade,
      remarks: initialData.remarks || ''
    } : {
      student: '',
      class: '',
      subject: '',
      teacher: '',
      academicYear: new Date().getFullYear().toString(),
      term: 'Term 1',
      assignments: [],
      tests: [],
      exams: [],
      totalMarks: undefined,
      finalGrade: undefined,
      remarks: ''
    }
  });
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

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['users', { role: 'student' }],
    queryFn: () => userService.getAllUsers({ role: 'student' }),
  });

  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['users', { role: 'teacher' }],
    queryFn: () => userService.getAllUsers({ role: 'teacher' }),
  });

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await subjectService.getAllSubjects();
      return response.data || [];
    },
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments', { subject: selectedSubject }],
    queryFn: () => assignmentService.getAllAssignments({ subject: selectedSubject }),
    enabled: !!selectedSubject,
  });

  const watchedClass = watch('class');
  const watchedSubject = watch('subject');

  useEffect(() => {
    if (watchedClass !== selectedClass) {
      setSelectedClass(watchedClass);
    }
  }, [watchedClass, selectedClass]);

  useEffect(() => {
    if (watchedSubject !== selectedSubject) {
      setSelectedSubject(watchedSubject);
      setValue('assignments', []);
    }
  }, [watchedSubject, selectedSubject, setValue]);

  const calculateTotalMarks = () => {
    let total = 0;
    let assignmentTotal = 0;
    let testTotal = 0;
    let examTotal = 0;
    
    const assignmentsValues = watch('assignments') || [];
    const testsValues = watch('tests') || [];
    const examsValues = watch('exams') || [];
    
    // Calculate assignment marks with weights
    if (assignmentsValues.length > 0) {
      assignmentsValues.forEach(assignment => {
        if (assignment.marks) {
          const marks = Number(assignment.marks);
          const weight = assignment.weight ? Number(assignment.weight) : 1;
          assignmentTotal += marks * weight;
        }
      });
    }
    
    // Calculate test marks with weights
    if (testsValues.length > 0) {
      testsValues.forEach(test => {
        if (test.marks) {
          const marks = Number(test.marks);
          const weight = test.weight ? Number(test.weight) : 1;
          testTotal += marks * weight;
        }
      });
    }
    
    // Calculate exam marks with weights
    if (examsValues.length > 0) {
      examsValues.forEach(exam => {
        if (exam.marks) {
          const marks = Number(exam.marks);
          const weight = exam.weight ? Number(exam.weight) : 1;
          examTotal += marks * weight;
        }
      });
    }
    
    // Calculate total (simple average for now)
    total = (assignmentTotal + testTotal + examTotal) / 
      (assignmentsValues.length + testsValues.length + examsValues.length || 1);
    
    // Round to 2 decimal places
    total = Math.round(total * 100) / 100;
    
    // Set the total marks in the form
    setValue('totalMarks', total);
    
    // Suggest a grade based on the total
    suggestGrade(total);
  };
  
  // Suggest a grade based on total marks
  const suggestGrade = (totalMarks: number) => {
    let grade: "A" | "B" | "C" | "D" | "F" | undefined;
    
    if (totalMarks >= 90) {
      grade = "A";
    } else if (totalMarks >= 80) {
      grade = "B";
    } else if (totalMarks >= 70) {
      grade = "C";
    } else if (totalMarks >= 60) {
      grade = "D";
    } else if (totalMarks > 0) {
      grade = "F";
    } else {
      grade = undefined;
    }
    
    setValue('finalGrade', grade);
  };

  if (loadingStudents || loadingTeachers || loadingClasses || loadingSubjects) {
    return <LoadingSpinner />;
  }

  const handleFormSubmit = async (data: GradebookFormData) => {
    const formattedData = {
      ...data,
      term: data.term as "Term 1" | "Term 2" | "Term 3",
      assignments: data.assignments?.map(a => ({
        ...a,
        marks: Number(a.marks),
        weight: a.weight ? Number(a.weight) : undefined,
      })),
      tests: data.tests?.map(t => ({
        ...t,
        marks: Number(t.marks),
        weight: t.weight ? Number(t.weight) : undefined,
      })),
      exams: data.exams?.map(e => ({
        ...e,
        marks: Number(e.marks),
        weight: e.weight ? Number(e.weight) : undefined,
      })),
    };

    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="5">
        <Heading size="4">{mode === 'create' ? 'Create' : 'Edit'} Gradebook Entry</Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
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
                >
                  <Select.Trigger 
                    placeholder="Select a student" 
                    variant="soft"
                    color={errors.student ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Students</Select.Label>
                      {students?.map(student => (
                        <Select.Item key={student._id} value={student._id}>
                          {student.firstName} {student.lastName}
                        </Select.Item>
                      ))}
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
                        <Select.Item key={cls._id} value={cls._id}>
                          {cls.name}
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
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Teacher <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="teacher"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select a teacher" 
                    variant="soft"
                    color={errors.teacher ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Teachers</Select.Label>
                      {teachers?.map(teacher => (
                        <Select.Item key={teacher._id} value={teacher._id}>
                          {teacher.firstName} {teacher.lastName}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.teacher && (
              <Text size="1" color="red" mt="1">
                {errors.teacher.message}
              </Text>
            )}
          </Box>
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Academic Year <span style={{ color: 'red' }}>*</span>
            </Text>
            <TextField.Root>
              <TextField.Slot
               {...register('academicYear')}
               style={{ color: errors.academicYear ? 'red' : undefined }}>
               
              </TextField.Slot>
            </TextField.Root>
            {errors.academicYear && (
              <Text size="1" color="red" mt="1">
                {errors.academicYear.message}
              </Text>
            )}
          </Box>
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
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Assignments</Heading>
              <Button 
                size="1" 
                onClick={() => appendAssignment({ assignment: '', marks: 0 })}
                disabled={!selectedSubject || loadingAssignments}
              >
                <PlusIcon /> Add Assignment
              </Button>
            </Flex>
            
            {assignmentFields.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Feedback</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="50px"></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {assignmentFields.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.Cell>
                        <Controller
                          control={control}
                          name={`assignments.${index}.assignment` as const}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={field.onChange}
                              size="2"
                            >
                              <Select.Trigger 
                                placeholder="Select assignment" 
                                variant="soft"
                                color={errors.assignments?.[index]?.assignment ? 'red' : undefined}
                              />
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
                      <input
                              type="number"
                              min="0"
                              {...register(`assignments.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.assignments?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`assignments.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
                            />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2"         type="text"
                              {...register(`assignments.${index}.feedback` as const)}
                              style={{ width: '100%' }}>
                   
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
            ) : (
              <Text size="2" color="gray">No assignments added yet</Text>
            )}
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Tests</Heading>
              <Button 
                size="1" 
                onClick={() => appendTest({ name: '', marks: 0, date: new Date().toISOString().split('T')[0] })}
              >
                <PlusIcon /> Add Test
              </Button>
            </Flex>
            
            {testFields.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="50px"></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {testFields.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.Cell>
                        <TextField.Root size="2"          type="text"
                              {...register(`tests.${index}.name` as const)}
                              style={{ 
                                color: errors.tests?.[index]?.name ? 'red' : undefined,
                                width: '100%'
                              }}>
                    
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="number"
                              min="0"
                              {...register(`tests.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.tests?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                   
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="date"
                              {...register(`tests.${index}.date` as const)}
                              style={{ 
                                color: errors.tests?.[index]?.date ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                    
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`tests.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
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
            ) : (
              <Text size="2" color="gray">No tests added yet</Text>
            )}
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Exams</Heading>
              <Button 
                size="1" 
                onClick={() => appendExam({ name: '', marks: 0, date: new Date().toISOString().split('T')[0] })}
              >
                <PlusIcon /> Add Exam
              </Button>
            </Flex>
            
            {examFields.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Marks</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Weight (%)</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="50px"></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {examFields.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.Cell>
                        <TextField.Root size="2"        type="text"
                              {...register(`exams.${index}.name` as const)}
                              style={{ 
                                color: errors.exams?.[index]?.name ? 'red' : undefined,
                                width: '100%'
                              }}>
                   
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="number"
                              min="0"
                              {...register(`exams.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.exams?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                    
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="date"
                              {...register(`exams.${index}.date` as const)}
                              style={{ 
                                color: errors.exams?.[index]?.date ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                    
                      </Table.Cell>
                      <Table.Cell>
                      <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`exams.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
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
            ) : (
              <Text size="2" color="gray">No exams added yet</Text>
            )}
          </Flex>
        </Card>
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Remarks
          </Text>
         <TextArea
         {...register('remarks')}
         rows={4}
         style={{ width: '100%', resize: 'vertical' }}>
         </TextArea>
        </Box>
        <Flex gap="3" justify="end">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Gradebook Entry' : 'Update Gradebook Entry')
            }
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};
export default GradebookForm;