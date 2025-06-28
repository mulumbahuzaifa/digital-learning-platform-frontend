import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
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
  TextArea
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CheckIcon,
  CalendarIcon
} from '@radix-ui/react-icons';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { attendanceService } from '../../../../services/attendanceService';
import { classService } from '../../../../services/classService';
import { useAttendanceMutation } from '../../../../hooks/useAttendanceMutation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Attendance, AttendanceSession, AttendanceStatus } from '../../../../types';

// Define the StudentClass interface here since it's not exported from types
interface StudentClass {
  status: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface StudentRecordData {
  student: string;
  studentName: string;
  status: AttendanceStatus;
  remark?: string;
}

const ClassAttendance = () => {
  const { id: classId } = useParams<{ id: string }>();
  
  // State for filters and form
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('morning');
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [studentRecords, setStudentRecords] = useState<StudentRecordData[]>([]);
  const [notes, setNotes] = useState('');

  // Get class details
  const { data: classDetails, isLoading: isLoadingClass } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => classService.getClassById(classId!),
    enabled: !!classId
  });

  // Get attendance records for this class
  const { 
    data: attendanceData, 
    isLoading: isLoadingAttendance,
    error: attendanceError,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['class-attendance'],
    queryFn: async () => {
      console.log('Running simplified attendance query for class');
      
      const data = await attendanceService.getTeacherAttendance();
      
      console.log('Query returned data for class attendance:', data);
      return data;
    },
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
    if (attendanceData) {
      setAttendanceRecords(attendanceData);
    }
  }, [attendanceData]);

  // Update studentRecords when class details change
  useEffect(() => {
    if (classDetails) {
      // Check if classDetails has enrolledStudents property (based on the StudentClass type)
      const enrolledStudents = 'enrolledStudents' in classDetails ? 
        classDetails.enrolledStudents : [];

      if (enrolledStudents && Array.isArray(enrolledStudents)) {
        // Map students to the format needed for attendance records
        const mappedStudents = enrolledStudents
          .filter((studentEntry: StudentClass) => studentEntry.status === 'approved')
          .map((studentEntry: StudentClass) => {
            const student = studentEntry.student;
            return {
              student: typeof student === 'string' ? student : student._id,
              studentName: typeof student === 'string' 
                ? 'Unknown Student' 
                : `${student.firstName} ${student.lastName}`,
              status: 'present' as AttendanceStatus // Default status
            };
          });
          
        setStudentRecords(mappedStudents);
      }
    }
  }, [classDetails]);

  // Update form when selected attendance changes
  useEffect(() => {
    if (selectedAttendance) {
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
            remark: record.remark || ''
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
      toast.error('Failed to fetch attendance records for this class. Please try again later.');
    }
  }, [attendanceError]);

  // Handle creating a new attendance record
  const handleCreateAttendance = async () => {
    if (!classId || !selectedDate || !selectedSession) {
      toast.error('Please select date and session');
      return;
    }

    try {
      const attendanceData = {
        class: classId,
        date: selectedDate,
        session: selectedSession,
        records: studentRecords.map(record => ({
          student: record.student,
          status: record.status,
          remark: record.remark
        })),
        notes: notes
      };

      await createAttendance.mutateAsync(attendanceData);
      setIsAddRecordOpen(false);
      refetchAttendance();
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  // Handle updating an attendance record
  const handleUpdateAttendance = async () => {
    if (!selectedAttendanceId) return;

    try {
      const attendanceData = {
        records: studentRecords.map(record => ({
          student: record.student,
          status: record.status,
          remark: record.remark
        })),
        notes: notes
      };

      await updateAttendance.mutateAsync({
        id: selectedAttendanceId,
        data: attendanceData
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
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedSession('morning');
    setNotes('');
    setIsAddRecordOpen(true);
  };

  if (isLoadingClass) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Box>
          <Heading size="6">{classDetails?.name} - Attendance</Heading>
          <Text size="2" color="gray">Manage attendance records for this class</Text>
        </Box>
        <Flex gap="3">
          <Button onClick={handleAddAttendance}>
            <PlusIcon />
            New Record
          </Button>
          <Button variant="soft" asChild>
            <Link to={`/teacher/classes/${classId}`}>
              Back to Class
            </Link>
          </Button>
        </Flex>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex align="center" gap="4">
            <CalendarIcon />
            <TextField.Root>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </TextField.Root>
            <Button variant="soft" onClick={() => refetchAttendance()}>
              <MagnifyingGlassIcon />
              Filter Records
            </Button>
          </Flex>

          {isLoadingAttendance ? (
            <LoadingSpinner />
          ) : (
            attendanceRecords && attendanceRecords.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Session</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Students</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {attendanceRecords.map((record) => (
                    <Table.Row key={record._id}>
                      <Table.Cell>
                        {format(new Date(record.date), 'dd MMM yyyy')}
                      </Table.Cell>
                      <Table.Cell>{record.session}</Table.Cell>
                      <Table.Cell>
                        <Badge color={record.isSubmitted ? 'green' : 'yellow'}>
                          {record.isSubmitted ? 'Submitted' : 'Draft'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{record.records?.length || 0} students</Table.Cell>
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
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Flex direction="column" align="center" justify="center" p="6" gap="4">
                <Text color="gray" size="3">No attendance records found</Text>
                <Button onClick={handleAddAttendance}>
                  <PlusIcon />
                  Create New Record
                </Button>
              </Flex>
            )
          )}
        </Flex>
      </Card>

      {/* Add Record Dialog */}
      <Dialog.Root open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <Dialog.Content style={{ maxWidth: 650 }}>
          <Dialog.Title>New Attendance Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new attendance record for {classDetails?.name}.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <Text as="div" size="2" mb="1" weight="bold">
                  Date
                </Text>
                <TextField.Root>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </TextField.Root>
              </Box>

              <Box style={{ flex: 1 }}>
                <Text as="div" size="2" mb="1" weight="bold">
                  Session
                </Text>
                <Select.Root 
                  value={selectedSession}
                  onValueChange={(value: AttendanceSession) => setSelectedSession(value)}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="morning">Morning</Select.Item>
                    <Select.Item value="afternoon">Afternoon</Select.Item>
                    <Select.Item value="full-day">Full Day</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                Notes
              </Text>
              <TextArea
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ minHeight: '80px' }}
              />
            </Box>

            {studentRecords.length > 0 && (
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
                    {studentRecords.map((student) => (
                      <Table.Row key={student.student}>
                        <Table.Cell>{student.studentName}</Table.Cell>
                        <Table.Cell>
                          <Select.Root 
                            value={student.status}
                            onValueChange={(value: AttendanceStatus) => 
                              handleUpdateStudentStatus(student.student, value)
                            }
                          >
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="present">Present</Select.Item>
                              <Select.Item value="absent">Absent</Select.Item>
                              <Select.Item value="late">Late</Select.Item>
                              <Select.Item value="excused">Excused</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Table.Cell>
                        <Table.Cell>
                          <TextField.Root>
                            <input
                              placeholder="Remark"
                              value={student.remark || ''}
                              onChange={(e) => 
                                handleUpdateStudentRemark(student.student, e.target.value)
                              }
                            />
                          </TextField.Root>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleCreateAttendance} disabled={createAttendance.isPending}>
              {createAttendance.isPending ? 'Creating...' : 'Create Record'}
            </Button>
          </Flex>
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
          ) : (
            <Flex direction="column" gap="3">
              <Flex gap="3">
                <Box style={{ flex: 1 }}>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Date
                  </Text>
                  <Text size="2">
                    {selectedAttendance 
                      ? format(new Date(selectedAttendance.date), 'dd MMM yyyy') 
                      : 'Loading...'}
                  </Text>
                </Box>

                <Box style={{ flex: 1 }}>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Session
                  </Text>
                  <Text size="2">
                    {selectedAttendance?.session || 'Loading...'}
                  </Text>
                </Box>
              </Flex>

              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  Notes
                </Text>
                <TextArea
                  placeholder="Add notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </Box>

              {studentRecords.length > 0 && (
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
                      {studentRecords.map((student) => (
                        <Table.Row key={student.student}>
                          <Table.Cell>{student.studentName}</Table.Cell>
                          <Table.Cell>
                            <Select.Root 
                              value={student.status}
                              onValueChange={(value: AttendanceStatus) => 
                                handleUpdateStudentStatus(student.student, value)
                              }
                            >
                              <Select.Trigger />
                              <Select.Content>
                                <Select.Item value="present">Present</Select.Item>
                                <Select.Item value="absent">Absent</Select.Item>
                                <Select.Item value="late">Late</Select.Item>
                                <Select.Item value="excused">Excused</Select.Item>
                              </Select.Content>
                            </Select.Root>
                          </Table.Cell>
                          <Table.Cell>
                            <TextField.Root>
                              <input
                                placeholder="Remark"
                                value={student.remark || ''}
                                onChange={(e) => 
                                  handleUpdateStudentRemark(student.student, e.target.value)
                                }
                              />
                            </TextField.Root>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Flex>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleUpdateAttendance} disabled={updateAttendance.isPending}>
              {updateAttendance.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default ClassAttendance; 