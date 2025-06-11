import { 
    Table, 
    Badge, 
    Flex, 
    Button, 
    Text,
    Avatar
  } from '@radix-ui/themes';
  import { ClassPrefect } from '../../types';
  import { PlusIcon } from '@radix-ui/react-icons';
  import { Link } from 'react-router-dom';
  
  interface ClassPrefectsTableProps {
    prefects: ClassPrefect[];
    classId: string;
    onRemovePrefect: (prefectId: string) => void;
  }
  
  const ClassPrefectsTable = ({ 
    prefects, 
    classId,
    onRemovePrefect
  }: ClassPrefectsTableProps) => {
    return (
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Position</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {prefects.map((prefect) => (
            <Table.Row key={prefect._id}>
              <Table.Cell>
                <Badge variant="soft">{prefect.position}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Flex align="center" gap="2">
                  <Avatar
                    size="1"
                    src={prefect.student.profile?.avatar}
                    fallback={`${prefect.student.firstName[0]}${prefect.student.lastName[0]}`}
                  />
                  <Text>
                    {prefect.student.firstName} {prefect.student.lastName}
                  </Text>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Button 
                  size="1" 
                  variant="soft" 
                  color="red"
                  onClick={() => onRemovePrefect(prefect._id)}
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
                <Link to={`/admin/classes/${classId}/assign-prefect`}>
                  <PlusIcon /> Assign Prefect
                </Link>
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>
    );
  };
  
  export default ClassPrefectsTable;