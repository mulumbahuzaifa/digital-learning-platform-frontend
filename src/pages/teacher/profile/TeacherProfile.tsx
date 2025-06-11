import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthProvider';
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Avatar, 
  Button,
  TextField,
  TextArea,
  Grid,
  Badge
  
} from '@radix-ui/themes';
import { 
  PersonIcon, 
  EnvelopeClosedIcon, 
  HomeIcon, 
  GlobeIcon,
  CameraIcon,
  FileIcon,
  ReaderIcon
} from '@radix-ui/react-icons';
import { User } from '../../../types';

const TeacherProfile = () => {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    phone: '',
    bio: '',
    district: '',
    county: '',
    subCounty: '',
    teacherId: '',
    department: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (auth.user) {
        const updatedUser: User = {
          ...auth.user,
          name: formData.name,
          email: formData.email,
        };
        // TODO: Implement updateUser in AuthContext
        // await auth.updateUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatAddress = () => {
    const parts = [formData.district, formData.county, formData.subCounty].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      <Flex justify="between" align="center">
        <Heading size="6">Teacher Profile</Heading>
        <Button 
          variant="soft" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Flex>

      <Grid columns={{ initial: "1", md: "3" }} gap="6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <Flex direction="column" align="center" gap="4" p="4">
            <Box className="relative">
              <Avatar
                fallback={auth.user?.name?.charAt(0) || "T"}
                size="6"
                radius="full"
                className="border-4 border-white shadow-lg"
              />
              <Button 
                variant="soft" 
                className="absolute bottom-0 right-0 rounded-full p-2"
                onClick={() => {/* Handle avatar upload */}}
              >
                <CameraIcon />
              </Button>
            </Box>
            
            <Box className="text-center">
              <Heading size="4">{auth.user?.name}</Heading>
              <Text size="2" color="gray">{auth.user?.role}</Text>
            </Box>

            <Flex direction="column" gap="2" className="w-full">
              <Flex gap="2" align="center">
                <EnvelopeClosedIcon />
                <Text size="2">{auth.user?.email}</Text>
              </Flex>
              {formData.phone && (
                <Flex gap="2" align="center">
                  <HomeIcon />
                  <Text size="2">{formData.phone}</Text>
                </Flex>
              )}
              {formatAddress() && (
                <Flex gap="2" align="center">
                  <GlobeIcon />
                  <Text size="2">{formatAddress()}</Text>
                </Flex>
              )}
              {formData.teacherId && (
                <Flex gap="2" align="center">
                  <FileIcon />
                  <Text size="2">ID: {formData.teacherId}</Text>
                </Flex>
              )}
              {formData.department && (
                <Flex gap="2" align="center">
                  <ReaderIcon />
                  <Text size="2">{formData.department}</Text>
                </Flex>
              )}
            </Flex>

            <Badge color="green" size="2">Teacher</Badge>
          </Flex>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <TextField.Root>
              <TextField.Slot>
                <PersonIcon />
              </TextField.Slot>
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-transparent border-none outline-none"
              />
            </TextField.Root>

            <TextField.Root>
              <TextField.Slot>
                <EnvelopeClosedIcon />
              </TextField.Slot>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-transparent border-none outline-none"
              />
            </TextField.Root>

            <TextField.Root>
              <TextField.Slot>
                <HomeIcon />
              </TextField.Slot>
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-transparent border-none outline-none"
              />
            </TextField.Root>

            <Grid columns="3" gap="4">
              <TextField.Root>
                <TextField.Slot>
                  <GlobeIcon />
                </TextField.Slot>
                <input
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-none outline-none"
                />
              </TextField.Root>

              <TextField.Root>
                <TextField.Slot>
                  <GlobeIcon />
                </TextField.Slot>
                <input
                  name="county"
                  placeholder="County"
                  value={formData.county}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-none outline-none"
                />
              </TextField.Root>

              <TextField.Root>
                <TextField.Slot>
                  <GlobeIcon />
                </TextField.Slot>
                <input
                  name="subCounty"
                  placeholder="Sub County"
                  value={formData.subCounty}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-none outline-none"
                />
              </TextField.Root>
            </Grid>

            <Grid columns="2" gap="4">
              <TextField.Root>
                <TextField.Slot>
                  <FileIcon />
                </TextField.Slot>
                <input
                  name="teacherId"
                  placeholder="Teacher ID"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-none outline-none"
                />
              </TextField.Root>

              <TextField.Root>
                <TextField.Slot>
                  <ReaderIcon />
                </TextField.Slot>
                <input
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-transparent border-none outline-none"
                />
              </TextField.Root>
            </Grid>

            <TextArea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="min-h-[100px]"
            />

            {isEditing && (
              <Flex gap="2" justify="end">
                <Button 
                  variant="soft" 
                  color="gray" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </Flex>
            )}
          </form>
        </Card>
      </Grid>
    </div>
  );
};

export default TeacherProfile; 