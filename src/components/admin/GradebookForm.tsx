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
  IconButton
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

// Validation schema for gradebook form
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
      remarks: ''
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

  // Fetch students data
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['users', { role: 'student' }],
    queryFn: () => userService.getAllUsers({ role: 'student' }),
  });

  // Fetch teachers data
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['users', { role: 'teacher' }],
    queryFn: () => userService.getAllUsers({ role: 'teacher' }),
  });

  // Fetch classes data
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch subjects data
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Fetch assignments data for selected subject
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments', { subject: selectedSubject }],
    queryFn: () => assignmentService.getAllAssignments({ subject: selectedSubject }),
    enabled: !!selectedSubject,
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

  if (loadingStudents || loadingTeachers || loadingClasses || loadingSubjects) {
    return <LoadingSpinner />;
  }

  const handleFormSubmit = async (data: GradebookFormData) => {
    // Format the data for API
    const formattedData = {
      ...data,
      term: data.term as "Term 1" | "Term 2" | "Term 3",
      // Convert marks to numbers for assignments
      assignments: data.assignments?.map(a => ({
        ...a,
        marks: Number(a.marks),
        weight: a.weight ? Number(a.weight) : undefined,
      })),
      // Convert marks to numbers for tests
      tests: data.tests?.map(t => ({
        ...t,
        marks: Number(t.marks),
        weight: t.weight ? Number(t.weight) : undefined,
      })),
      // Convert marks to numbers for exams
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

          {/* Teacher Selection */}
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

          {/* Academic Year */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Academic Year <span style={{ color: 'red' }}>*</span>
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <input
                  type="text"
                  {...register('academicYear')}
                  style={{ color: errors.academicYear ? 'red' : undefined }}
                />
              </TextField.Slot>
            </TextField.Root>
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

        {/* Assignments Section */}
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
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              {...register(`assignments.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.assignments?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`assignments.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="text"
                              {...register(`assignments.${index}.feedback` as const)}
                              style={{ width: '100%' }}
                            />
                          </TextField.Slot>
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

        {/* Tests Section */}
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
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="text"
                              {...register(`tests.${index}.name` as const)}
                              style={{ 
                                color: errors.tests?.[index]?.name ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              {...register(`tests.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.tests?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="date"
                              {...register(`tests.${index}.date` as const)}
                              style={{ 
                                color: errors.tests?.[index]?.date ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`tests.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
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

        {/* Exams Section */}
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
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="text"
                              {...register(`exams.${index}.name` as const)}
                              style={{ 
                                color: errors.exams?.[index]?.name ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              {...register(`exams.${index}.marks` as const, { valueAsNumber: true })}
                              style={{ 
                                color: errors.exams?.[index]?.marks ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="date"
                              {...register(`exams.${index}.date` as const)}
                              style={{ 
                                color: errors.exams?.[index]?.date ? 'red' : undefined,
                                width: '100%'
                              }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2">
                          <TextField.Slot>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              {...register(`exams.${index}.weight` as const, { valueAsNumber: true })}
                              style={{ width: '100%' }}
                            />
                          </TextField.Slot>
                        </TextField.Root>
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

        {/* Remarks */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Remarks
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <textarea
                {...register('remarks')}
                rows={4}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        {/* Form Actions */}
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