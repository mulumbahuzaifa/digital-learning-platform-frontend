import React, { useState } from "react";
import { 
  Card, 
  Grid, 
  Flex, 
  Text, 
  Heading, 
  Box, 
  Badge, 
  Button, 
  TextField, 
  Select 
} from '@radix-ui/themes';
import Navbar from "../components/ui/navbar/AuthNavbar";
import FooterSmall from "../components/ui/FooterSmall";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { BookOpenIcon, ChartBarIcon, AcademicCapIcon, UsersIcon } from "@heroicons/react/24/outline";

// Mock course data
const COURSES = [
  {
    id: 1,
    title: "Introduction to Mathematics",
    description: "Learn the fundamentals of mathematics including algebra, geometry, and basic calculus.",
    instructor: "Dr. John Smith",
    rating: 4.8,
    students: 1250,
    level: "Beginner",
    category: "Mathematics",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500&auto=format&fit=crop",
    price: "Free"
  },
  {
    id: 2,
    title: "Advanced Chemistry",
    description: "Explore organic chemistry, biochemistry, and chemical reactions in depth.",
    instructor: "Prof. Sarah Johnson",
    rating: 4.6,
    students: 896,
    level: "Advanced",
    category: "Science",
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=500&auto=format&fit=crop",
    price: "$49.99"
  },
  {
    id: 3,
    title: "Introduction to Literature",
    description: "Discover the world of classic and modern literature through critical analysis.",
    instructor: "Dr. Emily Davis",
    rating: 4.9,
    students: 1120,
    level: "Beginner",
    category: "Arts",
    image: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=500&auto=format&fit=crop",
    price: "Free"
  },
  {
    id: 4,
    title: "World History: Modern Era",
    description: "Examine key events and developments that shaped our modern world from 1900 onwards.",
    instructor: "Prof. Michael Torres",
    rating: 4.7,
    students: 980,
    level: "Intermediate",
    category: "History",
    image: "https://images.unsplash.com/photo-1461360370896-8a5c50c6b5e8?q=80&w=500&auto=format&fit=crop",
    price: "$39.99"
  },
  {
    id: 5,
    title: "Fundamentals of Physics",
    description: "Learn the core principles of physics including mechanics, electricity, and waves.",
    instructor: "Dr. Robert Chen",
    rating: 4.8,
    students: 1340,
    level: "Intermediate",
    category: "Science",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=500&auto=format&fit=crop",
    price: "$29.99"
  },
  {
    id: 6,
    title: "Digital Art Fundamentals",
    description: "Master the basics of digital art creation using industry-standard software.",
    instructor: "Lisa Wang",
    rating: 4.9,
    students: 756,
    level: "Beginner",
    category: "Arts",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=500&auto=format&fit=crop",
    price: "$49.99"
  }
];

// Categories for filtering
const CATEGORIES = ["All", "Mathematics", "Science", "Arts", "History", "Technology", "Languages"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');

  // Filter courses based on search term and filters
  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading size="8" className="text-white mb-4">Discover Our Courses</Heading>
          <Text size="5" className="text-green-100 max-w-2xl mx-auto">
            Expand your knowledge with high-quality courses taught by expert instructors
          </Text>
          
          {/* Search Bar */}
          <Box className="mt-8 max-w-2xl mx-auto">
            <TextField.Root size="3" placeholder="Search for courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}>
              <TextField.Slot >
                <MagnifyingGlassIcon height={20} width={20} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </div>
      </div>
      
      {/* Filter Section */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Flex justify="between" align="center" wrap="wrap" gap="4">
          <Heading size="4">Available Courses ({filteredCourses.length})</Heading>
          
          <Flex gap="3" wrap="wrap">
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger placeholder="Category" />
              <Select.Content>
                {CATEGORIES.map(category => (
                  <Select.Item key={category} value={category}>{category}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            <Select.Root value={levelFilter} onValueChange={setLevelFilter}>
              <Select.Trigger placeholder="Level" />
              <Select.Content>
                {LEVELS.map(level => (
                  <Select.Item key={level} value={level}>{level}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Box>
      
      {/* Courses Grid */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredCourses.length === 0 ? (
          <Card size="3" className="text-center py-12">
            <Heading size="3" className="mb-2">No courses found</Heading>
            <Text color="gray">Try adjusting your search or filters</Text>
          </Card>
        ) : (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
            {filteredCourses.map(course => (
              <Card key={course.id} size="2" className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
                <Box p="4">
                  <Flex gap="2" mb="2">
                    <Badge color="orange" size="1">{course.category}</Badge>
                    <Badge color="blue" size="1">{course.level}</Badge>
                    {course.price === "Free" && <Badge color="green" size="1">Free</Badge>}
                  </Flex>
                  
                  <Heading size="3" mb="1">{course.title}</Heading>
                  <Text size="2" color="gray" mb="3" style={{ minHeight: '2.5rem' }}>
                    {course.description.length > 100 
                      ? `${course.description.substring(0, 100)}...` 
                      : course.description}
                  </Text>
                  
                  <Flex justify="between" align="center" mb="3">
                    <Text size="2" weight="medium">Instructor: {course.instructor}</Text>
                    <Flex align="center" gap="1">
                      <Text size="2" weight="bold" color="orange">{course.rating}</Text>
                      <Text size="1" color="gray">★★★★★</Text>
                    </Flex>
                  </Flex>
                  
                  <Flex justify="between" align="center">
                    <Flex align="center" gap="1">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <Text size="1" color="gray">{course.students.toLocaleString()} students</Text>
                    </Flex>
                    <Text weight="bold" size="3" color="green">
                      {course.price}
                    </Text>
                  </Flex>
                  
                  <Button className="w-full mt-4" size="2">
                    Enroll Now
                  </Button>
                </Box>
              </Card>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Need Guidance Section */}
      <Box className="bg-gray-100 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card size="3" className="overflow-hidden">
            <Flex direction={{ initial: 'column', md: 'row' }}>
              <Box style={{ flex: 1 }} p="6">
                <Heading size="5" mb="2">Need guidance?</Heading>
                <Text size="3" mb="4">
                  Our academic advisors can help you find the perfect courses to match your goals.
                </Text>
                <Button size="3">Schedule a consultation</Button>
              </Box>
              <Box style={{ flex: 1 }} className="bg-gradient-to-br from-green-600 to-green-700 p-6 text-white">
                <Heading size="5" mb="2" className="text-white">Become an instructor</Heading>
                <Text size="3" mb="4" className="text-green-100">
                  Share your knowledge and expertise with students around the world.
                </Text>
                <Button size="3" variant="soft">Start teaching</Button>
              </Box>
            </Flex>
          </Card>
        </Box>
      </Box>
      
      <FooterSmall />
    </div>
  );
} 