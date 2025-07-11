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
  HeartFilledIcon 
} from "@radix-ui/react-icons";
import { 
  SparklesIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

// Team members data
const teamMembers = [
  {
    name: "Serugo brian",
    role: "Founder & CEO",
    bio: "Former student with 1 year in educational innovation. Passionate about making quality education accessible to all.",
    
  },
  {
    name: "Nalubogo Dorcus audrey",
    role: " Technology Assistant",
    bio: "Tech leader with expertise in research and educational platforms"
  },
  {
    name: "Nakalunda Milly",
    role: " Learning Officer",
    bio: "Curriculum design  with a  in Education. Specializes in creating engaging and effective learning experiences.",
      },
  {
    name: "Dr. Annabella",
    role: "Head of Partnerships",
    bio: "Building relationships with educational institutions and content creators to expand our  offerings.",

  },
 
 
];

// Timeline data
const milestones = [
  {
    year: "2024",
    title: "The Beginning",
    description: "NEWSOMA project was founded with a vision to transform digital learning and make education more accessible."
  },
  {
    year: "may 2025",
    title: "First launch ",
    description: "Released our initial course catalog across five disciplines, partnering with leading educators."
  },
  {
    year: " june 2025",
    title: "Platform Expansion",
    description: "Expanded our platform capabilities to include interactive assessments and live sessions during the pandemic."
  },
 

];

// Stats data
const stats = [
  
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
              NEWSOMA began with a simple but powerful idea: education should be accessible to anyone with an internet connection. Founded in 2024 by Serugo Brian, Dorcus Audrey and Nakalunda Milly,Makerere university students, our platform was built to break down barriers to learning.
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
                    // src={member.image}
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