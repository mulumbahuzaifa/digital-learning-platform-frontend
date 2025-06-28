import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Table, 
  Badge,
  Grid,
  Box,
  Separator,
  Dialog
} from '@radix-ui/themes';
import { 
  ArrowLeftIcon, 
  Pencil2Icon, 
  TrashIcon, 
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  PersonIcon
} from '@radix-ui/react-icons';
import { attendanceService } from '../../../services/attendanceService';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils/formatters';
import { Attendance, AttendanceStatus } from '../../../types';
import toast from 'react-hot-toast';

// Helper function to get status badge color
const getStatusBadge = (status: AttendanceStatus) => {
  const colors = {
    present: 'green',
    absent: 'red',
    late: 'orange',
    excused: 'blue'
  };
  return colors[status] as 'green' | 'red' | 'orange' | 'blue';
};

const AttendanceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteAttendance, submitAttendance, verifyAttendance } = useAttendanceMutation();
  
  // Fetch attendance data
  const { data: attendance, isLoading, error } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => (id ? attendanceService.getAttendanceById(id) : Promise.reject('No ID provided')),
    enabled: !!id
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !attendance) {
    return (
      <Card size="4">
        <Flex direction="column" gap="3">
          <Heading>Error Loading Attendance</Heading>
          <Text>Failed to load attendance record. Please try again.</Text>
          <Button asChild>
            <Link to="/admin/attendance"><ArrowLeftIcon /> Back to Attendance</Link>
          </Button>
        </Flex>
      </Card>
    );
  }

  const handleDelete = async () => {
    try {
      if (id) {
        await deleteAttendance.mutateAsync(id);
        toast.success('Attendance record deleted successfully');
        navigate('/admin/attendance');
      }
    } catch (error) {
      toast.error('Failed to delete attendance record');
    }
  };

  const handleSubmit = async () => {
    try {
      if (id) {
        await submitAttendance.mutateAsync(id);
        toast.success('Attendance record submitted successfully');
      }
    } catch (error) {
      toast.error('Failed to submit attendance record');
    }
  };

  const handleVerify = async () => {
    try {
      if (id) {
        await verifyAttendance.mutateAsync(id);
        toast.success('Attendance record verified successfully');
      }
    } catch (error) {
      toast.error('Failed to verify attendance record');
    }
  };

  // Helper functions to get display names
  const getClassName = (attendance: Attendance) => {
    return typeof attendance.class === 'string' 
      ? attendance.class
      : attendance.class.name;
  };

  const getSubjectName = (attendance: Attendance) => {
    if (!attendance.subject) return 'N/A';
    return typeof attendance.subject === 'string' 
      ? attendance.subject
      : attendance.subject.name;
  };

  const getRecorderName = (attendance: Attendance) => {
    return typeof attendance.recordedBy === 'string' 
      ? attendance.recordedBy
      : `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`;
  };

  const getVerifierName = (attendance: Attendance) => {
    if (!attendance.verifiedBy) return 'N/A';
    return typeof attendance.verifiedBy === 'string' 
      ? attendance.verifiedBy
      : `${attendance.verifiedBy.firstName} ${attendance.verifiedBy.lastName}`;
  };

  const getStudentName = (record: any) => {
    if (!record.student) return 'Unknown Student';
    return typeof record.student === 'string'
      ? record.student
      : `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim() || 'Unknown';
  };

  // Calculate attendance statistics
  const stats = {
    total: attendance.records.length,
    present: attendance.records.filter(r => r.status === 'present').length,
    absent: attendance.records.filter(r => r.status === 'absent').length,
    late: attendance.records.filter(r => r.status === 'late').length,
    excused: attendance.records.filter(r => r.status === 'excused').length,
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        {/* Header */}
        <Flex justify="between" align="center">
          <Flex gap="3" align="center">
            <Button variant="soft" asChild>
              <Link to="/admin/attendance"><ArrowLeftIcon /></Link>
            </Button>
            <Heading size="5">Attendance Details</Heading>
          </Flex>
          <Flex gap="2">
            {!attendance.isVerified && !attendance.isSubmitted && (
              <Button asChild variant="soft">
                <Link to={`/admin/attendance/${id}/edit`}>
                  <Pencil2Icon /> Edit
                </Link>
              </Button>
            )}
            {!attendance.isVerified && attendance.isSubmitted && (
              <Button 
                color="green" 
                onClick={handleVerify}
                disabled={verifyAttendance.isPending}
              >
                <CheckIcon /> Verify
              </Button>
            )}
            {!attendance.isVerified && !attendance.isSubmitted && (
              <Button 
                color="blue" 
                onClick={handleSubmit}
                disabled={submitAttendance.isPending}
              >
                Submit
              </Button>
            )}
            {!attendance.isVerified && (
              <Button 
                color="red" 
                variant="soft" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <TrashIcon /> Delete
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Status Badge */}
        <Flex>
          {attendance.isVerified ? (
            <Badge color="green" size="2">Verified</Badge>
          ) : attendance.isSubmitted ? (
            <Badge color="blue" size="2">Submitted</Badge>
          ) : (
            <Badge color="gray" size="2">Draft</Badge>
          )}
        </Flex>

        {/* Attendance Info */}
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <Card>
            <Flex direction="column" gap="3">
              <Heading size="3">Attendance Information</Heading>
              <Grid columns="2" gap="2">
                <Text weight="bold">Class:</Text>
                <Text>{getClassName(attendance)}</Text>
                
                <Text weight="bold">Subject:</Text>
                <Text>{getSubjectName(attendance)}</Text>
                
                <Text weight="bold">Date:</Text>
                <Flex gap="1" align="center">
                  <CalendarIcon />
                  <Text>{formatDate(attendance.date as string)}</Text>
                </Flex>
                
                <Text weight="bold">Session:</Text>
                <Flex gap="1" align="center">
                  <ClockIcon />
                  <Text>{attendance.session}</Text>
                </Flex>
                
                <Text weight="bold">Recorded By:</Text>
                <Flex gap="1" align="center">
                  <PersonIcon />
                  <Text>{getRecorderName(attendance)}</Text>
                </Flex>
                
                {attendance.isVerified && (
                  <>
                    <Text weight="bold">Verified By:</Text>
                    <Flex gap="1" align="center">
                      <PersonIcon />
                      <Text>{getVerifierName(attendance)}</Text>
                    </Flex>
                  </>
                )}
                
                {attendance.notes && (
                  <>
                    <Text weight="bold">Notes:</Text>
                    <Text>{attendance.notes}</Text>
                  </>
                )}
              </Grid>
            </Flex>
          </Card>

          <Card>
            <Flex direction="column" gap="3">
              <Heading size="3">Attendance Summary</Heading>
              <Grid columns="2" gap="2">
                <Text weight="bold">Total Students:</Text>
                <Text>{stats.total}</Text>
                
                <Text weight="bold">Present:</Text>
                <Flex gap="2" align="center">
                  <Badge color="green">{stats.present}</Badge>
                  <Text>{Math.round((stats.present / stats.total) * 100)}%</Text>
                </Flex>
                
                <Text weight="bold">Absent:</Text>
                <Flex gap="2" align="center">
                  <Badge color="red">{stats.absent}</Badge>
                  <Text>{Math.round((stats.absent / stats.total) * 100)}%</Text>
                </Flex>
                
                <Text weight="bold">Late:</Text>
                <Flex gap="2" align="center">
                  <Badge color="orange">{stats.late}</Badge>
                  <Text>{Math.round((stats.late / stats.total) * 100)}%</Text>
                </Flex>
                
                <Text weight="bold">Excused:</Text>
                <Flex gap="2" align="center">
                  <Badge color="blue">{stats.excused}</Badge>
                  <Text>{Math.round((stats.excused / stats.total) * 100)}%</Text>
                </Flex>
              </Grid>
            </Flex>
          </Card>
        </Grid>

        <Separator size="4" />

        {/* Attendance Records */}
        <Box>
          <Heading size="3" mb="3">Student Records</Heading>
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
              {attendance.records.map((record, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{getStudentName(record)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusBadge(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{record.timeIn || 'N/A'}</Table.Cell>
                  <Table.Cell>{record.timeOut || 'N/A'}</Table.Cell>
                  <Table.Cell>{record.remark || 'N/A'}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Attendance Record</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </Dialog.Description>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red" onClick={handleDelete}>Delete</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default AttendanceView; 