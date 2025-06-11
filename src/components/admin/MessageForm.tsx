import { useState, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Text, 
  Grid, 
  Select, 
  TextField,
  Card
} from '@radix-ui/themes';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Link1Icon, Cross2Icon } from '@radix-ui/react-icons';
import { CreateMessageData, UpdateMessageData, Message } from '../../types';

// Validation schema for messages
const messageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  recipient: z.string().optional(),
  class: z.string().optional(),
  subject: z.string().optional(),
}).refine(data => {
  // At least one destination must be specified
  return data.recipient || data.class;
}, {
  message: 'Please specify at least one recipient or a class',
  path: ['recipient']
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  initialData?: Message;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateMessageData | UpdateMessageData, files?: File[]) => Promise<void>;
  isSubmitting: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({
  initialData,
  mode,
  onSubmit,
  isSubmitting,
}) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    register
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema) as any,
    defaultValues: initialData ? {
      content: initialData.content,
      recipient: typeof initialData.recipient === 'string' ? initialData.recipient : initialData.recipient?._id,
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class?._id,
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject?._id,
    } : {
      content: '',
      recipient: '',
      class: '',
      subject: '',
    }
  });

  // Fetch users data for recipients
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch subjects
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAllSubjects(),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: MessageFormData) => {
    onSubmit(data, attachments.length > 0 ? attachments : undefined);
  };

  if (loadingUsers || loadingClasses || loadingSubjects) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Flex direction="column" gap="5">
        <Heading size="4">{mode === 'create' ? 'Send' : 'Edit'} Message</Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {/* User Recipient Selection */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Recipient
            </Text>
            <Controller
              control={control}
              name="recipient"
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select recipient" 
                    variant="soft"
                    color={errors.recipient ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="none">None (send to class)</Select.Item>
                    {users?.map(user => (
                      <Select.Item key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.recipient && (
              <Text size="1" color="red" mt="1">
                {errors.recipient.message}
              </Text>
            )}
          </Box>

          {/* Class Selection */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Class
            </Text>
            <Controller
              control={control}
              name="class"
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select class" 
                    variant="soft"
                    color={errors.class ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="none">None (send to individual)</Select.Item>
                    {classes?.map(cls => (
                      <Select.Item key={cls._id} value={cls._id}>
                        {cls.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Box>

          {/* Subject Selection (optional) */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Subject (Optional)
            </Text>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select subject" 
                    variant="soft"
                  />
                  <Select.Content>
                    <Select.Item value="none">None</Select.Item>
                    {subjects?.map(subject => (
                      <Select.Item key={subject._id} value={subject._id}>
                        {subject.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Box>
        </Grid>

        {/* Message Content */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Message <span style={{ color: 'red' }}>*</span>
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <textarea
                {...register('content')}
                rows={6}
                style={{ 
                  width: '100%', 
                  resize: 'vertical',
                  color: errors.content ? 'red' : undefined 
                }}
                placeholder="Type your message here..."
              />
            </TextField.Slot>
          </TextField.Root>
          {errors.content && (
            <Text size="1" color="red" mt="1">
              {errors.content.message}
            </Text>
          )}
        </Box>

        {/* File Attachments */}
        <Box>
          <Flex direction="column" gap="2">
            <Flex justify="between" align="center">
              <Text size="2" weight="bold">Attachments</Text>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button 
                type="button" 
                size="1" 
                variant="soft"
                onClick={() => fileInputRef.current?.click()}
              >
                <Link1Icon /> Add Files
              </Button>
            </Flex>
            
            {attachments.length > 0 ? (
              <Card size="1" style={{ padding: '10px' }}>
                <Flex direction="column" gap="2">
                  {attachments.map((file, index) => (
                    <Flex key={index} justify="between" align="center">
                      <Text size="1">{file.name} ({(file.size / 1024).toFixed(2)} KB)</Text>
                      <Button 
                        type="button" 
                        size="1" 
                        variant="ghost" 
                        color="red"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Cross2Icon />
                      </Button>
                    </Flex>
                  ))}
                </Flex>
              </Card>
            ) : (
              <Text size="1" color="gray">No attachments added</Text>
            )}
          </Flex>
        </Box>

        {/* Form Actions */}
        <Flex gap="3" justify="end">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Sending...' : 'Updating...') 
              : (mode === 'create' ? 'Send Message' : 'Update Message')
            }
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default MessageForm; 