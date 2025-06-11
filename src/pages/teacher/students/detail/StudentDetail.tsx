import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Tabs,
  Badge,
  Grid,
  Avatar
} from '@radix-ui/themes';
import { 
  PersonIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  HomeIcon,
  BookmarkIcon,
  FileIcon,
  CheckIcon,
  ClockIcon
} from '@radix-ui/react-icons';
import { studentService } from "../../../../services/studentService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../../utils/formatters";

const StudentDetail = () => {
  const { id } = useParams();

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student", id],
    queryFn: () => studentService.getStudent(id!),
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div>Error loading student details</div>;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Student Details</Heading>
      </Flex>

      {/* Student Overview */}
      <Card variant="classic">
        <Flex gap="4" align="start">
          <Avatar 
            size="6" 
            fallback={student?.firstName?.[0] || "S"} 
            radius="full"
            color="indigo"
          />
          
          <Box style={{ flex: 1 }}>
            <Heading size="5" mb="1">
              {student?.firstName} {student?.lastName}
            </Heading>
            
            <Flex gap="4" wrap="wrap">
              <Flex align="center" gap="1">
                <Badge color={student?.status === 'active' ? 'green' : 'red'}>
                  {student?.status}
                </Badge>
              </Flex>
              
              <Flex align="center" gap="1">
                <CalendarIcon />
                <Text size="2">
                  Joined: {formatDate(student?.createdAt || '')}
                </Text>
              </Flex>
              
              {student?.dateOfBirth && (
                <Flex align="center" gap="1">
                  <CalendarIcon />
                  <Text size="2">
                    DOB: {formatDate(student.dateOfBirth)}
                  </Text>
                </Flex>
              )}
              
              {student?.gender && (
                <Flex align="center" gap="1">
                  <PersonIcon />
                  <Text size="2">
                    Gender: {student.gender}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Contact Information */}
      <Card variant="classic">
        <Heading size="3" mb="3">Contact Information</Heading>
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          <Flex align="center" gap="2">
            <EnvelopeClosedIcon />
            <Text>{student?.email || 'No email provided'}</Text>
          </Flex>
          
          <Flex align="center" gap="2">
            <MobileIcon />
            <Text>{student?.phone || 'No phone provided'}</Text>
          </Flex>
          
          <Flex align="center" gap="2">
            <HomeIcon />
            <Text>{student?.address || 'No address provided'}</Text>
          </Flex>
        </Grid>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs.Root defaultValue="classes">
        <Tabs.List>
          <Tabs.Trigger value="classes">Classes</Tabs.Trigger>
          <Tabs.Trigger value="grades">Grades</Tabs.Trigger>
          <Tabs.Trigger value="attendance">Attendance</Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="classes">
            <Card>
              <Heading size="3" mb="3">Enrolled Classes</Heading>
              
              {student?.classes?.length === 0 ? (
                <Text color="gray">No classes enrolled</Text>
              ) : (
                <Flex direction="column" gap="3">
                  {student?.classes?.map(cls => (
                    <Card key={cls.class._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex direction="column" gap="1">
                          <Text weight="medium">{cls.class.name}</Text>
                          <Flex gap="2">
                            <Badge variant="surface" color="gray">{cls.class.year}</Badge>
                            <Badge variant="surface" color="gray">{cls.class.academicTerm}</Badge>
                          </Flex>
                        </Flex>
                        
                        <Flex gap="2" align="center">
                          <Badge 
                            color={
                              cls.status === 'approved' ? 'green' : 
                              cls.status === 'rejected' ? 'red' : 
                              'orange'
                            }
                          >
                            {cls.status}
                          </Badge>
                          
                          <Button asChild size="1" variant="soft">
                            <Link to={`/teacher/classes/${cls.class._id}`}>
                              View Class
                            </Link>
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="grades">
            <Card>
              <Heading size="3" mb="3">Grades</Heading>
              
              {!student?.grades || student.grades.length === 0 ? (
                <Text color="gray">No grades available</Text>
              ) : (
                <Flex direction="column" gap="3">
                  {student.grades.map(grade => (
                    <Card key={grade._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex direction="column" gap="1">
                          <Text weight="medium">{grade.assignment.title}</Text>
                          <Text size="2" color="gray">{grade.subject.name}</Text>
                        </Flex>
                        
                        <Flex gap="2" align="center">
                          <Badge color="blue">
                            {grade.score}/{grade.totalScore}
                          </Badge>
                          
                          <Text weight="medium">
                            {Math.round((grade.score / grade.totalScore) * 100)}%
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="attendance">
            <Card>
              <Heading size="3" mb="3">Attendance</Heading>
              
              {!student?.attendance || student.attendance.length === 0 ? (
                <Text color="gray">No attendance records available</Text>
              ) : (
                <Flex direction="column" gap="3">
                  {student.attendance.map(record => (
                    <Card key={record._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex direction="column" gap="1">
                          <Text weight="medium">{formatDate(record.date)}</Text>
                          <Text size="2" color="gray">{record.class.name}</Text>
                        </Flex>
                        
                        <Badge 
                          color={
                            record.status === 'present' ? 'green' : 
                            record.status === 'absent' ? 'red' : 
                            'orange'
                          }
                        >
                          {record.status}
                        </Badge>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default StudentDetail;