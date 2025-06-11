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
  Grid
} from '@radix-ui/themes';
import { 
  PersonIcon,
  CalendarIcon,
  BookmarkIcon,
  ReaderIcon,
  FileIcon,
  ClockIcon,
  CheckIcon
} from '@radix-ui/react-icons';
import { classService } from "../../../../services/classService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../../utils/formatters";

const ClassDetail = () => {
  const { id } = useParams();

  const { data: classData, isLoading, error } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classService.getClass(id!),
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div>Error loading class details</div>;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">{classData?.name}</Heading>
        
        <Flex gap="3">
          <Button variant="soft" asChild>
            <Link to={`/teacher/classes/${id}/edit`}>
              Edit Class
            </Link>
          </Button>
        </Flex>
      </Flex>

      {/* Class Overview Card */}
      <Card variant="classic">
        <Grid columns={{ initial: "1", md: "3" }} gap="4">
          <Box>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">Class Details</Text>
              <Flex align="center" gap="2">
                <ReaderIcon />
                <Text>Code: {classData?.code}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <CalendarIcon />
                <Text>Year: {classData?.year}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <ClockIcon />
                <Text>Term: {classData?.academicTerm}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <CheckIcon />
                <Text>Status: {classData?.isActive ? 
                  <Badge color="green">Active</Badge> : 
                  <Badge color="red">Inactive</Badge>
                }</Text>
              </Flex>
            </Flex>
          </Box>

          <Box>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">Description</Text>
              <Text>{classData?.description}</Text>
            </Flex>
          </Box>

          <Box>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">Summary</Text>
              <Flex align="center" gap="2">
                <PersonIcon />
                <Text>Students: {classData?.students?.length || 0}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <BookmarkIcon />
                <Text>Subjects: {classData?.subjects?.length || 0}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <FileIcon />
                <Text>Created: {formatDate(classData?.createdAt || '')}</Text>
              </Flex>
            </Flex>
          </Box>
        </Grid>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs.Root defaultValue="students">
        <Tabs.List>
          <Tabs.Trigger value="students">Students</Tabs.Trigger>
          <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
          <Tabs.Trigger value="prefects">Prefects</Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="students">
            <Card>
              <Flex justify="between" mb="4">
                <Text size="3" weight="bold">Students</Text>
                <Button asChild>
                  <Link to={`/teacher/classes/${id}/students`}>
                    View All Students
                  </Link>
                </Button>
              </Flex>
              
              {!classData?.students?.length ? (
                <Text color="gray">No students in this class yet.</Text>
              ) : (
                <Flex direction="column" gap="2">
                  {classData.students.slice(0, 5).map(student => (
                    <Card key={student._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                          <PersonIcon />
                          <Text>{student.student.firstName} {student.student.lastName}</Text>
                        </Flex>
                        <Badge color={
                          student.status === 'approved' ? 'green' : 
                          student.status === 'rejected' ? 'red' : 
                          'orange'
                        }>
                          {student.status}
                        </Badge>
                      </Flex>
                    </Card>
                  ))}
                  {classData.students.length > 5 && (
                    <Text size="2" color="gray" align="center">
                      +{classData.students.length - 5} more students
                    </Text>
                  )}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="subjects">
            <Card>
              <Flex justify="between" mb="4">
                <Text size="3" weight="bold">Subjects</Text>
                <Button asChild>
                  <Link to={`/teacher/classes/${id}/subjects`}>
                    View All Subjects
                  </Link>
                </Button>
              </Flex>
              
              {!classData?.subjects?.length ? (
                <Text color="gray">No subjects assigned to this class yet.</Text>
              ) : (
                <Flex direction="column" gap="2">
                  {classData.subjects.slice(0, 5).map(subject => (
                    <Card key={subject._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                          <BookmarkIcon />
                          <Text>{subject.subject.name}</Text>
                        </Flex>
                        <Text size="2" color="gray">{subject.subject.code}</Text>
                      </Flex>
                    </Card>
                  ))}
                  {classData.subjects.length > 5 && (
                    <Text size="2" color="gray" align="center">
                      +{classData.subjects.length - 5} more subjects
                    </Text>
                  )}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="prefects">
            <Card>
              <Flex justify="between" mb="4">
                <Text size="3" weight="bold">Prefects</Text>
                <Button>
                  Assign Prefect
                </Button>
              </Flex>
              
              {!classData?.prefects?.length ? (
                <Text color="gray">No prefects assigned to this class yet.</Text>
              ) : (
                <Flex direction="column" gap="2">
                  {classData.prefects.map(prefect => (
                    <Card key={prefect._id} variant="surface">
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                          <PersonIcon />
                          <Text>{prefect.student.firstName} {prefect.student.lastName}</Text>
                        </Flex>
                        <Badge color="blue">
                          {prefect.position}
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

export default ClassDetail; 