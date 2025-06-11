import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  Grid, 
  Flex, 
  Text, 
  Heading, 
  Box,
  Badge,
  Table
} from '@radix-ui/themes';
import { userService } from "../../../services/userService";
import { classService } from "../../../services/classService"; 
import { subjectService } from "../../../services/subjectService";
import { feedbackService } from "../../../services/feedbackService";
import { messageService } from "../../../services/messageService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { 
  PersonIcon, 
  BookmarkIcon, 
  DashboardIcon,
  ChatBubbleIcon,
  EnvelopeClosedIcon,
  BarChartIcon,
  GlobeIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons';
import { Link } from "react-router-dom";
import { UserRole, Feedback, ClassRequest } from "../../../types";
import { formatDate } from "../../../utils/formatters";

const AdminDashboard = () => {
  // Fetch basic statistics
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-count"],
    queryFn: () => userService.getAllUsers(),
  });

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes-count"],
    queryFn: () => classService.getAllClasses(),
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects-count"],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Fetch communication data
  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: () => feedbackService.getFeedback(),
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages"],
    queryFn: () => messageService.getMessages(),
  });

  if (isLoadingUsers || isLoadingClasses || isLoadingSubjects || 
      isLoadingFeedbacks || isLoadingMessages) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const countsByRole = users?.reduce((acc, user) => {
    const role = user.role as UserRole;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, { admin: 0, teacher: 0, student: 0 } as Record<UserRole, number>);

  // Calculate pending class requests
  const pendingRequests = users?.reduce((count, user) => {
    if (user.classRequests) {
      const pendingCount = user.classRequests.filter(
        (request: ClassRequest) => request.status === 'pending'
      ).length;
      return count + pendingCount;
    }
    return count;
  }, 0) || 0;

  // Calculate pending feedback
  const pendingFeedback = feedbacks?.filter(
    feedback => feedback.status === 'submitted'
  ).length || 0;

  // Calculate unread messages
  const unreadMessages = messages?.filter(
    message => !message.isRead
  ).length || 0;

  // Get recent feedbacks
  const recentFeedbacks = feedbacks?.slice(0, 5) || [];

  // Get recent class requests
  const recentRequests = users?.reduce((requests, user) => {
    if (user.classRequests && user.classRequests.length > 0) {
      const userRequests = user.classRequests.map(request => ({
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        ...request
      }));
      requests.push(...userRequests);
    }
    return requests;
  }, [] as any[])
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <Flex justify="between" align="center">
        <Heading size="6">NEWSOMA - Dashboard</Heading>
        <Badge size="2" color="blue">Digital Learning Platform</Badge>
      </Flex>
      
      {/* Main Statistics */}
      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
        <DashboardCard 
          title="Total Users" 
          value={users?.length || 0} 
          icon={<PersonIcon width="24" height="24" />}
          linkTo="/admin/users"
          color="blue"
        />
        <DashboardCard 
          title="Teachers" 
          value={countsByRole?.teacher || 0} 
          icon={<PersonIcon width="24" height="24" />}
          linkTo="/admin/teachers"
          color="indigo"
        />
        <DashboardCard 
          title="Students" 
          value={countsByRole?.student || 0} 
          icon={<PersonIcon width="24" height="24" />}
          linkTo="/admin/users"
          color="cyan"
        />
        <DashboardCard 
          title="Classes" 
          value={classes?.length || 0} 
          icon={<BookmarkIcon width="24" height="24" />}
          linkTo="/admin/classes"
          color="green"
        />
      </Grid>

      {/* Communication Statistics */}
      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
        <DashboardCard 
          title="Subjects" 
          value={subjects?.length || 0} 
          icon={<DashboardIcon width="24" height="24" />}
          linkTo="/admin/subjects"
          color="amber"
        />
        <DashboardCard 
          title="Pending Requests" 
          value={pendingRequests} 
          icon={<InfoCircledIcon width="24" height="24" />}
          linkTo="/admin/class-requests"
          color="orange"
          highlight={pendingRequests > 0}
        />
        <DashboardCard 
          title="Pending Feedback" 
          value={pendingFeedback} 
          icon={<ChatBubbleIcon width="24" height="24" />}
          linkTo="/admin/feedback"
          color="crimson"
          highlight={pendingFeedback > 0}
        />
        <DashboardCard 
          title="Unread Messages" 
          value={unreadMessages} 
          icon={<EnvelopeClosedIcon width="24" height="24" />}
          linkTo="/admin/messages"
          color="purple"
          highlight={unreadMessages > 0}
        />
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        {/* Recent Feedback */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Recent Feedback</Heading>
              <Link to="/admin/feedback" className="text-blue-500 hover:underline">
                <Text size="2">View All</Text>
              </Link>
            </Flex>
            
            {recentFeedbacks.length > 0 ? (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Content</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {recentFeedbacks.map((feedback) => (
                    <Table.Row key={feedback._id}>
                      <Table.Cell>
                        <Badge color="blue">{feedback.feedbackType}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text truncate style={{ maxWidth: '200px' }}>
                          {feedback.content}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={
                            feedback.status === 'submitted' ? 'orange' : 
                            feedback.status === 'reviewed' ? 'blue' : 
                            feedback.status === 'actioned' ? 'purple' : 'green'
                          }
                        >
                          {feedback.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{formatDate(feedback.createdAt)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Box style={{ height: '200px' }} p="4">
                <Text>No recent feedback</Text>
              </Box>
            )}
          </Flex>
        </Card>

        {/* Recent Class Requests */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Class Enrollment Requests</Heading>
              <Link to="/admin/class-requests" className="text-blue-500 hover:underline">
                <Text size="2">View All</Text>
              </Link>
            </Flex>
            
            {recentRequests.length > 0 ? (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {recentRequests.map((request, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{request.userName}</Table.Cell>
                      <Table.Cell>
                        <Badge color={request.userRole === 'teacher' ? 'indigo' : 'cyan'}>
                          {request.userRole}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={
                            request.status === 'pending' ? 'orange' : 
                            request.status === 'approved' ? 'green' : 'red'
                          }
                        >
                          {request.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{formatDate(request.requestedAt)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Box style={{ height: '200px' }} p="4">
                <Text>No class requests</Text>
              </Box>
            )}
          </Flex>
        </Card>
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        {/* Activity Stats */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Platform Activity</Heading>
            <Flex gap="4" wrap="wrap">
              <StatBox title="Active Classes" value={classes?.filter(c => true).length || 0} icon={<BarChartIcon />} />
              <StatBox title="Teacher Qualifications" value={users?.reduce((count, user) => count + (user.profile?.qualifications?.length || 0), 0) || 0} icon={<GlobeIcon />} />
              <StatBox title="Total Feedback" value={feedbacks?.length || 0} icon={<ChatBubbleIcon />} />
              <StatBox title="Total Messages" value={messages?.length || 0} icon={<EnvelopeClosedIcon />} />
            </Flex>
          </Flex>
        </Card>

        {/* Quick Links */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Quick Actions</Heading>
            <Grid columns="2" gap="2">
              <QuickLink to="/admin/users/create" label="Add User" icon={<PersonIcon />} color="blue" />
              <QuickLink to="/admin/classes/create" label="Create Class" icon={<BookmarkIcon />} color="green" />
              <QuickLink to="/admin/feedback/create" label="Send Feedback" icon={<ChatBubbleIcon />} color="crimson" />
              <QuickLink to="/admin/messages/create" label="Send Message" icon={<EnvelopeClosedIcon />} color="purple" />
              <QuickLink to="/admin/subjects/create" label="Add Subject" icon={<DashboardIcon />} color="amber" />
              <QuickLink to="/admin/qualifications" label="Qualifications" icon={<GlobeIcon />} color="indigo" />
            </Grid>
          </Flex>
        </Card>
      </Grid>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  linkTo: string;
  color: string;
  highlight?: boolean;
}

const DashboardCard = ({ title, value, icon, linkTo, color, highlight = false }: DashboardCardProps) => (
  <Card asChild style={{ 
    borderLeft: highlight ? `4px solid var(--${color}-9)` : undefined,
    transition: 'transform 0.2s',
  }}>
    <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}
         className="hover:translate-y-[-3px]">
      <Flex align="center" gap="3">
        <Box p="2" style={{ 
          background: `var(--${color}-3)`, 
          borderRadius: '50%',
          color: `var(--${color}-9)`
        }}>
          {icon}
        </Box>
        <Flex direction="column">
          <Text size="2" color="gray">{title}</Text>
          <Text size="6" weight="bold">{value}</Text>
        </Flex>
      </Flex>
    </Link>
  </Card>
);

interface StatBoxProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatBox = ({ title, value, icon }: StatBoxProps) => (
  <Flex direction="column" align="center" gap="1" style={{ minWidth: '100px' }}>
    <Box style={{ color: 'var(--accent-9)' }}>{icon}</Box>
    <Text weight="bold" size="5">{value}</Text>
    <Text size="1" color="gray">{title}</Text>
  </Flex>
);

interface QuickLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const QuickLink = ({ to, label, icon, color }: QuickLinkProps) => (
  <Link to={to} style={{ textDecoration: 'none' }} 
       className="transition-all duration-200 hover:translate-y-[-2px]">
    <Card style={{ 
      background: `var(--${color}-3)`, 
      color: `var(--${color}-9)`,
      transition: 'all 0.2s',
    }}
    className={`hover:bg-[var(--${color}-4)]`}>
      <Flex align="center" gap="2">
        <Box>{icon}</Box>
        <Text weight="medium">{label}</Text>
      </Flex>
    </Card>
  </Link>
);

export default AdminDashboard; 