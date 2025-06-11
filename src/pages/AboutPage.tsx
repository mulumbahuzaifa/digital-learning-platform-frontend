import React from "react";
import { 
  Card, 
  Grid, 
  Flex, 
  Text, 
  Heading, 
  Box, 
  Badge, 
  Button, 
  Avatar,
  Separator 
} from '@radix-ui/themes';
import Navbar from "../components/ui/navbar/AuthNavbar";
import FooterSmall from "../components/ui/FooterSmall";
import { 
  GlobeIcon, 
  MixerHorizontalIcon, 
  PersonIcon, 
  HeartFilledIcon 
} from "@radix-ui/react-icons";
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  BuildingLibraryIcon,
  SparklesIcon,
  GlobeAltIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

// Team members data
const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Founder & CEO",
    bio: "Former professor with 15+ years in educational innovation. Passionate about making quality education accessible to all.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Chief Technology Officer",
    bio: "Tech leader with expertise in AI and educational platforms. Previously led engineering teams at major edtech companies.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Dr. Aisha Patel",
    role: "Chief Learning Officer",
    bio: "Curriculum design expert with a PhD in Education. Specializes in creating engaging and effective learning experiences.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "James Wilson",
    role: "Head of Partnerships",
    bio: "Building relationships with educational institutions and content creators to expand our course offerings.",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Maria Rodriguez",
    role: "UX/UI Design Lead",
    bio: "Creating intuitive and accessible user experiences that make learning engaging and enjoyable for all users.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "David Thompson",
    role: "Content Strategy Director",
    bio: "Former educator focused on creating high-quality learning materials that meet the needs of diverse learners.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
  }
];

// Timeline data
const milestones = [
  {
    year: "2018",
    title: "The Beginning",
    description: "NEWSOMA was founded with a vision to transform digital learning and make education more accessible."
  },
  {
    year: "2019",
    title: "First Courses Launch",
    description: "Released our initial course catalog across five disciplines, partnering with leading educators."
  },
  {
    year: "2020",
    title: "Platform Expansion",
    description: "Expanded our platform capabilities to include interactive assessments and live sessions during the pandemic."
  },
  {
    year: "2021",
    title: "Mobile App Launch",
    description: "Released our mobile applications for iOS and Android, enabling learning on-the-go."
  },
  {
    year: "2022",
    title: "Global Growth",
    description: "Expanded to serve learners in over 50 countries, translating content into 10 languages."
  },
  {
    year: "2023",
    title: "AI Integration",
    description: "Incorporated advanced AI to provide personalized learning pathways and adaptive content."
  }
];

