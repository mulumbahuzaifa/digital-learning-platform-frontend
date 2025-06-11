import { useState, ChangeEvent, FormEvent } from 'react';
import { Box, Button, Card, Flex, Heading, Text, TextArea, TextField } from '@radix-ui/themes';
import { useAssignmentMutation } from '../../hooks/useAssignmentMutation';
import { Assignment, CreateSubmissionData } from '../../types';
import { Cross2Icon, UploadIcon } from '@radix-ui/react-icons';
import { formatDate } from '../../utils/dateUtils';

interface SubmissionFormProps {
  assignment: Assignment;
  onSuccess?: () => void;
}

const SubmissionForm = ({ assignment, onSuccess }: SubmissionFormProps) => {
  const [textSubmission, setTextSubmission] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { createSubmission } = useAssignmentMutation();
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextSubmission(e.target.value);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Reset the input to allow selecting the same file again
      e.target.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!textSubmission && files.length === 0) {
      alert('Please provide either text or files for your submission');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const submissionData: CreateSubmissionData = {
        assignment: assignment._id,
        content: textSubmission,
        attachments: files
      };
      
      await createSubmission.mutateAsync(submissionData);
      
      // Reset form
      setTextSubmission('');
      setFiles([]);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Calculate if assignment is past due date
  const isPastDue = new Date() > new Date(assignment.dueDate);
  
  return (
    <Card size="3">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Heading size="4">Submit Assignment</Heading>
          
          <Box>
            <Text as="div" size="2" weight="bold">Assignment Details</Text>
            <Text as="div" size="2">Title: {assignment.title}</Text>
            <Text as="div" size="2">Due Date: {formatDate(assignment.dueDate)}</Text>
            <Text as="div" size="2">Total Marks: {assignment.totalMarks}</Text>
            
            {isPastDue && (
              <Text as="div" size="2" color="red" weight="bold" mt="2">
                This assignment is past its due date. Late submissions may not be accepted.
              </Text>
            )}
          </Box>
          
          <Box>
            <Text as="label" size="2" weight="bold">
              Your Submission
            </Text>
            <TextArea 
              placeholder="Enter your text submission here..."
              value={textSubmission}
              onChange={handleTextChange}
              style={{ minHeight: '150px' }}
            />
          </Box>
          
          <Box>
            <Text as="div" size="2" weight="bold" mb="2">
              Upload Files (Optional)
            </Text>
            
            <Flex gap="2" direction="column">
              <Button 
                type="button" 
                size="2" 
                variant="soft"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadIcon /> Select Files
              </Button>
              
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {files.length > 0 && (
                <Box mt="2">
                  <Text as="div" size="2" weight="bold">
                    Selected Files ({files.length})
                  </Text>
                  {files.map((file, index) => (
                    <Flex key={index} align="center" justify="between" mt="1">
                      <Text size="2" style={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </Text>
                      <Button 
                        type="button" 
                        size="1" 
                        variant="ghost" 
                        color="red"
                        onClick={() => removeFile(index)}
                      >
                        <Cross2Icon />
                      </Button>
                    </Flex>
                  ))}
                </Box>
              )}
            </Flex>
          </Box>
          
          <Flex justify="end" mt="2">
            <Button 
              type="submit" 
              disabled={isUploading || (!textSubmission && files.length === 0)}
            >
              {isUploading ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default SubmissionForm; 