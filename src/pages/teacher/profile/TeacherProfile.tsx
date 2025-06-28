import React, { useState, useRef } from 'react';
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
  Badge,
  Tabs,
  IconButton,
  Separator,
  Dialog,
  Table
} from '@radix-ui/themes';
import { 
  PersonIcon, 
  EnvelopeClosedIcon, 
  HomeIcon, 
  GlobeIcon,
  CameraIcon,
  FileIcon,
  ReaderIcon,
  PlusIcon,
  Cross2Icon,
  Pencil1Icon,
  CalendarIcon,
  MobileIcon,
  UploadIcon,
  TrashIcon
} from '@radix-ui/react-icons';
import { User, Qualification, Document } from '../../../types';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { userService } from '../../../services/userService';

const TeacherProfile = () => {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);
  const [currentQualification, setCurrentQualification] = useState<Qualification | null>(null);
  const [qualificationIndex, setQualificationIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentDescription, setDocumentDescription] = useState('');
  const [formData, setFormData] = useState({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    profile: {
      bio: auth.user?.profile?.bio || '',
      phone: auth.user?.profile?.phone || '',
      gender: auth.user?.profile?.gender || '',
      dateOfBirth: auth.user?.profile?.dateOfBirth 
        ? new Date(auth.user.profile.dateOfBirth).toISOString().split('T')[0] 
        : '',
      address: {
        district: auth.user?.profile?.address?.district || '',
        county: auth.user?.profile?.address?.county || '',
        subCounty: auth.user?.profile?.address?.subCounty || '',
      },
      teacherId: auth.user?.profile?.teacherId || '',
      department: auth.user?.profile?.department || '',
      qualifications: (auth.user?.profile?.qualifications || []).map(qual => ({
        ...qual,
        documents: qual.documents || []
      }))
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('profile.')) {
      const profileField = name.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else if (name.includes('profile.address.')) {
      const addressField = name.replace('profile.address.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          address: {
            ...prev.profile.address,
            [addressField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (auth.user) {
        setIsLoading(true);
        
        // Ensure address object is properly structured even if empty
        const address = {
          district: formData.profile.address?.district || '',
          county: formData.profile.address?.county || '',
          subCounty: formData.profile.address?.subCounty || '',
        };
        
        const updatedUser: Partial<User> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          profile: {
            bio: formData.profile.bio,
            phone: formData.profile.phone,
            gender: formData.profile.gender as "male" | "female" | "other",
            dateOfBirth: formData.profile.dateOfBirth ? new Date(formData.profile.dateOfBirth) : undefined,
            address: address,
            teacherId: formData.profile.teacherId,
            department: formData.profile.department,
            qualifications: formData.profile.qualifications
          }
        };
        
        // Call the API to update the user profile
        const result = await userService.updateProfile(auth.user._id, updatedUser);
        
        // Update the auth context with the updated user data
        if (auth.updateUser) {
          auth.updateUser(result);
        }
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentQualification) {
      const updatedQualifications = [...formData.profile.qualifications];
      
      if (qualificationIndex !== null) {
        // Update existing qualification
        updatedQualifications[qualificationIndex] = currentQualification;
      } else {
        // Add new qualification
        updatedQualifications.push(currentQualification);
      }
      
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          qualifications: updatedQualifications
        }
      }));
      
      setQualificationDialogOpen(false);
      setCurrentQualification(null);
      setQualificationIndex(null);
    }
  };

  const handleDeleteQualification = (index: number) => {
    const updatedQualifications = [...formData.profile.qualifications];
    updatedQualifications.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        qualifications: updatedQualifications
      }
    }));
  };

  const handleEditQualification = (qualification: Qualification, index: number) => {
    setCurrentQualification(qualification);
    setQualificationIndex(index);
    setQualificationDialogOpen(true);
  };

  const formatAddress = () => {
    // Check if address exists and has at least one non-empty value
    const address = formData.profile.address;
    if (!address || (!address.district && !address.county && !address.subCounty)) {
      return '';
    }
    
    const parts = [
      address.district, 
      address.county, 
      address.subCounty
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentQualification) return;
    
    const file = files[0];
    
    // In a real application, you would upload this file to your server or cloud storage
    // For now, we'll simulate a successful upload with a local URL
    const document: Document = {
      name: file.name,
      url: URL.createObjectURL(file), // In real app, this would be the URL from your server
      fileType: file.type,
      uploadedAt: new Date(),
      description: documentDescription
    };
    
    // Add the document to the current qualification
    const updatedQualification = {
      ...currentQualification,
      documents: [...(currentQualification.documents || []), document]
    };
    
    setCurrentQualification(updatedQualification);
    
    // If we're editing an existing qualification, update it in the form data
    if (qualificationIndex !== null) {
      const updatedQualifications = [...formData.profile.qualifications];
      updatedQualifications[qualificationIndex] = updatedQualification;
      
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          qualifications: updatedQualifications
        }
      }));
    }
    
    setDocumentDialogOpen(false);
    setDocumentDescription('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('Document added successfully');
  };

  const handleDeleteDocument = (qualificationIndex: number, documentIndex: number) => {
    const updatedQualifications = [...formData.profile.qualifications];
    const qualification = updatedQualifications[qualificationIndex];
    
    if (qualification && qualification.documents) {
      qualification.documents.splice(documentIndex, 1);
      
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          qualifications: updatedQualifications
        }
      }));
      
      toast.success('Document deleted successfully');
    }
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

      <Grid columns={{ initial: "1", md: "4" }} gap="6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <Flex direction="column" align="center" gap="4" p="4">
            <Box className="relative">
              <Avatar
                fallback={`${auth.user?.firstName?.charAt(0)}${auth.user?.lastName?.charAt(0)}`}
                size="6"
                radius="full"
                className="border-4 border-white shadow-lg"
                src={auth.user?.profile?.avatar}
              />
              <IconButton 
                variant="soft" 
                className="absolute bottom-0 right-0 rounded-full"
                disabled={!isEditing}
                onClick={() => {/* Handle avatar upload */}}
              >
                <CameraIcon />
              </IconButton>
            </Box>
            
            <Box className="text-center">
              <Heading size="4">{auth.user?.firstName} {auth.user?.lastName}</Heading>
              <Text size="2" color="gray" className="capitalize">{auth.user?.role}</Text>
            </Box>

            <Separator size="4" />

            <Flex direction="column" gap="3" className="w-full">
              <Flex gap="2" align="center">
                <EnvelopeClosedIcon />
                <Text size="2">{auth.user?.email}</Text>
              </Flex>
              
              {auth.user?.profile?.phone && (
                <Flex gap="2" align="center">
                  <MobileIcon />
                  <Text size="2">{auth.user?.profile?.phone}</Text>
                </Flex>
              )}
              
              {formatAddress() && (
                <Flex gap="2" align="center">
                  <GlobeIcon />
                  <Text size="2">{formatAddress()}</Text>
                </Flex>
              )}
              
              {auth.user?.profile?.teacherId && (
                <Flex gap="2" align="center">
                  <FileIcon />
                  <Text size="2">ID: {auth.user?.profile?.teacherId}</Text>
                </Flex>
              )}
              
              {auth.user?.profile?.department && (
                <Flex gap="2" align="center">
                  <ReaderIcon />
                  <Text size="2">{auth.user?.profile?.department}</Text>
                </Flex>
              )}

              {auth.user?.profile?.dateOfBirth && (
                <Flex gap="2" align="center">
                  <CalendarIcon />
                  <Text size="2">
                    {format(new Date(auth.user.profile.dateOfBirth), 'dd MMM yyyy')}
                  </Text>
                </Flex>
              )}
            </Flex>

            <Flex gap="2" wrap="wrap">
              <Badge color="green" size="2">Teacher</Badge>
              {auth.user?.isVerified && <Badge color="blue" size="2">Verified</Badge>}
            </Flex>
          </Flex>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-3">
          <Tabs.Root defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="personal">Personal Information</Tabs.Trigger>
              <Tabs.Trigger value="qualifications">Qualifications</Tabs.Trigger>
            </Tabs.List>
            
            <Box p="4">
              <form onSubmit={handleSubmit}>
                <Tabs.Content value="personal" className="space-y-4">
                  <Grid columns="2" gap="4">
                    <TextField.Root
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none"
                    >
                      <TextField.Slot>
                        <PersonIcon />
                      </TextField.Slot>
                      
                    </TextField.Root>

                    <TextField.Root
                     name="lastName"
                     placeholder="Last Name"
                     value={formData.lastName}
                     onChange={handleInputChange}
                     disabled={!isEditing}
                     className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <PersonIcon />
                      </TextField.Slot>
        
                    </TextField.Root>
                  </Grid>

                  <TextField.Root
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full bg-transparent border-none outline-none">
                    <TextField.Slot>
                      <EnvelopeClosedIcon />
                    </TextField.Slot>
            
                  </TextField.Root>

                  <Grid columns="2" gap="4">
                    <TextField.Root
                      name="profile.phone"
                      placeholder="Phone Number"
                      value={formData.profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <MobileIcon />
                      </TextField.Slot>
                
                    </TextField.Root>

                    <Box>
                  
                      <select
                        name="profile.gender"
                        value={formData.profile.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 rounded-md border border-gray-300"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Date of Birth
                    </Text>
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={formData.profile.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 rounded-md border border-gray-300"
                    />
                  </Box>

                  <Heading size="3" mt="4">Address Information</Heading>
                  <Grid columns="3" gap="4">
                    <TextField.Root
                      name="profile.address.district"
                      placeholder="District"
                      value={formData.profile.address?.district || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <GlobeIcon />
                      </TextField.Slot>
                    </TextField.Root>

                    <TextField.Root
                      name="profile.address.county"
                      placeholder="County"
                      value={formData.profile.address?.county || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <GlobeIcon />
                      </TextField.Slot>
                    </TextField.Root>

                    <TextField.Root
                      name="profile.address.subCounty"
                      placeholder="Sub County"
                      value={formData.profile.address?.subCounty || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <GlobeIcon />
                      </TextField.Slot>
                    </TextField.Root>
                  </Grid>

                  <Heading size="3" mt="4">Professional Information</Heading>
                  <Grid columns="2" gap="4">
                    <TextField.Root
                      name="profile.teacherId"
                      placeholder="Teacher ID"
                      value={formData.profile.teacherId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <FileIcon />
                      </TextField.Slot>
                     
                    </TextField.Root>

                    <TextField.Root
                      name="profile.department"
                      placeholder="Department"
                      value={formData.profile.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-transparent border-none outline-none">
                      <TextField.Slot>
                        <ReaderIcon />
                      </TextField.Slot>
                     
                    </TextField.Root>
                  </Grid>

                  <Box>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Bio
                    </Text>
                    <TextArea
                      name="profile.bio"
                      placeholder="Tell us about yourself..."
                      value={formData.profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="min-h-[100px] w-full"
                    />
                  </Box>
                </Tabs.Content>

                <Tabs.Content value="qualifications" className="space-y-4">
                  <Flex justify="between" align="center">
                    <Heading size="3">Qualifications</Heading>
                    {isEditing && (
                      <Button 
                        variant="soft" 
                        onClick={() => {
                          setCurrentQualification({
                            subject: '',
                            qualificationLevel: '',
                            yearsOfExperience: 0,
                            institution: '',
                            yearObtained: new Date().getFullYear()
                          });
                          setQualificationIndex(null);
                          setQualificationDialogOpen(true);
                        }}
                      >
                        <PlusIcon /> Add Qualification
                      </Button>
                    )}
                  </Flex>

                  {formData.profile.qualifications.length === 0 ? (
                    <Text color="gray">No qualifications added yet.</Text>
                  ) : (
                    formData.profile.qualifications.map((qualification, index) => (
                      <Card key={index} variant="surface">
                        <Box p="4">
                          <Flex justify="between" align="start">
                            <Box>
                              <Heading size="4">{qualification.subject || 'Subject'}</Heading>
                              <Text size="2">{qualification.qualificationLevel}</Text>
                              <Text size="2">Experience: {qualification.yearsOfExperience} years</Text>
                              <Text size="2">Institution: {qualification.institution}</Text>
                              <Text size="2">Year Obtained: {qualification.yearObtained}</Text>
                              
                              {qualification.isVerified && (
                                <Badge color="green" mt="2">Verified</Badge>
                              )}
                            </Box>
                            {isEditing && (
                              <Flex gap="2">
                                <IconButton 
                                  size="1" 
                                  variant="soft" 
                                  color="blue"
                                  onClick={() => handleEditQualification(qualification, index)}
                                >
                                  <Pencil1Icon />
                                </IconButton>
                                <IconButton 
                                  size="1" 
                                  variant="soft" 
                                  color="red"
                                  onClick={() => handleDeleteQualification(index)}
                                >
                                  <Cross2Icon />
                                </IconButton>
                              </Flex>
                            )}
                          </Flex>
                          
                          {/* Documents Section */}
                          <Box mt="3">
                            <Flex justify="between" align="center" mb="2">
                              <Text weight="bold" size="2">Documents</Text>
                              {isEditing && (
                                <Button 
                                  size="1" 
                                  variant="soft" 
                                  onClick={() => {
                                    setCurrentQualification(qualification);
                                    setQualificationIndex(index);
                                    setDocumentDialogOpen(true);
                                  }}
                                >
                                  <UploadIcon /> Upload
                                </Button>
                              )}
                            </Flex>
                            
                            {qualification.documents && qualification.documents.length > 0 ? (
                              <Table.Root size="1">
                                <Table.Header>
                                  <Table.Row>
                                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                                    {isEditing && <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>}
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {qualification.documents.map((doc, docIndex) => (
                                    <Table.Row key={docIndex}>
                                      <Table.Cell>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                          {doc.name}
                                        </a>
                                      </Table.Cell>
                                      <Table.Cell>{doc.fileType}</Table.Cell>
                                      <Table.Cell>{doc.description}</Table.Cell>
                                      <Table.Cell>
                                        {doc.uploadedAt && format(new Date(doc.uploadedAt), 'dd MMM yyyy')}
                                      </Table.Cell>
                                      {isEditing && (
                                        <Table.Cell>
                                          <IconButton 
                                            size="1" 
                                            variant="ghost" 
                                            color="red"
                                            onClick={() => handleDeleteDocument(index, docIndex)}
                                          >
                                            <TrashIcon />
                                          </IconButton>
                                        </Table.Cell>
                                      )}
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Root>
                            ) : (
                              <Text size="1" color="gray">No documents uploaded</Text>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    ))
                  )}
                </Tabs.Content>

                {isEditing && (
                  <Flex gap="2" justify="end" mt="4">
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
            </Box>
          </Tabs.Root>
        </Card>
      </Grid>

      {/* Qualification Dialog */}
      <Dialog.Root open={qualificationDialogOpen} onOpenChange={setQualificationDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>
            {qualificationIndex !== null ? 'Edit Qualification' : 'Add Qualification'}
          </Dialog.Title>
          
          <form onSubmit={handleQualificationSubmit}>
            <Flex direction="column" gap="3">
              <TextField.Root
              name="currentQualification.subject"
              placeholder="Subject"
              value={currentQualification?.subject || ''}
              onChange={(e) => setCurrentQualification(prev => 
                prev ? {...prev, subject: e.target.value} : null
              )}
              >
                <TextField.Slot>
                  <ReaderIcon />
                </TextField.Slot>
               
              </TextField.Root>

              <TextField.Root
              name="currentQualification.qualificationLevel"
              placeholder="Qualification Level (e.g., Bachelor's, Master's)"
              value={currentQualification?.qualificationLevel || ''}
              onChange={(e) => setCurrentQualification(prev => 
                prev ? {...prev, qualificationLevel: e.target.value} : null
              )}
              >
                <TextField.Slot>
                  <FileIcon />
                </TextField.Slot>
               
              </TextField.Root>

              <TextField.Root
              name="currentQualification.yearsOfExperience"
              type="number"
              placeholder="Years of Experience"
              value={currentQualification?.yearsOfExperience || 0}
              onChange={(e) => setCurrentQualification(prev => 
                prev ? {...prev, yearsOfExperience: parseInt(e.target.value) || 0} : null
              )}
              >
                <TextField.Slot>
                  <CalendarIcon />
                </TextField.Slot>
               
              </TextField.Root>

              <TextField.Root
              name="currentQualification.institution"
              placeholder="Institution"
              value={currentQualification?.institution || ''}
              onChange={(e) => setCurrentQualification(prev => 
                prev ? {...prev, institution: e.target.value} : null
              )}
              >
                <TextField.Slot>
                  <HomeIcon />
                </TextField.Slot>
               
              </TextField.Root>

              <TextField.Root
              name="currentQualification.yearObtained"
              type="number"
              placeholder="Year Obtained"
              value={currentQualification?.yearObtained || new Date().getFullYear()}
              onChange={(e) => setCurrentQualification(prev => 
                prev ? {...prev, yearObtained: parseInt(e.target.value) || new Date().getFullYear()} : null
              )}
              >
                <TextField.Slot>
                  <CalendarIcon />
                </TextField.Slot>
               
              </TextField.Root>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit">
                {qualificationIndex !== null ? 'Update' : 'Add'} Qualification
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Document Upload Dialog */}
      <Dialog.Root open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Upload Document</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Upload a document for your qualification
          </Dialog.Description>
          
          <Flex direction="column" gap="3">
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                Select File
              </Text>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </Box>
            
            <TextField.Root>
              <TextField.Slot>
                <FileIcon />
              </TextField.Slot>
              <input
                placeholder="Document Description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              />
            </TextField.Root>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={() => {
              if (fileInputRef.current?.files?.length) {
                handleFileUpload({ target: { files: fileInputRef.current.files } } as React.ChangeEvent<HTMLInputElement>);
              } else {
                toast.error('Please select a file to upload');
              }
            }}>
              Upload Document
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default TeacherProfile; 