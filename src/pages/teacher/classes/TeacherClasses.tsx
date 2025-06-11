import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
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
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BookmarkIcon
} from '@radix-ui/react-icons';
import { classService } from "../../../services/classService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { Class } from "../../../types/class";

const TeacherClasses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch teacher's classes
  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ["teacher-classes"],
    queryFn: () => classService.getMyClasses(),
  });

  // Filter classes based on search term
  const filteredClasses = classes?.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered classes
  const paginatedClasses = filteredClasses?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">My Classes</Heading>
        <Button asChild>
          <Link to="/teacher/classes/create">Create New Class</Link>
        </Button>
      </Flex>

      {/* Class Counter Card */}
      <Card variant="classic">
        <Flex align="center" gap="3">
          <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
            <BookmarkIcon width="20" height="20" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray">Total Classes</Text>
            <Text size="5" weight="bold">{classes?.length || 0}</Text>
          </Flex>
        </Flex>
      </Card>

      {/* Search */}
      <TextField.Root 
        placeholder="Search classes..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
        {paginatedClasses?.map(cls => (
          <Card key={cls._id}>
            <Flex direction="column" gap="4" p="4">
              <Flex justify="between" align="start">
                <Box>
                  <Heading size="4">{cls.name}</Heading>
                  <Text size="2" color="gray">{cls.code}</Text>
                </Box>
                <Badge color="green">Active</Badge>
              </Flex>

              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <CalendarIcon />
                  <Text size="2">{cls.academicTerm}</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <ClockIcon />
                  <Text size="2">{cls.year}</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <PersonIcon />
                  <Text size="2">{cls.students.length} Students</Text>
                </Flex>
              </Flex>

              <Flex gap="2" justify="end">
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/classes/${cls._id}`}>
                    <Pencil1Icon /> View Details
                  </Link>
                </Button>
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/classes/${cls._id}/attendance`}>
                    <PersonIcon /> Attendance
                  </Link>
                </Button>
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/classes/${cls._id}/assignments`}>
                    <BookmarkIcon /> Assignments
                  </Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Pagination */}
      {filteredClasses && filteredClasses.length > itemsPerPage && (
        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredClasses.length)} of {filteredClasses.length} classes
          </Text>
          <Flex gap="2">
            <Button 
              variant="soft" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="soft" 
              disabled={(page * itemsPerPage) >= (filteredClasses.length)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </div>
  );
};

export default TeacherClasses; 