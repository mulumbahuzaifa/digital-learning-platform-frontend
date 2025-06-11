import { 
    Card, 
    Flex, 
    Text, 
    Badge,
    Heading
  } from '@radix-ui/themes';
  import { Class } from '../../types';
  
  interface ClassDetailsCardProps {
    classData: Class;
  }
  
  const ClassDetailsCard = ({ classData }: ClassDetailsCardProps) => {
    return (
      <Card>
        <Flex direction="column" gap="3">
          <Heading size="4">Class Information</Heading>
          
          <Flex direction="column" gap="2">
            <Text>
              <Text weight="bold">Name:</Text> {classData.name}
            </Text>
            <Text>
              <Text weight="bold">Code:</Text> <Badge variant="soft">{classData.code}</Badge>
            </Text>
            <Text>
              <Text weight="bold">Year:</Text> {classData.year}
            </Text>
            <Text>
              <Text weight="bold">Term:</Text> {classData.academicTerm}
            </Text>
            {classData.classTeacher && (
              <Text>
                <Text weight="bold">Class Teacher:</Text> {classData.classTeacher.firstName} {classData.classTeacher.lastName}
              </Text>
            )}
            <Text>
              <Text weight="bold">Description:</Text> {classData.description || 'None'}
            </Text>
            <Text>
              <Text weight="bold">Created At:</Text> {new Date(classData.createdAt).toLocaleDateString()}
            </Text>
            <Text>
              <Text weight="bold">Last Updated:</Text> {new Date(classData.updatedAt).toLocaleDateString()}
            </Text>
          </Flex>
  
          <Flex gap="2" mt="2">
            <Badge variant="outline">
              {classData.subjects.length} Subjects
            </Badge>
            <Badge variant="outline">
              {classData.students.length} Students
            </Badge>
            <Badge variant="outline">
              {classData.prefects.length} Prefects
            </Badge>
          </Flex>
        </Flex>
      </Card>
    );
  };
  
  export default ClassDetailsCard;