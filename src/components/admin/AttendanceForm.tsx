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
  Badge,
  Callout,
  TextArea
} from '@radix-ui/themes';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CalendarIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { 
  Attendance, 
  AttendanceSession, 
  AttendanceStatus,
  CreateAttendanceData, 
  UpdateAttendanceData,
  ClassStudent,
  User,
  Class
} from '../../types';

// Validation schema for attendance form
const attendanceSchema = z.object({
  class: z.string().min(1, 'Class is required'),
  subject: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  session: z.enum(['morning', 'afternoon', 'full-day'], {
    errorMap: () => ({ message: 'Session is required' }),
  }),
  notes: z.string().optional(),
  records: z.array(
    z.object({
      student: z.string().min(1, 'Student is required'),
      status: z.enum(['present', 'absent', 'late', 'excused'], {
        errorMap: () => ({ message: 'Status is required' }),
      }),
      remark: z.string().optional(),
      timeIn: z.string().optional(),
      timeOut: z.string().optional(),
    })
  ),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  initialData?: Attendance;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateAttendanceData | UpdateAttendanceData) => Promise<void>;
  onSubmitAttendance?: (id: string) => Promise<void>;
  isSubmitting: boolean;
  isSubmitAttendancePending?: boolean;
}

// Extended Class interface to include students property
interface ClassWithStudents extends Class {
  students: ClassStudent[];
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  initialData,
  mode,
  onSubmit,
  onSubmitAttendance,
  isSubmitting,
  isSubmitAttendancePending,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    typeof initialData?.class === 'string' ? initialData.class : initialData?.class?._id || ''
  );
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{_id: string, name: string, code: string}>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: initialData ? {
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class._id,
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject?._id || '',
      date: typeof initialData.date === 'string' 
        ? initialData.date.split('T')[0] 
        : new Date(initialData.date).toISOString().split('T')[0],
      session: initialData.session,
      notes: initialData.notes || '',
      records: initialData.records.map(record => ({
        student: typeof record.student === 'string' ? record.student : record.student._id,
        status: record.status,
        remark: record.remark || '',
        timeIn: record.timeIn || '',
        timeOut: record.timeOut || '',
      }))
    } : {
      class: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      session: 'full-day' as AttendanceSession,
      notes: '',
      records: [],
    }
  });

  // Fetch classes data
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch all students for name display
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['users', { role: 'student' }],
    queryFn: () => userService.getAllUsers({ role: 'student' }),
  });

  // Watch class to handle dependencies
  const watchedClass = watch('class');
  const watchedSubject = watch('subject');

  // Update local state when the form values change
  useEffect(() => {
    if (watchedClass !== selectedClass) {
      setSelectedClass(watchedClass);
      // Reset records when class changes
      setValue('records', []);
      // Reset subject when class changes
      setValue('subject', '');
    }
  }, [watchedClass, selectedClass, setValue]);

  // Load subjects for the selected class
  useEffect(() => {
    if (selectedClass && classes) {
      const selectedClassData = classes.find(c => c._id === selectedClass) as ClassWithStudents;
      if (selectedClassData && selectedClassData.subjects) {
        const subjects = selectedClassData.subjects.map(subject => ({
          _id: typeof subject.subject === 'string' ? subject.subject : subject.subject._id,
          name: typeof subject.subject === 'string' ? '' : subject.subject.name,
          code: typeof subject.subject === 'string' ? '' : subject.subject.code
        })).filter(subject => subject.name); // Filter out any subjects without names
        
        setAvailableSubjects(subjects);
      } else {
        setAvailableSubjects([]);
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedClass, classes]);

  // Get students of the selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass && classes) {
        setIsLoadingStudents(true);
        try {
          const selectedClassData = classes.find(c => c._id === selectedClass) as ClassWithStudents;
          if (selectedClassData && selectedClassData.students) {
            // Filter out any student records with missing student data
            const validStudents = selectedClassData.students.filter((cs: ClassStudent) => 
              cs.student && (typeof cs.student === 'string' || cs.student._id)
            );
            setClassStudents(validStudents);
          } else {
            setClassStudents([]);
          }
        } catch (error) {
          console.error("Error fetching students:", error);
          setClassStudents([]);
        } finally {
          setIsLoadingStudents(false);
        }
      } else {
        setClassStudents([]);
      }
    };
    
    fetchStudents();
  }, [selectedClass, classes]);

  // Initialize records for all students in the class
  useEffect(() => {
    if (mode === 'create' && classStudents.length > 0 && watch('records').length === 0) {
      const initialRecords = classStudents
        .filter(cs => cs.status === 'approved' && cs.student) // Only include approved students with valid student data
        .map(cs => ({
          student: typeof cs.student === 'string' ? cs.student : cs.student._id,
          status: 'present' as AttendanceStatus,
          remark: '',
          timeIn: '',
          timeOut: '',
        }));
      setValue('records', initialRecords);
    }
  }, [classStudents, mode, setValue, watch]);

  if (loadingClasses || loadingStudents) {
    return <LoadingSpinner />;
  }

  const handleFormSubmit = async (data: AttendanceFormData) => {
    // Format the data for API
    const formattedData = {
      ...data,
      records: data.records.map(record => ({
        ...record,
        // Remove empty strings
        remark: record.remark || undefined,
        timeIn: record.timeIn || undefined,
        timeOut: record.timeOut || undefined,
      }))
    };

    try {
      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error submitting attendance form:", error);
    }
  };

  const handleStatusChange = (index: number, status: AttendanceStatus) => {
    const records = [...watch('records')];
    records[index].status = status;
    setValue('records', records);
  };

  const handleRemarkChange = (index: number, remark: string) => {
    const records = [...watch('records')];
    records[index].remark = remark;
    setValue('records', records);
  };

  const handleTimeChange = (index: number, field: 'timeIn' | 'timeOut', value: string) => {
    const records = [...watch('records')];
    records[index][field] = value;
    setValue('records', records);
  };

  // Helper function to get student name
  const getStudentName = (studentId: string) => {
    if (!studentId) return 'Unknown Student';
    
    // First try to find student in classStudents
    const studentRecord = classStudents.find(
      cs => cs.student && (
        typeof cs.student === 'string' 
          ? cs.student === studentId
          : cs.student._id === studentId
      )
    );
    
    if (studentRecord && typeof studentRecord.student !== 'string' && 
        studentRecord.student.firstName && studentRecord.student.lastName) {
      return `${studentRecord.student.firstName} ${studentRecord.student.lastName}`;
    }
    
    // If not found or only ID is available, try to find in students list
    const studentUser = students?.find(student => student._id === studentId);
    if (studentUser) {
      return `${studentUser.firstName} ${studentUser.lastName}`;
    }
    
    // If still not found, return the ID
    return studentId;
  };

  // Mark all as present
  const markAllAs = (status: AttendanceStatus) => {
    const records = watch('records').map(record => ({
      ...record,
      status,
    }));
    setValue('records', records);
  };

  // Helper for rendering status badge
  const getStatusBadge = (status: AttendanceStatus) => {
    const colors = {
      present: 'green',
      absent: 'red',
      late: 'orange',
      excused: 'blue'
    };
    return colors[status] as 'green' | 'red' | 'orange' | 'blue';
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="5">
        <Heading size="4">{mode === 'create' ? 'Record New' : 'Edit'} Attendance</Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
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
                  disabled={mode === 'edit'} // Can't change class in edit mode
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

          {/* Subject Selection (Optional) */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Subject (Optional)
            </Text>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  size="3"
                  disabled={!selectedClass || availableSubjects.length === 0}
                >
                  <Select.Trigger 
                    placeholder={
                      !selectedClass 
                        ? "Select a class first" 
                        : availableSubjects.length === 0
                          ? "No subjects available"
                          : "Select a subject"
                    } 
                    variant="soft"
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Subjects</Select.Label>
                      <Select.Item value="none">None</Select.Item>
                      {availableSubjects.map(subject => (
                        <Select.Item key={subject._id} value={subject._id}>
                          {subject.name} ({subject.code})
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Box>

          {/* Date */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Date <span style={{ color: 'red' }}>*</span>
            </Text>
    
              <input
                type="date"
                {...control.register('date')}
                style={{ color: errors.date ? 'red' : undefined }}
              />
      
            {errors.date && (
              <Text size="1" color="red" mt="1">
                {errors.date.message}
              </Text>
            )}
          </Box>

          {/* Session */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Session <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="session"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select session" 
                    variant="soft"
                    color={errors.session ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="morning">Morning</Select.Item>
                    <Select.Item value="afternoon">Afternoon</Select.Item>
                    <Select.Item value="full-day">Full Day</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.session && (
              <Text size="1" color="red" mt="1">
                {errors.session.message}
              </Text>
            )}
          </Box>
        </Grid>

        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Notes (Optional)
          </Text>
          <TextArea
            placeholder="Add any additional notes here..." 
            {...control.register('notes')}
          />
        </Box>

        {/* Attendance Records */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Attendance Records</Heading>
              <Flex gap="2">
                <Button 
                  size="1" 
                  variant="soft" 
                  color="green"
                  onClick={() => markAllAs('present')}
                  type="button"
                >
                  Mark All Present
                </Button>
                <Button 
                  size="1" 
                  variant="soft" 
                  color="red"
                  onClick={() => markAllAs('absent')}
                  type="button"
                >
                  Mark All Absent
                </Button>
              </Flex>
            </Flex>
            
            {isLoadingStudents ? (
              <Flex justify="center" py="4">
                <LoadingSpinner />
              </Flex>
            ) : watch('records').length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Time In</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Time Out</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Remarks</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {watch('records').map((record, index) => (
                    <Table.Row key={record.student}>
                      <Table.Cell>{getStudentName(record.student)}</Table.Cell>
                      <Table.Cell>
                        <Select.Root
                          value={record.status}
                          onValueChange={(value) => handleStatusChange(index, value as AttendanceStatus)}
                          size="2"
                        >
                          <Select.Trigger 
                            variant="soft" 
                            color={getStatusBadge(record.status)}
                          />
                          <Select.Content>
                            <Select.Item value="present">Present</Select.Item>
                            <Select.Item value="absent">Absent</Select.Item>
                            <Select.Item value="late">Late</Select.Item>
                            <Select.Item value="excused">Excused</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>
                      
                          <input
                            type="time"
                            value={record.timeIn || ''}
                            onChange={(e) => handleTimeChange(index, 'timeIn', e.target.value)}
                            style={{ width: '100%' }}
                          />
                       
                      </Table.Cell>
                      <Table.Cell>
               
                          <input
                            type="time"
                            value={record.timeOut || ''}
                            onChange={(e) => handleTimeChange(index, 'timeOut', e.target.value)}
                            style={{ width: '100%' }}
                          />
                
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root size="2" value={record.remark || ''}
                          onChange={(e) => handleRemarkChange(index, e.target.value)}
                          placeholder="Add remarks"
                          style={{ width: '100%' }}>
                           
                        </TextField.Root>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : selectedClass ? (
              <Callout.Root color="amber">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  No students available for this class or all students are pending approval.
                </Callout.Text>
              </Callout.Root>
            ) : (
              <Callout.Root>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  Please select a class to load students.
                </Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </Card>

        {/* Form Actions */}
        <Flex gap="3" justify="end">
          {mode === 'edit' && initialData && !initialData.isSubmitted && onSubmitAttendance && (
            <Button 
              color="green"
              onClick={() => initialData._id && onSubmitAttendance(initialData._id)}
              type="button"
              disabled={isSubmitAttendancePending}
            >
              {isSubmitAttendancePending ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isSubmitting || watch('records').length === 0}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Attendance Record' : 'Update Attendance Record')
            }
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default AttendanceForm; 