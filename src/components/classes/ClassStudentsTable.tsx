import { 
    Table, 
    Badge, 
    Flex, 
    Button, 
    Text,
    Avatar
  } from '@radix-ui/themes';
  import { ClassStudent } from '../../types';
  import { PlusIcon } from '@radix-ui/react-icons';
  import { Link } from 'react-router-dom';
  
  interface ClassStudentsTableProps {
    students: ClassStudent[];
    classId: string;
    onRemoveStudent: (studentId: string) => void;
  }
  
  const ClassStudentsTable = ({ 
    students, 
    classId,
    onRemoveStudent
  }: ClassStudentsTableProps) => {
    return (
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {students.map((student) => (
            <Table.Row key={student.student._id}>
              <Table.Cell>
                <Flex align="center" gap="2">
                  <Avatar
                    size="1"
                    src={student.student.profile?.avatar}
                    fallback={`${student.student.firstName[0]}${student.student.lastName[0]}`}
                  />
                  <Text>
                    {student.student.firstName} {student.student.lastName}
                  </Text>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="soft" color={
                  student.status === 'approved' ? 'green' : 
                  student.status === 'pending' ? 'orange' : 'red'
                }>
                  {student.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Button 
                  size="1" 
                  variant="soft" 
                  color="red"
                  onClick={() => onRemoveStudent(student.student._id)}
                >
                  Remove
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={3}>
              <Button asChild variant="soft">
                <Link to={`/admin/classes/${classId}/add-student`}>
                  <PlusIcon /> Add Student
                </Link>
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>
    );
  };
  
  export default ClassStudentsTable;