// Stats data
const stats = [
  { value: "1M+", label: "Learners", icon: UserGroupIcon },
  { value: "500+", label: "Courses", icon: AcademicCapIcon },
  { value: "200+", label: "Instructors", icon: PersonIcon },
  { value: "50+", label: "Countries", icon: GlobeAltIcon }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading size="9" className="text-white mb-4">About NEWSOMA</Heading>
          <Text size="5" className="text-green-100 max-w-2xl mx-auto">
            Our mission is to provide accessible, high-quality education for everyone, anywhere
          </Text>
        </div>
      </div>
      
      {/* Our Story Section */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Grid columns={{ initial: "1", md: "2" }} gap="8">
          <Box>
            <Heading size="6" mb="4">Our Story</Heading>
            <Text size="3" mb="4">
              NEWSOMA began with a simple but powerful idea: education should be accessible to anyone with an internet connection. Founded in 2018 by Dr. Sarah Johnson, a former university professor, our platform was built to break down barriers to learning.
            </Text>
            <Text size="3" mb="4">
              What started as a small collection of courses has grown into a comprehensive learning ecosystem serving students, professionals, and organizations worldwide. Our name reflects our commitment to a new paradigm in education - one that combines innovation with time-tested learning principles.
            </Text>
            <Text size="3">
              Today, NEWSOMA continues to evolve, embracing new technologies and pedagogical approaches to create more effective and engaging learning experiences for our global community of learners.
            </Text>
          </Box>
          <Box className="bg-white p-6 rounded-lg shadow-md">
            <Heading size="5" mb="4">Our Values</Heading>
            
            <Flex direction="column" gap="5">
              <Flex gap="3" align="center">
                <Box className="bg-orange-100 p-2 rounded-full">
                  <GlobeIcon className="h-6 w-6 text-orange-600" />
                </Box>
                <Box>
                  <Text weight="bold" size="3">Accessibility</Text>
                  <Text size="2" color="gray">Making quality education available to all, regardless of location or background</Text>
                </Box>
              </Flex>
              
              <Flex gap="3" align="center">
                <Box className="bg-green-100 p-2 rounded-full">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </Box>
                <Box>
                  <Text weight="bold" size="3">Innovation</Text>
                  <Text size="2" color="gray">Embracing technology to constantly improve the learning experience</Text>
                </Box>
              </Flex>
              
              <Flex gap="3" align="center">
                <Box className="bg-blue-100 p-2 rounded-full">
                  <MixerHorizontalIcon className="h-6 w-6 text-blue-600" />
                </Box>
                <Box>
                  <Text weight="bold" size="3">Flexibility</Text>
                  <Text size="2" color="gray">Creating learning experiences that adapt to individual needs and schedules</Text>
                </Box>
              </Flex>
              
              <Flex gap="3" align="center">
                <Box className="bg-purple-100 p-2 rounded-full">
                  <HeartFilledIcon className="h-6 w-6 text-purple-600" />
                </Box>
                <Box>
                  <Text weight="bold" size="3">Community</Text>
                  <Text size="2" color="gray">Fostering connections between learners and educators worldwide</Text>
                </Box>
              </Flex>
            </Flex>
          </Box>
        </Grid>
      </Box>
      
      {/* Stats Section */}
      <Box className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Grid columns={{ initial: "2", md: "4" }} gap="6">
            {stats.map((stat, index) => (
              <Card key={index} size="3" className="text-center bg-white/10 backdrop-blur-sm border-none text-white">
                <Flex direction="column" align="center" gap="2" p="4">
                  <stat.icon className="h-8 w-8 text-white/80" />
                  <Heading size="8" className="text-white">{stat.value}</Heading>
                  <Text size="2" className="text-white/80">{stat.label}</Text>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Box>
      </Box>
      
      {/* Timeline Section */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Heading size="6" align="center" mb="6">Our Journey</Heading>
        <Text size="3" align="center" color="gray" mb="12" className="max-w-2xl mx-auto">
          From a small startup to a global learning platform, our growth has been driven by a commitment to educational excellence
        </Text>
        
        <Flex direction="column" gap="6" className="ml-4">
          {milestones.map((milestone, index) => (
            <Flex key={index} gap="4">
              <Box className="relative">
                <Box className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-white" />
                </Box>
                {index < milestones.length - 1 && (
                  <Box className="absolute top-10 left-5 h-full w-0.5 bg-green-200" />
                )}
              </Box>
              <Card size="2" style={{ flex: 1 }} className="mb-4">
                <Flex direction="column" gap="2">
                  <Flex justify="between" align="center">
                    <Badge color="green" size="2">{milestone.year}</Badge>
                    <Heading size="3">{milestone.title}</Heading>
                  </Flex>
                  <Text size="2" color="gray">{milestone.description}</Text>
                </Flex>
              </Card>
            </Flex>
          ))}
        </Flex>
      </Box>
      
      {/* Team Section */}
      <Box className="bg-gray-100 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Heading size="6" align="center" mb="3">Meet Our Team</Heading>
          <Text size="3" align="center" color="gray" mb="12" className="max-w-2xl mx-auto">
            We're a diverse team of educators, technologists, and lifelong learners dedicated to transforming education
          </Text>
          
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="6">
            {teamMembers.map((member, index) => (
              <Card key={index} size="2" className="overflow-hidden">
                <Flex direction="column" align="center" p="4">
                  <Avatar
                    size="7"
                    src={member.image}
                    fallback={member.name.charAt(0)}
                    radius="full"
                    className="mb-4 border-4 border-white shadow-md"
                  />
                  <Heading size="3" mb="1">{member.name}</Heading>
                  <Badge color="orange" size="1" mb="3">{member.role}</Badge>
                  <Text size="2" align="center" color="gray">{member.bio}</Text>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Box>
      </Box>
      
      {/* Partnerships Section */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Heading size="6" align="center" mb="3">Our Partners</Heading>
        <Text size="3" align="center" color="gray" mb="12" className="max-w-2xl mx-auto">
          We collaborate with leading educational institutions, corporations, and non-profits to expand learning opportunities
        </Text>
        
        <Grid columns={{ initial: "2", sm: "3", lg: "6" }} gap="6" className="items-center">
          {[...Array(6)].map((_, index) => (
            <Box key={index} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center">
              <BuildingLibraryIcon className="h-12 w-12 text-gray-400" />
            </Box>
          ))}
        </Grid>
      </Box>
      
      {/* CTA Section */}
      <Box className="bg-gradient-to-r from-green-700 to-green-600 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading size="6" className="text-white mb-4">Join Our Mission</Heading>
          <Text size="4" className="text-green-100 max-w-2xl mx-auto mb-8">
            Be part of our community and help us transform education for learners around the world
          </Text>
          <Flex justify="center" gap="4">
            <Button size="4" className="bg-orange-500 hover:bg-orange-600">
              Become a Student
            </Button>
            <Button size="4" variant="soft">
              Teach with Us
            </Button>
          </Flex>
        </Box>
      </Box>
      
      <FooterSmall />
    </div>
  );
} 