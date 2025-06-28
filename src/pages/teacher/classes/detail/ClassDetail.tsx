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
import { StudentClass } from "../../../../types/class";

const ClassDetail = () => {
  const { id } = useParams();

  const { data: classData, isLoading, error } = useQuery<StudentClass>({
    queryKey: ["class", id],
    queryFn: () => classService.getClassById(id!),
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (error) return <div>Error loading class details</div>;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">{classData?.name}</Heading>
        
        <Flex gap="3">
          <Button variant="soft" asChild>
            <Link to={`/teacher/classes/${id}/assignments`}>
              View Assignments
            </Link>
          </Button>
          <Button variant="soft" asChild>
            <Link to={`/teacher/classes/${id}/attendance`}>
              View Attendance
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
                <Text>Year: {classData?.enrollmentInfo?.academicYear}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <ClockIcon />
                <Text>Term: {classData?.enrollmentInfo?.term}</Text>
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
              <Text weight="bold" size="3">Enrollment Details</Text>
              <Text>Status: {classData?.enrollmentInfo?.status}</Text>
              <Text>Enrolled On: {formatDate(classData?.enrollmentInfo?.enrollmentDate || '')}</Text>
            </Flex>
          </Box>

          <Box>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">Summary</Text>
              <Flex align="center" gap="2">
                <PersonIcon />
                <Text>Level: {classData?.level}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <BookmarkIcon />
                <Text>Subjects: {classData?.subjects?.length || 0}</Text>
              </Flex>
              <Flex align="center" gap="2">
                <FileIcon />
                <Text>Stream: {classData?.stream || 'N/A'}</Text>
              </Flex>
            </Flex>
          </Box>
        </Grid>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs.Root defaultValue="subjects">
        <Tabs.List>
          <Tabs.Trigger value="subjects">Subjects</Tabs.Trigger>
          <Tabs.Trigger value="teachers">Teachers</Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
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
                          <Text>{subject.name}</Text>
                        </Flex>
                        <Text size="2" color="gray">{subject.code}</Text>
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

          <Tabs.Content value="teachers">
            <Card>
              <Flex justify="between" mb="4">
                <Text size="3" weight="bold">Subject Teachers</Text>
              </Flex>
              
              {!classData?.subjects?.some(subj => subj.teachers?.length) ? (
                <Text color="gray">No teachers assigned yet.</Text>
              ) : (
                <Flex direction="column" gap="2">
                  {classData.subjects.filter(s => s.teachers?.length).slice(0, 5).map(subject => (
                    <Card key={subject._id} variant="surface">
                      <Text size="3" weight="bold" mb="2">{subject.name}</Text>
                      {subject.teachers.map(teacher => (
                        <Flex key={teacher.teacher._id} justify="between" align="center" mt="1">
                          <Flex align="center" gap="2">
                            <PersonIcon />
                            <Text>{teacher.teacher.firstName} {teacher.teacher.lastName}</Text>
                          </Flex>
                          {teacher.isLeadTeacher && (
                            <Badge color="blue">Lead Teacher</Badge>
                          )}
                        </Flex>
                      ))}
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