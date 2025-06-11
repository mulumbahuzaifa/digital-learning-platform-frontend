import { 
    Table, 
    Badge, 
    Flex, 
    Button, 
    Text,
    Avatar
  } from '@radix-ui/themes';
  import { ClassSubject } from '../../types';
  import { PlusIcon } from '@radix-ui/react-icons';
  import { Link } from 'react-router-dom';
  
  interface ClassSubjectsTableProps {
    subjects: ClassSubject[];
    classId: string;
    onRemoveSubject: (subjectId: string) => void;
    onRemoveTeacher: (subjectId: string, teacherId: string) => void;
  }
  
  const ClassSubjectsTable = ({ 
    subjects, 
    classId,
    onRemoveSubject,
    onRemoveTeacher
  }: ClassSubjectsTableProps) => {
    return (
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Subject</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Teachers</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {subjects.map((subject) => (
            <Table.Row key={subject.subject._id}>
              <Table.Cell>
                <Text weight="bold">{subject.subject.name}</Text>
                <Text size="1" color="gray">{subject.subject.code}</Text>
              </Table.Cell>
              <Table.Cell>
                {subject.teachers.length > 0 ? (
                  <Flex direction="column" gap="1">
                    {subject.teachers.map((teacher) => (
                      <Flex key={teacher.teacher._id} align="center" gap="2">
                        <Avatar
                          size="1"
                          src={teacher.teacher.profile?.avatar}
                          fallback={`${teacher.teacher.firstName[0]}${teacher.teacher.lastName[0]}`}
                        />
                        <Text>
                          {teacher.teacher.firstName} {teacher.teacher.lastName}
                          {teacher.isLeadTeacher && (
                            <Badge ml="2" color="amber" variant="soft">Lead</Badge>
                          )}
                        </Text>
                        <Button 
                          size="1" 
                          variant="ghost" 
                          color="red"
                          onClick={() => onRemoveTeacher(subject.subject._id, teacher.teacher._id)}
                        >
                          Remove
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text color="gray" size="2">No teachers assigned</Text>
                )}
                <Button 
                  size="1" 
                  variant="soft" 
                  mt="2"
                  asChild
                >
                  <Link to={`/admin/classes/${classId}/subjects/${subject.subject._id}/add-teacher`}>
                    <PlusIcon /> Add Teacher
                  </Link>
                </Button>
              </Table.Cell>
              <Table.Cell>
                <Button 
                  size="1" 
                  variant="soft" 
                  color="red"
                  onClick={() => onRemoveSubject(subject.subject._id)}
                >
                  Remove Subject
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    );
  };
  
  export default ClassSubjectsTable;