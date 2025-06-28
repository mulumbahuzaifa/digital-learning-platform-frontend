import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Table,
  Badge,
  Dialog,
  TextField,
  Select,
  TextArea,
  Grid,
  Separator
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CheckIcon,
  CalendarIcon,
  BookmarkIcon,
  PersonIcon
} from '@radix-ui/react-icons';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { attendanceService } from '../../../services/attendanceService';
import { classService } from '../../../services/classService';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Attendance, 
  AttendanceSession, 
  AttendanceStatus,
  CreateAttendanceData,
  UpdateAttendanceData
} from '../../../types';
import { TeacherClass } from '../../../types/class';
import { Link } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for student record in attendance
const studentRecordSchema = z.object({
  student: z.string().min(1, "Student is required"),
  studentName: z.string(),
  status: z.enum(["present", "absent", "late", "excused"] as const),
  remark: z.string().optional(),
  timeIn: z.string().optional(),
  timeOut: z.string().optional()
});

// Schema for creating attendance
const createAttendanceSchema = z.object({
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"),
  session: z.enum(["morning", "afternoon", "full-day"] as const),
  notes: z.string().optional(),
  records: z.array(studentRecordSchema)
});

// Schema for updating attendance
const updateAttendanceSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  notes: z.string().optional(),
  records: z.array(studentRecordSchema)
});

// Types based on schemas
type StudentRecordData = z.infer<typeof studentRecordSchema>;
type CreateAttendanceFormData = z.infer<typeof createAttendanceSchema>;
type UpdateAttendanceFormData = z.infer<typeof updateAttendanceSchema>;

// Update the type for student records
type StudentRecord = {
  student: string;
  studentName: string;
  status: AttendanceStatus;
  remark?: string;
  timeIn?: string;
  timeOut?: string;
};

