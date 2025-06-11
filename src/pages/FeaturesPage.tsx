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
} from '@radix-ui/themes';
import Navbar from "../components/ui/navbar/AuthNavbar";
import FooterSmall from "../components/ui/FooterSmall";
import { 
  RocketIcon, 
  LightningBoltIcon, 
  LapTimerIcon, 
  PersonIcon, 
  CheckCircledIcon 
} from "@radix-ui/react-icons";
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  DeviceTabletIcon,
  PuzzlePieceIcon,
  FingerPrintIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Interactive Learning",
    description: "Engage with dynamic content, quizzes, and interactive exercises designed to improve retention and understanding.",
    icon: PuzzlePieceIcon
  },
  {
    name: "Personalized Experience",
    description: "AI-powered learning paths adapt to your pace, preferences, and performance for a truly personalized experience.",
    icon: FingerPrintIcon
  },
  {
    name: "Diverse Content Library",
    description: "Access thousands of courses across disciplines created and curated by leading experts and institutions.",
    icon: DocumentTextIcon
  },
  {
    name: "Real-time Collaboration",
    description: "Connect with peers and instructors through discussion forums, live sessions, and collaborative projects.",
    icon: UserGroupIcon
  },
  {
    name: "Performance Analytics",
    description: "Track your progress with detailed analytics and insights to identify strengths and areas for improvement.",
    icon: ChartBarIcon
  },
  {
    name: "Mobile Learning",
    description: "Learn on-the-go with our fully responsive platform and dedicated mobile application for iOS and Android.",
    icon: DeviceTabletIcon
  },
];

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for casual learners",
    features: [
      "Access to free courses",
      "Basic progress tracking",
      "Discussion forum participation",
      "Mobile access",
    ],
    color: "gray",
    buttonVariant: "soft"
  },
  {
    name: "Premium",
    price: "$9.99/mo",
    description: "For dedicated individual learners",
    features: [
      "Unlimited access to all courses",
      "Advanced progress analytics",
      "Downloadable resources",
      "Certificate of completion",
      "Priority support"
    ],
    color: "orange",
    buttonVariant: "solid",
    highlight: true
  },
  {
    name: "Teams",
    price: "$24.99/mo",
    description: "For small teams and organizations",
    features: [
      "All Premium features",
      "Team management dashboard",
      "Collaborative learning spaces",
      "Custom learning paths",
      "Performance reports",
      "Dedicated account manager"
    ],
    color: "green",
    buttonVariant: "soft"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading size="9" className="text-white mb-4">Platform Features</Heading>
          <Text size="5" className="text-green-100 max-w-2xl mx-auto">
            Discover how NEWSOMA transforms the digital learning experience with powerful tools and innovative features
          </Text>
        </div>
      </div>
      
      {/* Main Features */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Heading size="6" align="center" mb="6">Powerful Learning Tools</Heading>
        <Text size="4" align="center" color="gray" mb="12" className="max-w-3xl mx-auto">
          Our platform combines state-of-the-art technology with pedagogical expertise to create an optimal learning environment
        </Text>
        
        <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="6">
          {features.map((feature) => (
            <Card key={feature.name} size="3" className="transition-all duration-300 hover:shadow-lg">
              <Flex direction="column" align="center" gap="3" p="4">
                <Box className="bg-green-100 rounded-full p-3 mb-2">
                  <feature.icon className="h-8 w-8 text-green-700" />
                </Box>
                <Heading size="4" align="center">{feature.name}</Heading>
                <Text size="2" align="center" color="gray">
                  {feature.description}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Box>
      
      {/* Platform Benefits */}
      <Box className="bg-gray-100 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Heading size="6" align="center" mb="6">Why Choose NEWSOMA</Heading>
          
          <Grid columns={{ initial: "1", md: "2" }} gap="8" mt="8">
            <Card size="3" className="flex flex-col bg-white shadow">
              <Flex direction="column" gap="5" p="6">
                <Heading size="5">For Students</Heading>
                
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Learn at your own pace, anytime and anywhere</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Access a diverse library of high-quality courses</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Receive personalized recommendations and feedback</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Connect with a global community of learners</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Earn verifiable certificates upon completion</Text>
                </Flex>
                
                <Button size="3" className="mt-auto bg-orange-500 hover:bg-orange-600">
                  Explore Courses
                </Button>
              </Flex>
            </Card>
            
            <Card size="3" className="flex flex-col bg-white shadow">
              <Flex direction="column" gap="5" p="6">
                <Heading size="5">For Educators</Heading>
                
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Create and publish courses with powerful tools</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Monitor student progress with detailed analytics</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Facilitate engaging discussions and live sessions</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Design assessments with automated grading</Text>
                </Flex>
                <Flex gap="2" align="center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                  <Text>Earn revenue through our marketplace</Text>
                </Flex>
                
                <Button size="3" className="mt-auto bg-green-600 hover:bg-green-700">
                  Become an Instructor
                </Button>
              </Flex>
            </Card>
          </Grid>
        </Box>
      </Box>
      
      {/* Pricing Section */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Heading size="6" align="center" mb="3">Flexible Pricing Plans</Heading>
        <Text size="4" align="center" color="gray" mb="12" className="max-w-2xl mx-auto">
          Choose the plan that fits your needs, from individual learners to large organizations
        </Text>
        
        <Grid columns={{ initial: "1", md: "3" }} gap="6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              size="3" 
              className={`
                transition-all duration-300 hover:shadow-lg 
                ${plan.highlight ? 'border-2 border-orange-500 shadow-lg' : ''}
              `}
            >
              <Flex direction="column" height="100%" p="6">
                <Badge color={plan.color as any} size="2" mb="2">
                  {plan.name}
                </Badge>
                <Heading size="6" mb="1">{plan.price}</Heading>
                <Text size="2" color="gray" mb="5">{plan.description}</Text>
                
                <Box className="flex-grow">
                  {plan.features.map((feature, i) => (
                    <Flex key={i} gap="2" align="center" mb="3">
                      <CheckCircledIcon className="h-5 w-5 text-green-600" />
                      <Text size="2">{feature}</Text>
                    </Flex>
                  ))}
                </Box>
                
                <Button 
                  size="3" 
                  className={`mt-6 ${
                    plan.buttonVariant === 'solid' 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Get Started
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Box>
      
      {/* CTA Section */}
      <Box className="bg-gradient-to-r from-green-700 to-green-600 py-16">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading size="6" className="text-white mb-4">Ready to transform your learning experience?</Heading>
          <Text size="4" className="text-green-100 max-w-2xl mx-auto mb-8">
            Join thousands of learners and educators already using NEWSOMA to achieve their goals
          </Text>
          <Flex justify="center" gap="4">
            <Button size="4" className="bg-orange-500 hover:bg-orange-600">
              Sign Up Now
            </Button>
            <Button size="4" variant="soft">
              Request a Demo
            </Button>
          </Flex>
        </Box>
      </Box>
      
      <FooterSmall />
    </div>
  );
} 