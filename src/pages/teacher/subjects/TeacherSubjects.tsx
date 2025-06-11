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
  TextField
} from '@radix-ui/themes';
import { 
  PersonIcon,
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ReaderIcon,
  FileIcon
} from '@radix-ui/react-icons';
import { subjectService } from "../../../services/subjectService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  classes: {
    class: string;
    className: string;
    isLeadTeacher: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

const TeacherSubjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch teacher's subjects
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["teacher-subjects"],
    queryFn: () => subjectService.getMySubjects(),
  });

  // Filter subjects based on search term
  const filteredSubjects = subjects?.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered subjects
  const paginatedSubjects = filteredSubjects?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">My Subjects</Heading>
      </Flex>

      {/* Subject Counter Card */}
      <Card variant="classic">
        <Flex align="center" gap="3">
          <Box p="2" style={{ background: 'var(--accent-3)', borderRadius: '50%' }}>
            <BookmarkIcon width="20" height="20" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray">Total Subjects</Text>
            <Text size="5" weight="bold">{subjects?.length || 0}</Text>
          </Flex>
        </Flex>
      </Card>

      {/* Search */}
      <TextField.Root 
        placeholder="Search subjects..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
        {paginatedSubjects?.map(subject => (
          <Card key={subject._id}>
            <Flex direction="column" gap="4" p="4">
              <Flex justify="between" align="start">
                <Box>
                  <Heading size="4">{subject.name}</Heading>
                  <Text size="2" color="gray">{subject.code}</Text>
                </Box>
                <Badge color="green">Active</Badge>
              </Flex>

              <Text size="2" color="gray" style={{ minHeight: '40px' }}>
                {subject.description}
              </Text>

              <Flex direction="column" gap="2">
                <Flex gap="2" align="center">
                  <PersonIcon />
                  <Text size="2">{subject.classes.length} Classes</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CalendarIcon />
                  <Text size="2">
                    {subject.classes.filter(c => c.isLeadTeacher).length} Lead Teacher
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="2" justify="end">
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/subjects/${subject._id}`}>
                    <BookmarkIcon /> View Details
                  </Link>
                </Button>
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/subjects/${subject._id}/assignments`}>
                    <FileIcon /> Assignments
                  </Link>
                </Button>
                <Button asChild size="1" variant="soft">
                  <Link to={`/teacher/subjects/${subject._id}/resources`}>
                    <ReaderIcon /> Resources
                  </Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Pagination */}
      {filteredSubjects && filteredSubjects.length > itemsPerPage && (
        <Flex justify="between" align="center" mt="4">
          <Text color="gray">
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} subjects
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
              disabled={(page * itemsPerPage) >= (filteredSubjects.length)}
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

export default TeacherSubjects; 