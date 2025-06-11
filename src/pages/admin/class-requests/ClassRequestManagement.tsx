import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Flex, 
  Heading, 
  Button, 
  Table, 
  Text, 
  Badge, 
  Select,
  AlertDialog,
  Box,
} from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/userService';
import { classService } from '../../../services/classService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { CheckIcon, Cross2Icon, EyeOpenIcon } from '@radix-ui/react-icons';
import { User, Class, ClassRequest } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface ProcessRequestParams {
  userId: string;
  requestId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

// Helper function to safely get class name
const safeGetClassName = (classItem: any, classes?: Class[]): string => {
  if (!classItem) return 'Unknown Class';
  
  if (typeof classItem === 'string') {
    const foundClass = classes?.find(c => c._id === classItem);
    return foundClass ? foundClass.name : 'Unknown Class';
  } else if (classItem.name) {
    return classItem.name;
  }
  
  return 'Unknown Class';
};

// Helper function to safely get ID from request
const safeGetRequestId = (request: any): string => {
  if (!request) return '';
  return (request._id as string) || '';
};

const ClassRequestManagement = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<{ userId: string; requestId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const itemsPerPage = 10;

  // Fetch all users with class requests
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-with-requests'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch all classes for reference
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  if (isLoadingUsers || isLoadingClasses) {
    return <LoadingSpinner />;
  }

  // Mock function to process requests (replace with actual API call)
  const processRequest = async ({ userId, requestId, action, reason }: ProcessRequestParams) => {
    // In a real implementation, call an API endpoint to process the request
    console.log(`Processing request ${requestId} for user ${userId}: ${action}`, reason);
    
    // For now, we'll just close the dialogs
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  // Flatten all class requests from users
  const allRequests = users
    ?.filter(user => user.classRequests && user.classRequests.length > 0)
    .flatMap(user => 
      (user.classRequests || []).map(request => ({
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userRole: user.role,
        request
      }))
    ) || [];

  // Apply filters
  const filteredRequests = allRequests.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.request.status === filterStatus;
    const matchesRole = filterRole === 'all' || item.userRole === filterRole;
    return matchesStatus && matchesRole;
  });

  // Paginate
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card size="4">
      <Flex direction="column" gap="5">
        <Heading size="5">Class Enrollment Requests</Heading>

        <Flex wrap="wrap" gap="3" align="end">
          {/* Status filter */}
          <Select.Root 
            value={filterStatus} 
            onValueChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
          >
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Item value="all">All Statuses</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="approved">Approved</Select.Item>
              <Select.Item value="rejected">Rejected</Select.Item>
            </Select.Content>
          </Select.Root>

          {/* Role filter */}
          <Select.Root 
            value={filterRole} 
            onValueChange={(value) => {
              setFilterRole(value);
              setCurrentPage(1);
            }}
          >
            <Select.Trigger placeholder="Filter by role" />
            <Select.Content>
              <Select.Item value="all">All Roles</Select.Item>
              <Select.Item value="teacher">Teachers</Select.Item>
              <Select.Item value="student">Students</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role in Class</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date Requested</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Text weight="medium">
                      {item.userName}
                    </Text>
                    <Text size="1" color="gray">
                      {item.userEmail}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={item.userRole === 'teacher' ? 'indigo' : 'cyan'}>
                      {item.userRole.charAt(0).toUpperCase() + item.userRole.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {safeGetClassName(item.request.class, classes)}
                  </Table.Cell>
                  <Table.Cell>
                    {item.request.roleInClass.charAt(0).toUpperCase() + item.request.roleInClass.slice(1)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(item.request.requestedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(item.request.status)}>
                      {item.request.status.charAt(0).toUpperCase() + item.request.status.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      {item.request.status === 'pending' && (
                        <>
                          <Button 
                            size="1" 
                            variant="soft" 
                            color="green"
                            onClick={() => {
                              setSelectedRequest({ 
                                userId: item.userId,
                                requestId: safeGetRequestId(item.request)
                              });
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckIcon /> Approve
                          </Button>
                          <Button 
                            size="1" 
                            variant="soft" 
                            color="red"
                            onClick={() => {
                              setSelectedRequest({ 
                                userId: item.userId,
                                requestId: safeGetRequestId(item.request)
                              });
                              setShowRejectDialog(true);
                            }}
                          >
                            <Cross2Icon /> Reject
                          </Button>
                        </>
                      )}
                      {item.request.status !== 'pending' && item.request.processedAt && (
                        <Text size="1" color="gray">
                          Processed on {formatDate(item.request.processedAt)}
                        </Text>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Box py="4">
                    <Text align="center">No class requests found</Text>
                  </Box>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <Flex justify="between" align="center" mt="4">
            <Text color="gray">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
            </Text>
            <Flex gap="2">
              <Button 
                variant="soft" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="soft" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>

      {/* Approve Confirmation Dialog */}
      <AlertDialog.Root
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Approve Class Request</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to approve this class enrollment request?
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="green" 
                onClick={() => selectedRequest && processRequest({
                  userId: selectedRequest.userId,
                  requestId: selectedRequest.requestId,
                  action: 'approve'
                })}
              >
                Approve
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Reject Dialog */}
      <AlertDialog.Root
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Reject Class Request</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to reject this class enrollment request?
          </AlertDialog.Description>

          <Box mt="3">
            <Text as="label" size="2" weight="bold">
              Reason for rejection (optional):
            </Text>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              style={{ 
                width: '100%', 
                marginTop: '8px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minHeight: '80px'
              }}
            />
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button 
                color="red" 
                onClick={() => selectedRequest && processRequest({
                  userId: selectedRequest.userId,
                  requestId: selectedRequest.requestId,
                  action: 'reject',
                  reason: rejectReason
                })}
              >
                Reject
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default ClassRequestManagement; 