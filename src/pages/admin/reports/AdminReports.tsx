import React, { useState } from 'react';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Select,
  Grid,
  Table,
  Badge
} from '@radix-ui/themes';
import { 
  BarChartIcon, 
  PieChartIcon, 
  DownloadIcon,
  CalendarIcon
} from '@radix-ui/react-icons';

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalUsers: 1250,
      activeUsers: 850,
      totalClasses: 45,
      activeClasses: 38,
      totalContent: 320,
      totalAssignments: 156
    },
    userActivity: [
      { date: '2024-03-01', activeUsers: 450, newUsers: 25 },
      { date: '2024-03-02', activeUsers: 480, newUsers: 30 },
      { date: '2024-03-03', activeUsers: 520, newUsers: 35 },
      { date: '2024-03-04', activeUsers: 490, newUsers: 28 },
      { date: '2024-03-05', activeUsers: 510, newUsers: 32 }
    ],
    classPerformance: [
      { class: 'Mathematics 101', students: 45, completion: 85, avgScore: 78 },
      { class: 'Physics 201', students: 38, completion: 92, avgScore: 82 },
      { class: 'Chemistry 101', students: 42, completion: 88, avgScore: 75 },
      { class: 'Biology 201', students: 35, completion: 90, avgScore: 80 }
    ]
  };

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Platform Reports</Heading>
        <Flex gap="2">
          <Select.Root 
            value={dateRange}
            onValueChange={setDateRange}
          >
            <Select.Trigger>
              <CalendarIcon />
              <Text>Last 30 Days</Text>
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="last7days">Last 7 Days</Select.Item>
              <Select.Item value="last30days">Last 30 Days</Select.Item>
              <Select.Item value="last90days">Last 90 Days</Select.Item>
              <Select.Item value="custom">Custom Range</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button>
            <DownloadIcon />
            <Text>Export</Text>
          </Button>
        </Flex>
      </Flex>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">Overview</Heading>
            <Grid columns="2" gap="4">
              <StatCard 
                title="Total Users" 
                value={mockData.overview.totalUsers}
                icon={<BarChartIcon />}
                color="blue"
              />
              <StatCard 
                title="Active Users" 
                value={mockData.overview.activeUsers}
                icon={<PieChartIcon />}
                color="green"
              />
              <StatCard 
                title="Total Classes" 
                value={mockData.overview.totalClasses}
                icon={<BarChartIcon />}
                color="amber"
              />
              <StatCard 
                title="Active Classes" 
                value={mockData.overview.activeClasses}
                icon={<BarChartIcon />}
                color="purple"
              />
            </Grid>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">User Activity</Heading>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Active Users</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>New Users</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {mockData.userActivity.map((day, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{day.date}</Table.Cell>
                    <Table.Cell>{day.activeUsers}</Table.Cell>
                    <Table.Cell>
                      <Badge color="green">+{day.newUsers}</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Card>
      </Grid>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Heading size="4">Class Performance</Heading>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Class</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Students</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Completion Rate</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Average Score</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {mockData.classPerformance.map((classData, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{classData.class}</Table.Cell>
                  <Table.Cell>{classData.students}</Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={
                        classData.completion >= 90 ? 'green' : 
                        classData.completion >= 80 ? 'blue' : 'amber'
                      }
                    >
                      {classData.completion}%
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={
                        classData.avgScore >= 80 ? 'green' : 
                        classData.avgScore >= 70 ? 'blue' : 'amber'
                      }
                    >
                      {classData.avgScore}%
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card>
    <Flex direction="column" gap="2" p="3">
      <Flex justify="between" align="center">
        <Text size="2" color="gray">{title}</Text>
        <Box style={{ color: `var(--${color}-9)` }}>{icon}</Box>
      </Flex>
      <Text size="5" weight="bold">{value}</Text>
    </Flex>
  </Card>
);

export default AdminReports; 