// Add Record Dialog Form Component
const AddAttendanceForm = ({
  onSubmit,
  isSubmitting,
  classes,
  onClose
}: {
  onSubmit: (data: CreateAttendanceFormData) => Promise<void>;
  isSubmitting: boolean;
  classes: TeacherClass[];
  onClose: () => void;
}) => {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreateAttendanceFormData>({
    resolver: zodResolver(createAttendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      session: 'morning',
      records: [],
      subject: ''
    }
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'records'
  });

  const selectedClass = watch('class');
  const [availableSubjects, setAvailableSubjects] = useState<Array<{id: string, name: string, code: string}>>([]);

  // Update available subjects when class changes
  useEffect(() => {
    if (selectedClass && classes) {
      console.log('Selected Class:', selectedClass);
      console.log('Available Classes:', classes);
      
      const classObj = classes.find((cls) => cls.class._id === selectedClass);
      console.log('Found Class Object:', classObj);
      
      if (classObj && classObj.subjects) {
        const subjects = classObj.subjects.map(subject => ({
          id: subject._id,
          name: subject.name,
          code: subject.code
        }));
        console.log('Available Subjects:', subjects);
        setAvailableSubjects(subjects);
        
        // Reset subject selection when class changes
        setValue('subject', '');
        // Reset student records when class changes
        replace([]);
      } else {
        setAvailableSubjects([]);
      }
    }
  }, [selectedClass, classes, setValue, replace]);

  // Update student records when class changes
  useEffect(() => {
    if (selectedClass && classes) {
      const classObj = classes.find((cls) => cls.class._id === selectedClass);
      if (classObj && classObj.enrolledStudents && classObj.enrolledStudents.length > 0) {
        const studentRecords: StudentRecord[] = classObj.enrolledStudents
          .map(enrolledStudent => {
            // Check if student property exists in the enrolledStudent object
            if (enrolledStudent.student) {
              return {
                student: enrolledStudent.student._id,
                studentName: `${enrolledStudent.student.firstName} ${enrolledStudent.student.lastName}`,
                status: 'present',
                remark: ''
              };
            } else {
              // Handle case where enrollment might not have student property
              console.warn('Enrolled student missing student data:', enrolledStudent);
              return null;
            }
          }).filter(record => record !== null) as StudentRecord[];
        
        replace(studentRecords);
      }
    }
  }, [selectedClass, classes, replace]);

  const onFormSubmit = async (data: CreateAttendanceFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Flex direction="column" gap="3">
        <Flex gap="2">
          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Class
            </Text>
            <Controller
              name="class"
              control={control}
              render={({ field }) => (
                <Select.Root onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger placeholder="Select a class" />
                  <Select.Content>
                    {classes?.map((cls) => (
                      <Select.Item key={cls.class._id} value={cls.class._id}>
                        {cls.class.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.class && (
              <Text size="1" color="red">{errors.class.message}</Text>
            )}
          </Box>

          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Subject
            </Text>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select.Root 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedClass || availableSubjects.length === 0}
                >
                  <Select.Trigger placeholder={
                    !selectedClass 
                      ? "Select a class first" 
                      : availableSubjects.length === 0
                        ? "No subjects available"
                        : "Select a subject"
                  } />
                  <Select.Content>
                    {availableSubjects.map((subject) => (
                      <Select.Item key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.subject && (
              <Text size="1" color="red">{errors.subject.message}</Text>
            )}
          </Box>
        </Flex>
        <Flex gap="2">
        <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Session
            </Text>
            <Controller
              name="session"
              control={control}
              render={({ field }) => (
                <Select.Root onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="morning">Morning</Select.Item>
                    <Select.Item value="afternoon">Afternoon</Select.Item>
                    <Select.Item value="full-day">Full Day</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.session && (
              <Text size="1" color="red">{errors.session.message}</Text>
            )}
          </Box>

          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Date
            </Text>
            <input
              type="date"
              {...register('date')}
              className="rounded-ls"
            />
            {errors.date && (
              <Text size="1" color="red">{errors.date.message}</Text>
            )}
          </Box>
        </Flex>

        <Box>
          <Text as="div" size="2" mb="1" weight="bold">
            Notes
          </Text>
          <TextArea
            {...register('notes')}
            placeholder="Add notes..."
            style={{ minHeight: '80px' }}
          />
        </Box>

        {fields.length > 0 && (
          <Box mt="3">
            <Text as="div" size="2" mb="2" weight="bold">
              Students
            </Text>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Remark</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {fields.map((field, index) => (
                  <Table.Row key={field.id}>
                    <Table.Cell>{field.studentName}</Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`records.${index}.status`}
                        control={control}
                        render={({ field }) => (
                          <Select.Root onValueChange={field.onChange} value={field.value}>
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="present">Present</Select.Item>
                              <Select.Item value="absent">Absent</Select.Item>
                              <Select.Item value="late">Late</Select.Item>
                              <Select.Item value="excused">Excused</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root placeholder="Remark" {...register(`records.${index}.remark`)} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        <Flex gap="3" mt="4" justify="end">
          <Button onClick={onClose} variant="soft" color="gray">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

// Edit Record Dialog Form Component
const EditAttendanceForm = ({
  onSubmit,
  isSubmitting,
  initialData,
  onClose
}: {
  onSubmit: (data: UpdateAttendanceFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData: Attendance;
  onClose: () => void;
}) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<UpdateAttendanceFormData>({
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: {
      notes: initialData.notes || '',
      subject: typeof initialData.subject === 'string' 
        ? initialData.subject 
        : initialData.subject?._id || '',
      records: initialData.records.map(record => ({
        student: typeof record.student === 'string' ? record.student : record.student._id,
        studentName: typeof record.student === 'string' 
          ? 'Unknown Student' 
          : `${record.student.firstName} ${record.student.lastName}`,
        status: record.status,
        remark: record.remark || ''
      }))
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'records'
  });

  const onFormSubmit = async (data: UpdateAttendanceFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Flex direction="column" gap="3">
        <Flex gap="3">
          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Class
            </Text>
            <Text size="2">
              {typeof initialData.class === 'string'
                ? 'Unknown Class'
                : initialData.class.name}
            </Text>
          </Box>

          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Subject
            </Text>
            <Text size="2">
              {typeof initialData.subject === 'string'
                ? 'Unknown Subject'
                : initialData.subject?.name || 'No Subject'}
            </Text>
          </Box>

          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Date
            </Text>
            <Text size="2">
              {format(new Date(initialData.date), 'dd MMM yyyy')}
            </Text>
          </Box>

          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Session
            </Text>
            <Text size="2">
              {initialData.session}
            </Text>
          </Box>
        </Flex>

        <Box>
          <Text as="div" size="2" mb="1" weight="bold">
            Notes
          </Text>
          <TextArea
            {...register('notes')}
            placeholder="Add notes..."
            style={{ minHeight: '80px' }}
          />
        </Box>

        {fields.length > 0 && (
          <Box mt="3">
            <Text as="div" size="2" mb="2" weight="bold">
              Students
            </Text>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Remark</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {fields.map((field, index) => (
                  <Table.Row key={field.id}>
                    <Table.Cell>{field.studentName}</Table.Cell>
                    <Table.Cell>
                      <Controller
                        name={`records.${index}.status`}
                        control={control}
                        render={({ field }) => (
                          <Select.Root onValueChange={field.onChange} value={field.value}>
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="present">Present</Select.Item>
                              <Select.Item value="absent">Absent</Select.Item>
                              <Select.Item value="late">Late</Select.Item>
                              <Select.Item value="excused">Excused</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TextField.Root>
                        <input
                          placeholder="Remark"
                          {...register(`records.${index}.remark`)}
                        />
                      </TextField.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

const TeacherAttendance = () => {
  // State for filters and form
  const [selectedClass, setSelectedClass] = useState<string>('all_classes');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('morning');
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [studentRecords, setStudentRecords] = useState<StudentRecordData[]>([]);
  const [notes, setNotes] = useState('');

  // Get teacher's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const response = await classService.getMyClasses();
      return response as TeacherClass[];
    },
  });

  // Test the API call for debugging - using simplified approach
  useEffect(() => {
    const testAttendanceApi = async () => {
      try {
        const result = await attendanceService.getTeacherAttendance();
        console.log('Attendance API test result:', result);
      } catch (error) {
        console.error('Error testing attendance API:', error);
      }
    };
    
    testAttendanceApi();
  }, []);

  // Get attendance records - now loads without requiring a class selection
  const { 
    data: attendanceData, 
    isLoading: isLoadingAttendance,
    error: attendanceError,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['teacher-attendance'],
    queryFn: async () => {
      console.log('Running attendance query without params');
      
      const data = await attendanceService.getTeacherAttendance();
      
      console.log('Query function returned data:', data);
      return data;
    },
    // Enable by default to show all attendance records
    enabled: true
  });

  // Get specific attendance record
  const { 
    data: selectedAttendance,
    isLoading: isLoadingSelectedAttendance,
    refetch: refetchSelectedAttendance
  } = useQuery({
    queryKey: ['attendance', selectedAttendanceId],
    queryFn: () => selectedAttendanceId 
      ? attendanceService.getAttendanceById(selectedAttendanceId)
      : null,
    enabled: !!selectedAttendanceId
  });

  // Mutations
  const { 
    createAttendance, 
    updateAttendance, 
    submitAttendance
  } = useAttendanceMutation();

  // Update local state when attendance data changes
  useEffect(() => {
    console.log('Attendance data from query:', attendanceData);
    if (attendanceData) {
      setAttendanceRecords(attendanceData);
    } else {
      console.log('No attendance data returned from query');
    }
  }, [attendanceData]);

  // Update studentRecords when selected class changes
  useEffect(() => {
    if (selectedClass !== 'all_classes' && classes) {
      const classObj = classes.find((cls) => cls.class._id === selectedClass);
      
      if (classObj && classObj.enrolledStudents && classObj.enrolledStudents.length > 0) {
        // Map students to the format needed for attendance records
        const mappedStudents = classObj.enrolledStudents
          .map((enrolledStudent) => {
            // Check if student property exists
            if (enrolledStudent.student) {
              const student = enrolledStudent.student;
              return {
                student: student._id,
                studentName: `${student.firstName} ${student.lastName}`,
                status: 'present' as AttendanceStatus // Default status
              };
            }
            return null;
          })
          .filter(record => record !== null) as StudentRecordData[];
          
        setStudentRecords(mappedStudents);
      }
    }
  }, [selectedClass, classes]);

  // Update form when selected attendance changes
  useEffect(() => {
    if (selectedAttendance) {
      setSelectedClass(typeof selectedAttendance.class === 'string' 
        ? selectedAttendance.class 
        : selectedAttendance.class._id);
      
      setSelectedDate(new Date(selectedAttendance.date).toISOString().split('T')[0]);
      setSelectedSession(selectedAttendance.session);
      setNotes(selectedAttendance.notes || '');
      
      if (selectedAttendance.records) {
        // Map attendance records
        const mappedRecords = selectedAttendance.records.map((record) => {
          const studentObj = record.student;
          return {
            student: typeof studentObj === 'string' ? studentObj : studentObj._id,
            studentName: typeof studentObj === 'string' 
              ? 'Unknown Student' 
              : `${studentObj.firstName} ${studentObj.lastName}`,
            status: record.status,
            remark: record.remark || '',
            timeIn: record.timeIn || '',
            timeOut: record.timeOut || ''
          };
        });
        
        setStudentRecords(mappedRecords);
      }
    }
  }, [selectedAttendance]);

  // Display error when attendance query fails
  useEffect(() => {
    if (attendanceError) {
      console.error('Attendance query failed:', attendanceError);
      toast.error('Failed to fetch attendance records. Please try again later.');
    }
  }, [attendanceError]);

  // Handle creating a new attendance record
  const handleCreateAttendance = async (data: CreateAttendanceFormData) => {
    try {
      console.log('Form Data Submitted:', data);
      console.log('Student Records:', data.records);
      
      // Validate class selection
      if (!data.class || data.class === 'select_class') {
        toast.error('Please select a valid class');
        return;
      }
      
      // Validate subject selection
      if (!data.subject) {
        toast.error('Please select a subject');
        return;
      }
      
      // Validate student records
      if (!data.records || data.records.length === 0) {
        toast.error('No students found in the selected class');
        return;
      }
      
      // Validate each student record
      const validRecords = data.records.filter((record): record is StudentRecord => {
        if (!record.student || !record.status) {
          console.error('Invalid student record:', record);
          return false;
        }
        return true;
      });
      
      if (validRecords.length === 0) {
        toast.error('No valid student records found');
        return;
      }
      
      // Format the data for the API
      const attendanceData = {
        class: data.class,
        subject: data.subject,
        date: data.date,
        session: data.session,
        notes: data.notes || '',
        records: validRecords.map(record => ({
          student: record.student,
          status: record.status,
          remark: record.remark || ''
        }))
      };
      
      console.log('Formatted Data for API:', attendanceData);
      
      await createAttendance.mutateAsync(attendanceData);
      setIsAddRecordOpen(false);
      refetchAttendance();
    } catch (err) {
      const error = err as Error;
      console.error('Error creating attendance:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to create attendance record');
    }
  };

  // Handle updating an attendance record
  const handleUpdateAttendance = async (data: UpdateAttendanceFormData) => {
    if (!selectedAttendanceId) return;

    try {
      await updateAttendance.mutateAsync({
        id: selectedAttendanceId,
        data
      });

      setIsEditRecordOpen(false);
      refetchAttendance();
      refetchSelectedAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  // Handle submitting an attendance record
  const handleSubmitAttendance = async (id: string) => {
    try {
      await submitAttendance.mutateAsync(id);
      refetchAttendance();
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  // Handle updating a student's attendance status
  const handleUpdateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudentRecords(prev => 
      prev.map(record => 
        record.student === studentId
          ? { ...record, status }
          : record
      )
    );
  };

  // Handle updating a student's remark
  const handleUpdateStudentRemark = (studentId: string, remark: string) => {
    setStudentRecords(prev => 
      prev.map(record => 
        record.student === studentId
          ? { ...record, remark }
          : record
      )
    );
  };

  // Handle opening the edit dialog
  const handleEditAttendance = (id: string) => {
    setSelectedAttendanceId(id);
    setIsEditRecordOpen(true);
  };

  // Handle opening the add dialog
  const handleAddAttendance = () => {
    // Reset form state
    setSelectedClass('select_class');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedSession('morning');
    setNotes('');
    setIsAddRecordOpen(true);
  };

  if (isLoadingClasses) return <LoadingSpinner />;

  // Calculate statistics 
  const totalRecords = attendanceRecords?.length || 0;
  const totalSubmitted = attendanceRecords?.filter(record => record.isSubmitted).length || 0;
  const totalPending = totalRecords - totalSubmitted;

  // Group records by class for easier display
  const recordsByClass = attendanceRecords?.reduce((acc, record) => {
    const classId = typeof record.class === 'string' ? record.class : record.class._id;
    const className = typeof record.class === 'string' 
      ? (classes?.find(c => c.class._id === record.class)?.class.name || 'Unknown Class')
      : record.class.name;
    
    if (!acc[classId]) {
      acc[classId] = {
        className: className,
        records: []
      };
    }
    acc[classId].records.push(record);
    return acc;
  }, {} as Record<string, {className: string, records: Attendance[]}>);

  return (
    <div className="space-y-6">
      <Flex direction="column" gap="6">
        {/* Header Section */}
        <Flex justify="between" align="center" gap="4">
          <Box>
            <Heading size="7" mb="1">Attendance Management</Heading>
            <Text color="gray" size="2">Manage attendance records for your classes</Text>
          </Box>
          <Button onClick={handleAddAttendance}>
            <PlusIcon />
            New Attendance Record
          </Button>
        </Flex>

        {/* Stats Overview */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="4">
          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box p="3" style={{ background: "var(--blue-3)", borderRadius: "50%" }}>
                <BookmarkIcon width="24" height="24" color="var(--blue-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">{totalRecords}</Text>
                <Text size="2" color="gray">Total Records</Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box p="3" style={{ background: "var(--green-3)", borderRadius: "50%" }}>
                <CheckIcon width="24" height="24" color="var(--green-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">{totalSubmitted}</Text>
                <Text size="2" color="gray">Submitted</Text>
              </Flex>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex align="center" gap="3">
              <Box p="3" style={{ background: "var(--amber-3)", borderRadius: "50%" }}>
                <PersonIcon width="24" height="24" color="var(--amber-9)" />
              </Box>
              <Flex direction="column">
                <Text size="6" weight="bold">{totalPending}</Text>
                <Text size="2" color="gray">Pending</Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {/* Filters */}
        <Card variant="surface">
          <Flex direction={{ initial: "column", sm: "row" }} gap="3" align="start" justify="between">
            <Flex gap="3" align="center" wrap="wrap">
              <Text weight="bold">Filter:</Text>
              
              <Select.Root 
                size="2" 
                value={selectedClass} 
                onValueChange={setSelectedClass}
              >
                <Select.Trigger placeholder="All Classes" />
                <Select.Content>
                  <Select.Item value="all_classes">All Classes</Select.Item>
                  {classes?.map((cls) => (
                    <Select.Item key={cls.class._id} value={cls.class._id}>
                      {cls.class.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Box>
                <TextField.Root>
                  <TextField.Slot>
                    <CalendarIcon height="16" width="16" />
                  </TextField.Slot>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </TextField.Root>
              </Box>

              <Button variant="soft" onClick={() => refetchAttendance()}>
                <MagnifyingGlassIcon />
                Filter
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Attendance Records by Class */}
        {isLoadingAttendance ? (
          <LoadingSpinner />
        ) : attendanceRecords && attendanceRecords.length > 0 ? (
          Object.entries(recordsByClass || {}).map(([classId, classData]) => (
            <Card key={classId}>
              <Box p="4" pb="2">
                <Heading size="4">{classData.className}</Heading>
                <Separator my="3" size="4" />
              </Box>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Session</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Students</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Recorded By</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {classData.records.map((record) => {
                    // Handle the teacher name display
                    const recordedByName = typeof record.recordedBy === 'string'
                      ? 'Unknown'
                      : `${record.recordedBy.firstName} ${record.recordedBy.lastName}`;
                    
                    return (
                      <Table.Row key={record._id}>
                        <Table.Cell>
                          {format(new Date(record.date), 'dd MMM yyyy')}
                        </Table.Cell>
                        <Table.Cell>{record.session}</Table.Cell>
                        <Table.Cell>{record.records?.length || 0} students</Table.Cell>
                        <Table.Cell>
                          <Badge color={record.isSubmitted ? 'green' : 'yellow'}>
                            {record.isSubmitted ? 'Submitted' : 'Draft'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{recordedByName}</Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <Button 
                              size="1" 
                              variant="soft" 
                              onClick={() => handleEditAttendance(record._id)}
                            >
                              View / Edit
                            </Button>
                            {!record.isSubmitted && (
                              <Button 
                                size="1" 
                                variant="soft" 
                                color="green"
                                onClick={() => handleSubmitAttendance(record._id)}
                              >
                                <CheckIcon />
                                Submit
                              </Button>
                            )}
                            {/* Class details link */}
                            <Button
                              size="1"
                              variant="soft"
                              asChild
                            >
                              <Link to={`/teacher/classes/${classId}/attendance`}>
                                Class Details
                              </Link>
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Card>
          ))
        ) : (
          <Card>
            <Flex direction="column" align="center" justify="center" p="6" gap="4">
              <Box p="4" style={{ background: "var(--gray-3)", borderRadius: "50%" }}>
                <CalendarIcon width="32" height="32" />
              </Box>
              <Heading size="5">No Attendance Records</Heading>
              <Text align="center" color="gray">
                No attendance records found for the selected filters.
              </Text>
              <Button onClick={handleAddAttendance}>
                <PlusIcon />
                Create New Record
              </Button>
            </Flex>
          </Card>
        )}
      </Flex>

      {/* Add Record Dialog */}
      <Dialog.Root open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <Dialog.Content style={{ maxWidth: 650 }}>
          <Dialog.Title>New Attendance Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new attendance record for your class.
          </Dialog.Description>

          <AddAttendanceForm
            onSubmit={handleCreateAttendance}
            isSubmitting={createAttendance.isPending}
            classes={classes || []}
            onClose={() => setIsAddRecordOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Record Dialog */}
      <Dialog.Root open={isEditRecordOpen} onOpenChange={setIsEditRecordOpen}>
        <Dialog.Content style={{ maxWidth: 650 }}>
          <Dialog.Title>Edit Attendance Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update attendance record details.
          </Dialog.Description>

          {isLoadingSelectedAttendance ? (
            <LoadingSpinner />
          ) : selectedAttendance ? (
            <EditAttendanceForm
              onSubmit={handleUpdateAttendance}
              isSubmitting={updateAttendance.isPending}
              initialData={selectedAttendance}
              onClose={() => setIsEditRecordOpen(false)}
            />
          ) : (
            <Text>Failed to load attendance record.</Text>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TeacherAttendance; 