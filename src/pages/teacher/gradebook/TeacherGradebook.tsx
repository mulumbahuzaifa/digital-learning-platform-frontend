import React, { useState } from 'react';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  Table,
  Badge,
  Grid,
  Dialog,
  TextField,
  Select,
  TextArea
} from '@radix-ui/themes';
import { 
  PlusIcon, 
  Pencil1Icon, 
  TrashIcon,
  PersonIcon,
  DownloadIcon,
  UploadIcon,
  FileIcon as FilterIcon
} from '@radix-ui/react-icons';

interface Student {
  id: string;
  name: string;
  grade: number;
  attendance: number;
  assignments: {
    completed: number;
    total: number;
  };
  status: 'passing' | 'failing' | 'at-risk';
}

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  totalPoints: number;
  weight: number;
}

const TeacherGradebook = () => {
  const [selectedClass, setSelectedClass] = useState('Mathematics 101');
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      grade: 85,
      attendance: 95,
      assignments: {
        completed: 8,
        total: 10
      },
      status: 'passing'
    },
    {
      id: '2',
      name: 'Jane Smith',
      grade: 92,
      attendance: 98,
      assignments: {
        completed: 9,
        total: 10
      },
      status: 'passing'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      grade: 65,
      attendance: 75,
      assignments: {
        completed: 6,
        total: 10
      },
      status: 'at-risk'
    }
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      name: 'Algebra Quiz',
      dueDate: '2024-03-15',
      totalPoints: 100,
      weight: 20
    },
    {
      id: '2',
      name: 'Geometry Test',
      dueDate: '2024-03-20',
      totalPoints: 100,
      weight: 30
    }
  ]);

  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isEditGradeOpen, setIsEditGradeOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dueDate: '',
    totalPoints: '',
    weight: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      name: formData.name,
      dueDate: formData.dueDate,
      totalPoints: parseInt(formData.totalPoints),
      weight: parseInt(formData.weight)
    };

    setAssignments(prev => [...prev, newAssignment]);
    setIsAddAssignmentOpen(false);
    setFormData({
      name: '',
      dueDate: '',
      totalPoints: '',
      weight: ''
    });
  };

  const handleEditGrade = (student: Student) => {
    setSelectedStudent(student);
    setIsEditGradeOpen(true);
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'passing':
        return 'green';
      case 'failing':
        return 'red';
      case 'at-risk':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Gradebook</Heading>
        <Flex gap="2">
          <Button variant="soft">
            <DownloadIcon />
            Export
          </Button>
          <Button variant="soft">
            <UploadIcon />
            Import
          </Button>
          <Button onClick={() => setIsAddAssignmentOpen(true)}>
            <PlusIcon />
            Add Assignment
          </Button>
        </Flex>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Select.Root 
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="Mathematics 101">Mathematics 101</Select.Item>
                <Select.Item value="Physics Advanced">Physics Advanced</Select.Item>
              </Select.Content>
            </Select.Root>

            <Button variant="soft">
              <FilterIcon />
              Filter
            </Button>
          </Flex>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Grade</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Attendance</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Assignments</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {students.map(student => (
                <Table.Row key={student.id}>
                  <Table.Cell>
                    <Flex gap="2" align="center">
                      <PersonIcon />
                      <Text>{student.name}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{student.grade}%</Table.Cell>
                  <Table.Cell>{student.attendance}%</Table.Cell>
                  <Table.Cell>
                    {student.assignments.completed}/{student.assignments.total}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Button 
                      variant="soft" 
                      color="gray"
                      onClick={() => handleEditGrade(student)}
                    >
                      <Pencil1Icon />
                      Edit
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>

      {/* Add Assignment Dialog */}
      <Dialog.Root open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add New Assignment</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Create a new assignment and set its details.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Assignment Name
              </Text>
              <TextField.Root>
                <input
                  name="name"
                  placeholder="Enter assignment name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </TextField.Root>
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Due Date
              </Text>
              <TextField.Root>
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </TextField.Root>
            </label>

            <Grid columns="2" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Total Points
                </Text>
                <TextField.Root>
                  <input
                    name="totalPoints"
                    type="number"
                    placeholder="Enter total points"
                    value={formData.totalPoints}
                    onChange={handleInputChange}
                  />
                </TextField.Root>
              </label>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Weight (%)
                </Text>
                <TextField.Root>
                  <input
                    name="weight"
                    type="number"
                    placeholder="Enter weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </TextField.Root>
              </label>
            </Grid>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleAddAssignment}>
              Add Assignment
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Grade Dialog */}
      <Dialog.Root open={isEditGradeOpen} onOpenChange={setIsEditGradeOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit Grade</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update student's grade and status.
          </Dialog.Description>

          {selectedStudent && (
            <Flex direction="column" gap="3">
              <Text size="2">Student: {selectedStudent.name}</Text>
              
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Grade (%)
                </Text>
                <TextField.Root>
                  <input
                    type="number"
                    defaultValue={selectedStudent.grade}
                    min="0"
                    max="100"
                  />
                </TextField.Root>
              </label>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Status
                </Text>
                <Select.Root defaultValue={selectedStudent.status}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="passing">Passing</Select.Item>
                    <Select.Item value="failing">Failing</Select.Item>
                    <Select.Item value="at-risk">At Risk</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>

              <TextArea
                placeholder="Add comments..."
                className="min-h-[100px]"
              />
            </Flex>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button>
              Save Changes
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TeacherGradebook; 