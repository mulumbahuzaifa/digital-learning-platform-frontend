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
  IconButton
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  TrashIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  CheckIcon
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
  AttendanceStatus
} from '../../../types';
import { ClassFromIndex } from '../../../types/class';

// This is a workaround for the ClassUnion type from classService
type ClassWithStudents = {
  _id: string;
  name: string;
  students: Array<{
    student: {
      _id: string;
      firstName: string;
      lastName: string;
      email?: string;
    };
    status: string;
    enrollmentType: string;
    enrolledBy: string;
    _id?: string;
    enrollmentDate?: string;
  }>;
  subjects: any[];
};

interface StudentRecordData {
  student: string;
  studentName: string;
  status: AttendanceStatus;
  remark?: string;
  timeIn?: string;
  timeOut?: string;
}

const TeacherAttendance = () => {
  // State for filters and form
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('morning');
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentRecords, setStudentRecords] = useState<StudentRecordData[]>([]);
  const [notes, setNotes] = useState('');

  // Get teacher's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => classService.getMyClasses(),
  });

  // Get attendance records
  const { 
    data: attendanceData, 
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['attendance', { class: selectedClass, date: selectedDate }],
    queryFn: () => attendanceService.getTeacherAttendance({ 
      class: selectedClass || undefined,
      date: selectedDate || undefined
    }),
    enabled: !!selectedClass
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
    deleteAttendance,
    submitAttendance
  } = useAttendanceMutation();

  // Update local state when attendance data changes
  useEffect(() => {
    if (attendanceData) {
      setAttendanceRecords(attendanceData);
    }
  }, [attendanceData]);

  // Update studentRecords when selected class changes
  useEffect(() => {
    if (selectedClass && classes) {
      const classObj = classes.find((cls: any) => cls._id === selectedClass) as ClassWithStudents | undefined;
      
      if (classObj && classObj.students) {
        // Map students to the format needed for attendance records
        const mappedStudents = classObj.students
          .filter((studentEntry) => studentEntry.status === 'approved')
          .map((studentEntry) => {
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

  // Handle creating a new attendance record
  const handleCreateAttendance = async () => {
    if (!selectedClass || !selectedDate || !selectedSession) {
      toast.error('Please select class, date, and session');
      return;
    }

    try {
      const attendanceData = {
        class: selectedClass,
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

  // Handle deleting an attendance record
  const handleDeleteAttendance = async () => {
    if (!selectedAttendanceId) return;

    try {
      await deleteAttendance.mutateAsync(selectedAttendanceId);
      setIsDeleteDialogOpen(false);
      setSelectedAttendanceId(null);
      refetchAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);
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
    setSelectedClass('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedSession('morning');
    setNotes('');
    setStudentRecords([]);
    setIsAddRecordOpen(true);
  };

  // Show loading spinner while data is loading
  if (isLoadingClasses) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Attendance Management</Heading>
        <Flex gap="2">
          <Button variant="soft" onClick={() => window.print()}>
            <DownloadIcon />
            Export
          </Button>
          <Button onClick={handleAddAttendance}>
            <PlusIcon />
            New Record
          </Button>
        </Flex>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Flex gap="2">
              <Select.Root 
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <Select.Trigger placeholder="Select class" />
                <Select.Content>
                  {classes && classes.map((cls: any) => (
                    <Select.Item key={cls._id} value={cls._id}>
                      {cls.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <TextField.Root>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </TextField.Root>
            </Flex>

            <Button variant="soft">
              <MagnifyingGlassIcon />
              Search
            </Button>
          </Flex>

          {isLoadingAttendance ? (
            <LoadingSpinner />
          ) : selectedClass ? (
            attendanceRecords && attendanceRecords.length > 0 ? (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
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
                  <Table.Cell>
                        {typeof record.class === 'string' 
                          ? record.class 
                          : record.class.name}
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
                          <IconButton 
                            size="1" 
                            variant="soft" 
                            onClick={() => handleEditAttendance(record._id)}
                          >
                            <PlusIcon />
                          </IconButton>
                          {!record.isSubmitted && (
                            <IconButton 
                              size="1" 
                        variant="soft" 
                        color="green"
                              onClick={() => handleSubmitAttendance(record._id)}
                      >
                        <CheckIcon />
                            </IconButton>
                          )}
                          <IconButton 
                            size="1" 
                        variant="soft" 
                        color="red"
                            onClick={() => {
                              setSelectedAttendanceId(record._id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <TrashIcon />
                          </IconButton>
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
          ) : (
            <Flex direction="column" align="center" justify="center" p="6" gap="4">
              <Text color="gray" size="3">Please select a class to view attendance records</Text>
            </Flex>
          )}
        </Flex>
      </Card>

      {/* Add Record Dialog */}
      <Dialog.Root open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <Dialog.Content style={{ maxWidth: 650 }}>
          <Dialog.Title>New Attendance Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new attendance record for the class.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <Text as="div" size="2" mb="1" weight="bold">
                  Class
                </Text>
                <Select.Root 
                  value={selectedClass}
                  onValueChange={(value) => setSelectedClass(value)}
                >
                  <Select.Trigger placeholder="Select class" />
                  <Select.Content>
                    {classes && classes.map((cls: any) => (
                      <Select.Item key={cls._id} value={cls._id}>
                        {cls.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

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
            </Flex>

            <Box>
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
                    Class
                  </Text>
                  <Text size="2">
                    {selectedAttendance && typeof selectedAttendance.class === 'object' 
                      ? selectedAttendance.class.name 
                      : 'Loading...'}
                  </Text>
                </Box>

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

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Attendance Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" onClick={handleDeleteAttendance} disabled={deleteAttendance.isPending}>
              {deleteAttendance.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TeacherAttendance; 