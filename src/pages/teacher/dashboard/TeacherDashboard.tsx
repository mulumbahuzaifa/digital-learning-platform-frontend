import { useAuth } from '../../../context/AuthProvider';
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
import { classService } from "../../../services/classService";
import { assignmentService } from "../../../services/assignmentService";
import { submissionService } from "../../../services/submissionService";
import { attendanceService } from "../../../services/attendanceService";
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
import { formatDate } from "../../../utils/formatters";

const TeacherDashboard = () => {
  const { user } = useAuth();

  // Fetch teacher's classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: () => assignmentService.getAllAssignments(),
  });

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["teacher-submissions"],
    queryFn: () => submissionService.getAllSubmissions(),
  });

  // Fetch attendance
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["teacher-attendance"],
    queryFn: () => attendanceService.getAllAttendance(),
  });

  if (isLoadingClasses || isLoadingAssignments || isLoadingSubmissions || isLoadingAttendance) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const totalStudents = classes?.reduce((acc: number, cls: any) => acc + (cls.students?.length || 0), 0) || 0;
  const pendingSubmissions = submissions?.filter((sub: any) => sub.status === 'pending').length || 0;
  const todayAttendance = attendance?.filter((att: any) => att.date === new Date().toISOString().split('T')[0]).length || 0;
  const upcomingAssignments = assignments?.filter((ass: any) => new Date(ass.dueDate) > new Date()).length || 0;

  // Get recent submissions
  const recentSubmissions = submissions?.slice(0, 5) || [];

  // Get upcoming assignments
  const upcomingAssignmentsList = assignments
    ?.filter((ass: any) => new Date(ass.dueDate) > new Date())
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <Flex justify="between" align="center">
        <Heading size="6">Teacher Dashboard</Heading>
        <Badge size="2" color="blue">Teaching Portal</Badge>
      </Flex>
      
      {/* Main Statistics */}
      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
        <DashboardCard 
          title="Total Students" 
          value={totalStudents} 
          icon={<PersonIcon width="24" height="24" />}
          linkTo="/teacher/classes"
          color="blue"
        />
        <DashboardCard 
          title="Active Classes" 
          value={classes?.length || 0} 
          icon={<BookmarkIcon width="24" height="24" />}
          linkTo="/teacher/classes"
          color="green"
        />
        <DashboardCard 
          title="Today's Attendance" 
          value={todayAttendance} 
          icon={<DashboardIcon width="24" height="24" />}
          linkTo="/teacher/attendance"
          color="amber"
        />
        <DashboardCard 
          title="Pending Submissions" 
          value={pendingSubmissions} 
          icon={<InfoCircledIcon width="24" height="24" />}
          linkTo="/teacher/submissions"
          color="orange"
          highlight={pendingSubmissions > 0}
        />
      </Grid>

      {/* Teaching Statistics */}
      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
        <DashboardCard 
          title="Total Assignments" 
          value={assignments?.length || 0} 
          icon={<ChatBubbleIcon width="24" height="24" />}
          linkTo="/teacher/assignments"
          color="crimson"
        />
        <DashboardCard 
          title="Upcoming Assignments" 
          value={upcomingAssignments} 
          icon={<EnvelopeClosedIcon width="24" height="24" />}
          linkTo="/teacher/assignments"
          color="purple"
          highlight={upcomingAssignments > 0}
        />
        <DashboardCard 
          title="Average Attendance" 
          value={`${Math.round((attendance?.filter(att => att.status === 'present').length || 0) / (attendance?.length || 1) * 100)}%`} 
          icon={<BarChartIcon width="24" height="24" />}
          linkTo="/teacher/attendance"
          color="indigo"
        />
        <DashboardCard 
          title="Class Performance" 
          value="View Report" 
          icon={<GlobeIcon width="24" height="24" />}
          linkTo="/teacher/gradebook"
          color="cyan"
        />
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        {/* Recent Submissions */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Recent Submissions</Heading>
              <Link to="/teacher/submissions" className="text-blue-500 hover:underline">
                <Text size="2">View All</Text>
              </Link>
            </Flex>
            
            {recentSubmissions.length > 0 ? (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Assignment</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {recentSubmissions.map((submission) => (
                    <Table.Row key={submission._id}>
                      <Table.Cell>{submission.studentName}</Table.Cell>
                      <Table.Cell>
                        <Text truncate style={{ maxWidth: '200px' }}>
                          {submission.assignmentName}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={
                            submission.status === 'pending' ? 'orange' : 
                            submission.status === 'graded' ? 'green' : 
                            submission.status === 'returned' ? 'red' : 'blue'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{formatDate(submission.submittedAt)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Box style={{ height: '200px' }} p="4">
                <Text>No recent submissions</Text>
              </Box>
            )}
          </Flex>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="4">Upcoming Assignments</Heading>
              <Link to="/teacher/assignments" className="text-blue-500 hover:underline">
                <Text size="2">View All</Text>
              </Link>
            </Flex>
            
            {upcomingAssignmentsList.length > 0 ? (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {upcomingAssignmentsList.map((assignment) => (
                    <Table.Row key={assignment._id}>
                      <Table.Cell>
                        <Text truncate style={{ maxWidth: '200px' }}>
                          {assignment.title}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{assignment.className}</Table.Cell>
                      <Table.Cell>{formatDate(assignment.dueDate)}</Table.Cell>
                      <Table.Cell>
                        <Badge 
                          color={
                            assignment.status === 'draft' ? 'gray' : 
                            assignment.status === 'published' ? 'green' : 'blue'
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Box style={{ height: '200px' }} p="4">
                <Text>No upcoming assignments</Text>
              </Box>
            )}
          </Flex>
        </Card>
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        {/* Quick Actions */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Quick Actions</Heading>
            <Grid columns="2" gap="2">
              <QuickLink to="/teacher/classes" label="View Classes" icon={<BookmarkIcon />} color="blue" />
              <QuickLink to="/teacher/assignments/create" label="Create Assignment" icon={<ChatBubbleIcon />} color="green" />
              <QuickLink to="/teacher/attendance" label="Take Attendance" icon={<DashboardIcon />} color="amber" />
              <QuickLink to="/teacher/gradebook" label="Update Grades" icon={<BarChartIcon />} color="crimson" />
              <QuickLink to="/teacher/content/create" label="Add Content" icon={<GlobeIcon />} color="purple" />
              <QuickLink to="/teacher/messages" label="Send Message" icon={<EnvelopeClosedIcon />} color="indigo" />
            </Grid>
          </Flex>
        </Card>

        {/* Class Overview */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Class Overview</Heading>
            <Flex gap="4" wrap="wrap">
              {classes?.map((cls) => (
                <ClassBox 
                  key={cls._id}
                  name={cls.name}
                  students={cls.students?.length || 0}
                  assignments={assignments?.filter(a => a.class === cls._id).length || 0}
                />
              ))}
            </Flex>
          </Flex>
        </Card>
      </Grid>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string | number;
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

interface ClassBoxProps {
  name: string;
  students: number;
  assignments: number;
}

const ClassBox = ({ name, students, assignments }: ClassBoxProps) => (
  <Card style={{ minWidth: '200px' }}>
    <Flex direction="column" gap="2">
      <Text weight="bold">{name}</Text>
      <Flex gap="4">
        <Flex direction="column" align="center">
          <Text size="5" weight="bold">{students}</Text>
          <Text size="1" color="gray">Students</Text>
        </Flex>
        <Flex direction="column" align="center">
          <Text size="5" weight="bold">{assignments}</Text>
          <Text size="1" color="gray">Assignments</Text>
        </Flex>
      </Flex>
    </Flex>
  </Card>
);

export default TeacherDashboard;