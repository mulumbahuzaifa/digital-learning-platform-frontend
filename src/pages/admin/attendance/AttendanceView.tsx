import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  Heading, 
  Flex, 
  Text, 
  Table, 
  Box, 
  Button, 
  Badge,
  Grid, 
  Separator 
} from '@radix-ui/themes';
import { attendanceService } from '../../../services/attendanceService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { Pencil2Icon, CheckIcon } from '@radix-ui/react-icons';
import { formatDate } from '../../../utils/formatters';
import { AttendanceStatus } from '../../../types';

const AttendanceView = () => {
  const { id } = useParams<{ id: string }>();
  const { submitAttendance, verifyAttendance } = useAttendanceMutation();

  // Fetch attendance details
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => (id ? attendanceService.getAttendanceById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  if (isLoading || !attendance) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async () => {
    if (id) {
      await submitAttendance.mutateAsync(id);
    }
  };

  const handleVerify = async () => {
    if (id) {
      await verifyAttendance.mutateAsync(id);
    }
  };

  const getClassName = () => {
    return typeof attendance.class === 'string' 
      ? attendance.class
      : attendance.class.name;
  };

  const getSubjectName = () => {
    return typeof attendance.subject === 'string' 
      ? attendance.subject
      : attendance.subject?.name || 'N/A';
  };

  const getRecorderName = () => {
    return typeof attendance.recordedBy === 'string' 
      ? attendance.recordedBy
      : `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`;
  };

  const getVerifierName = () => {
    if (!attendance.verifiedBy) return 'N/A';
    
    return typeof attendance.verifiedBy === 'string' 
      ? attendance.verifiedBy
      : `${attendance.verifiedBy.firstName} ${attendance.verifiedBy.lastName}`;
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const colors = {
      present: 'green',
      absent: 'red',
      late: 'orange',
      excused: 'blue'
    };
    return colors[status] as 'green' | 'red' | 'orange' | 'blue';
  };

  const getStudentName = (student: any) => {
    return typeof student === 'string' 
      ? student
      : `${student.firstName} ${student.lastName}`;
  };

  // Calculate attendance statistics
  const stats = attendance.records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<AttendanceStatus, number>);

  const presentPercentage = Math.round(
    ((stats.present || 0) / attendance.records.length) * 100
  );

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Attendance Details</Heading>
          <Flex gap="3">
            {!attendance.isVerified && !attendance.isSubmitted && (
              <Button asChild>
                <Link to={`/admin/attendance/${id}/edit`}>
                  <Pencil2Icon /> Edit
                </Link>
              </Button>
            )}
            {!attendance.isSubmitted && (
              <Button 
                color="blue" 
                onClick={handleSubmit}
                disabled={submitAttendance.isPending}
              >
                {submitAttendance.isPending ? 'Submitting...' : 'Submit Attendance'}
              </Button>
            )}
            {attendance.isSubmitted && !attendance.isVerified && (
              <Button 
                color="green" 
                onClick={handleVerify}
                disabled={verifyAttendance.isPending}
              >
                <CheckIcon /> {verifyAttendance.isPending ? 'Verifying...' : 'Verify Attendance'}
              </Button>
            )}
          </Flex>
        </Flex>

        <Grid columns="2" gap="4">
          <Box>
            <Text size="2" weight="bold">Class:</Text>
            <Text size="3">{getClassName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Subject:</Text>
            <Text size="3">{getSubjectName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Date:</Text>
            <Text size="3">{formatDate(attendance.date)}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Session:</Text>
            <Text size="3" style={{ textTransform: 'capitalize' }}>{attendance.session}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Recorded By:</Text>
            <Text size="3">{getRecorderName()}</Text>
          </Box>
          <Box>
            <Text size="2" weight="bold">Status:</Text>
            <Badge color={attendance.isVerified ? 'green' : attendance.isSubmitted ? 'blue' : 'gray'}>
              {attendance.isVerified ? 'Verified' : attendance.isSubmitted ? 'Submitted' : 'Draft'}
            </Badge>
          </Box>
          {attendance.isSubmitted && (
            <Box>
              <Text size="2" weight="bold">Submitted On:</Text>
              <Text size="3">{attendance.submittedAt ? formatDate(attendance.submittedAt) : 'N/A'}</Text>
            </Box>
          )}
          {attendance.isVerified && (
            <>
              <Box>
                <Text size="2" weight="bold">Verified By:</Text>
                <Text size="3">{getVerifierName()}</Text>
              </Box>
              <Box>
                <Text size="2" weight="bold">Verified On:</Text>
                <Text size="3">{attendance.verifiedAt ? formatDate(attendance.verifiedAt) : 'N/A'}</Text>
              </Box>
            </>
          )}
        </Grid>

        <Separator size="4" />

        {/* Attendance Statistics */}
        <Box>
          <Heading size="3" mb="3">Attendance Summary</Heading>
          <Grid columns="4" gap="3">
            <Card>
              <Flex direction="column" align="center" gap="1">
                <Text size="8" weight="bold" color="green">
                  {stats.present || 0}
                </Text>
                <Text size="2">Present</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" align="center" gap="1">
                <Text size="8" weight="bold" color="red">
                  {stats.absent || 0}
                </Text>
                <Text size="2">Absent</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" align="center" gap="1">
                <Text size="8" weight="bold" color="orange">
                  {stats.late || 0}
                </Text>
                <Text size="2">Late</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" align="center" gap="1">
                <Text size="8" weight="bold" color="blue">
                  {stats.excused || 0}
                </Text>
                <Text size="2">Excused</Text>
              </Flex>
            </Card>
          </Grid>
          <Flex justify="center" mt="4">
            <Card>
              <Flex direction="column" align="center" gap="1">
                <Text size="8" weight="bold">
                  {presentPercentage}%
                </Text>
                <Text size="2">Attendance Rate</Text>
              </Flex>
            </Card>
          </Flex>
        </Box>

        {/* Student Records */}
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
                  <Table.Cell>{getStudentName(record.student)}</Table.Cell>
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
    </Card>
  );
};

export default AttendanceView; 