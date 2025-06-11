import React, { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Flex, 
  Box, 
  Text, 
  Heading, 
  Button,
  TextField,
  TextArea,
  Select, 
  Switch,
  Grid
} from '@radix-ui/themes';
import { classService } from "../../../../services/classService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";

const ClassCreate = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear + 1, currentYear + 2];
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    year: currentYear.toString(),
    academicTerm: 'Term 1',
    description: '',
    isActive: true
  });

  const createClassMutation = useMutation({
    mutationFn: (classData: any) => classService.createClass(classData),
    onSuccess: (data) => {
      navigate(`/teacher/classes/${data._id}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClassMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Heading size="6">Create New Class</Heading>
      
      <Card variant="classic">
        <form onSubmit={handleSubmit}>
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <Box>
              <Flex direction="column" gap="3">
                <Text weight="bold" size="3">Class Details</Text>
                
                <Flex direction="column" gap="2">
                  <Text size="2">Name</Text>
                  <TextField.Root
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter class name"
                    required
                  />
                </Flex>
                
                <Flex direction="column" gap="2">
                  <Text size="2">Code</Text>
                  <TextField.Root
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter class code"
                    required
                  />
                </Flex>
                
                <Flex direction="column" gap="2">
                  <Text size="2">Year</Text>
                  <Select.Root 
                    value={formData.year}
                    onValueChange={(value) => handleSelectChange('year', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {yearOptions.map(year => (
                        <Select.Item key={year} value={year.toString()}>
                          {year}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
                
                <Flex direction="column" gap="2">
                  <Text size="2">Academic Term</Text>
                  <Select.Root 
                    value={formData.academicTerm}
                    onValueChange={(value) => handleSelectChange('academicTerm', value)}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="Term 1">Term 1</Select.Item>
                      <Select.Item value="Term 2">Term 2</Select.Item>
                      <Select.Item value="Term 3">Term 3</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Box>
            
            <Box>
              <Flex direction="column" gap="3">
                <Text weight="bold" size="3">Additional Information</Text>
                
                <Flex direction="column" gap="2">
                  <Text size="2">Description</Text>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter class description"
                    rows={5}
                  />
                </Flex>
                
                <Flex align="center" gap="2">
                  <Text size="2">Active</Text>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                </Flex>
              </Flex>
            </Box>
          </Grid>

          <Flex gap="3" mt="5" justify="end">
            <Button 
              type="button" 
              variant="soft" 
              onClick={() => navigate('/teacher/classes')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createClassMutation.isPending}
            >
              {createClassMutation.isPending ? <LoadingSpinner /> : 'Create Class'}
            </Button>
          </Flex>
        </form>
      </Card>
    </div>
  );
};

export default ClassCreate;