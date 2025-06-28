import { useState, ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Table, 
  Text,
  Button, 
  Badge,
  Select,
  TextField,
  Dialog
} from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../../services/attendanceService';
import { classService } from '../../../services/classService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, Pencil2Icon, TrashIcon, EyeOpenIcon, CheckIcon } from '@radix-ui/react-icons';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { formatDate } from '../../../utils/formatters';
import { Attendance } from '../../../types';

const AttendanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [attendanceToDelete, setAttendanceToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { deleteAttendance, verifyAttendance } = useAttendanceMutation();

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', { class: classFilter !== 'all' ? classFilter : undefined, date: dateFilter || undefined }],
    queryFn: () => attendanceService.getAllAttendance({
      class: classFilter !== 'all' ? classFilter : undefined,
      date: dateFilter || undefined
    }),
  });

  // Fetch classes for filter
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  if (isLoadingAttendance || isLoadingClasses) {
    return <LoadingSpinner />;
  }

  // Filter attendance records based on search
  const filteredAttendance = attendanceRecords?.filter(attendance => {
    if (!searchTerm) return true;
    
    // Search in class name
    const className = typeof attendance.class === 'string' 
      ? classes?.find(c => c._id === attendance.class)?.name || ''
      : attendance.class.name;
    
    return className.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Paginate filtered attendance
  const paginatedAttendance = filteredAttendance.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleDateFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1); // Reset to first page when date filter changes
  };

  const handleDeleteAttendance = async () => {
    if (attendanceToDelete) {
      await deleteAttendance.mutateAsync(attendanceToDelete);
      setAttendanceToDelete(null);
    }
  };

  const handleVerifyAttendance = async (id: string) => {
    await verifyAttendance.mutateAsync(id);
  };

  const getClassName = (attendance: Attendance) => {
    return typeof attendance.class === 'string' 
      ? classes?.find(c => c._id === attendance.class)?.name || attendance.class
      : attendance.class.name;
  };

  const getRecorderName = (attendance: Attendance) => {
    return typeof attendance.recordedBy === 'string' 
      ? attendance.recordedBy
      : `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`;
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Flex justify="between" align="center">
          <Heading size="5">Attendance Management</Heading>
          <Button asChild>
            <Link to="/admin/attendance/create">Record New Attendance</Link>
          </Button>
        </Flex>

        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" wrap="wrap" gap="3">
            <Box style={{ minWidth: '250px', flexGrow: 1 }}>
              <TextField.Root placeholder="Search by class..."
                    value={searchTerm}
                    onChange={handleSearchChange}>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            
            <Flex gap="3" wrap="wrap">
              <Select.Root 
                value={classFilter} 
                onValueChange={setClassFilter}
              >
                <Select.Trigger placeholder="Filter by class" />
                <Select.Content>
                  <Select.Item value="all">All Classes</Select.Item>
                  {classes?.map(c => (
                    <Select.Item key={c._id} value={c._id}>
                      {c.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    placeholder="Filter by date"
                  />
            </Flex>
          </Flex>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Session</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Students Count</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Recorded By</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {paginatedAttendance.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text align="center" color="gray">No attendance records found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                paginatedAttendance.map((attendance) => (
                  <Table.Row key={attendance._id}>
                    <Table.Cell>{getClassName(attendance)}</Table.Cell>
                    <Table.Cell>{formatDate(attendance.date as string)}</Table.Cell>
                    <Table.Cell>{attendance.session}</Table.Cell>
                    <Table.Cell>{attendance.records.length}</Table.Cell>
                    <Table.Cell>{getRecorderName(attendance)}</Table.Cell>
                    <Table.Cell>
                      {attendance.isVerified ? (
                        <Badge color="green">Verified</Badge>
                      ) : attendance.isSubmitted ? (
                        <Badge color="blue">Submitted</Badge>
                      ) : (
                        <Badge color="gray">Draft</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Button asChild size="1" variant="soft">
                          <Link to={`/admin/attendance/${attendance._id}`}>
                            <EyeOpenIcon />
                          </Link>
                        </Button>
                        {!attendance.isVerified && (
                          <>
                            <Button asChild size="1" variant="soft">
                              <Link to={`/admin/attendance/${attendance._id}/edit`}>
                                <Pencil2Icon />
                              </Link>
                            </Button>
                            <Button 
                              size="1" 
                              variant="soft" 
                              color="red"
                              onClick={() => setAttendanceToDelete(attendance._id)}
                            >
                              <TrashIcon />
                            </Button>
                            {attendance.isSubmitted && (
                              <Button 
                                size="1" 
                                variant="soft" 
                                color="green"
                                onClick={() => handleVerifyAttendance(attendance._id)}
                                disabled={verifyAttendance.isPending}
                              >
                                <CheckIcon />
                              </Button>
                            )}
                          </>
                        )}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

          {filteredAttendance.length > 0 && (
            <Flex justify="between" align="center" mt="4">
              <Text color="gray">
                Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} records
              </Text>
              <Flex gap="2">
                <Button 
                  variant="soft" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="soft" 
                  disabled={(page * itemsPerPage) >= filteredAttendance.length}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Delete Confirmation Dialog */}
        <Dialog.Root
        open={!!attendanceToDelete}
        onOpenChange={() => setAttendanceToDelete(null)}
      >
        <Dialog.Trigger>
          <Button color="red" variant="soft" onClick={() => setAttendanceToDelete(attendanceToDelete)}>
            <TrashIcon />
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete Attendance Record</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </Dialog.Description>
          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red" variant="soft" onClick={handleDeleteAttendance}>
                Delete
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default AttendanceManagement; 