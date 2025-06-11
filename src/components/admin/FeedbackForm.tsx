import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Text, 
  Grid, 
  Select, 
  TextField,
  Switch
} from '@radix-ui/themes';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { contentService } from '../../services/contentService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  CreateFeedbackData, 
  UpdateFeedbackData,
  Feedback,
  FeedbackType 
} from '../../types';

// Validation schema for feedback form
const feedbackSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).optional(),
  toUser: z.string().optional(),
  class: z.string().optional(),
  subject: z.string().optional(),
  contentItem: z.string().optional(),
  feedbackType: z.enum(['teacher', 'student', 'content', 'assignment', 'platform', 'system'] as const),
  isAnonymous: z.boolean().default(false),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  initialData?: Feedback;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateFeedbackData | UpdateFeedbackData) => Promise<void>;
  isSubmitting: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  initialData,
  mode,
  onSubmit,
  isSubmitting,
}) => {
  const [showRating, setShowRating] = useState<boolean>(
    initialData ? ['teacher', 'student', 'content'].includes(initialData.feedbackType) : false
  );

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch,
    register
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema) as any,
    defaultValues: initialData ? {
      content: initialData.content,
      rating: initialData.rating,
      toUser: typeof initialData.toUser === 'string' ? initialData.toUser : initialData.toUser?._id,
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class?._id,
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject?._id,
      contentItem: typeof initialData.contentItem === 'string' ? initialData.contentItem : initialData.contentItem?._id,
      feedbackType: initialData.feedbackType,
      isAnonymous: initialData.isAnonymous,
    } : {
      content: '',
      rating: 5,
      toUser: '',
      class: '',
      subject: '',
      contentItem: '',
      feedbackType: 'platform' as FeedbackType,
      isAnonymous: false,
    }
  });

  // Fetch users for recipient selection
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

  // Fetch content items
  const { data: contentItems, isLoading: loadingContent } = useQuery({
    queryKey: ['content'],
    queryFn: () => contentService.getAllContent(),
  });

  const watchedFeedbackType = watch('feedbackType');

  // Update form when feedback type changes
  // This helps to determine if rating should be shown
  useEffect(() => {
    setShowRating(['teacher', 'student', 'content'].includes(watchedFeedbackType));
  }, [watchedFeedbackType]);

  if (loadingUsers || loadingClasses || loadingSubjects || loadingContent) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Flex direction="column" gap="5">
        <Heading size="4">{mode === 'create' ? 'Submit' : 'Edit'} Feedback</Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {/* Feedback Type */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Feedback Type <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="feedbackType"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={(value: any) => {
                    field.onChange(value);
                    // Reset related fields when type changes
                    if (value === 'platform' || value === 'system') {
                      setValue('toUser', '');
                      setValue('class', '');
                      setValue('subject', '');
                      setValue('contentItem', '');
                    }
                    // Show/hide rating field
                    setShowRating(['teacher', 'student', 'content'].includes(value));
                  }}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select feedback type" 
                    variant="soft"
                    color={errors.feedbackType ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="teacher">Teacher Feedback</Select.Item>
                    <Select.Item value="student">Student Feedback</Select.Item>
                    <Select.Item value="content">Content Feedback</Select.Item>
                    <Select.Item value="assignment">Assignment Feedback</Select.Item>
                    <Select.Item value="platform">Platform Feedback</Select.Item>
                    <Select.Item value="system">System Feedback</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.feedbackType && (
              <Text size="1" color="red" mt="1">
                {errors.feedbackType.message}
              </Text>
            )}
          </Box>

          {/* Rating (Only for certain feedback types) */}
          {showRating && (
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Rating (1-5)
              </Text>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <Select.Root
                    value={field.value?.toString() || '5'}
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    size="3"
                  >
                    <Select.Trigger 
                      placeholder="Select rating" 
                      variant="soft"
                    />
                    <Select.Content>
                      <Select.Item value="1">1 - Very Poor</Select.Item>
                      <Select.Item value="2">2 - Poor</Select.Item>
                      <Select.Item value="3">3 - Average</Select.Item>
                      <Select.Item value="4">4 - Good</Select.Item>
                      <Select.Item value="5">5 - Excellent</Select.Item>
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Box>
          )}

          {/* Teacher/Student Selection - only for teacher/student feedback */}
          {(watchedFeedbackType === 'teacher' || watchedFeedbackType === 'student') && (
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Recipient
              </Text>
              <Controller
                control={control}
                name="toUser"
                render={({ field }) => (
                  <Select.Root
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    size="3"
                  >
                    <Select.Trigger 
                      placeholder={`Select ${watchedFeedbackType}`} 
                      variant="soft"
                    />
                    <Select.Content>
                      <Select.Item value="none">None</Select.Item>
                      {users?.filter(user => 
                        watchedFeedbackType === 'teacher' 
                          ? user.role === 'teacher' 
                          : user.role === 'student'
                      ).map(user => (
                        <Select.Item key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Box>
          )}

          {/* Class Selection */}
          {['teacher', 'student', 'content', 'assignment'].includes(watchedFeedbackType) && (
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
                    />
                    <Select.Content>
                      <Select.Item value="none">None</Select.Item>
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
          )}

          {/* Subject Selection */}
          {['teacher', 'student', 'content', 'assignment'].includes(watchedFeedbackType) && (
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Subject
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
          )}

          {/* Content Selection - only for content feedback */}
          {watchedFeedbackType === 'content' && (
            <Box>
              <Text as="label" size="2" weight="bold" mb="1">
                Content Item
              </Text>
              <Controller
                control={control}
                name="contentItem"
                render={({ field }) => (
                  <Select.Root
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    size="3"
                  >
                    <Select.Trigger 
                      placeholder="Select content" 
                      variant="soft"
                    />
                    <Select.Content>
                      <Select.Item value="none">None</Select.Item>
                      {contentItems?.map(item => (
                        <Select.Item key={item._id} value={item._id}>
                          {item.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Box>
          )}

          {/* Anonymous Switch */}
          <Box>
            <Flex gap="2" align="center">
              <Text as="label" size="2" weight="bold">
                Submit Anonymously
              </Text>
              <Controller
                control={control}
                name="isAnonymous"
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>
          </Box>
        </Grid>

        {/* Feedback Content */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Feedback Content <span style={{ color: 'red' }}>*</span>
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
              />
            </TextField.Slot>
          </TextField.Root>
          {errors.content && (
            <Text size="1" color="red" mt="1">
              {errors.content.message}
            </Text>
          )}
        </Box>

        {/* Form Actions */}
        <Flex gap="3" justify="end">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Submitting...' : 'Updating...') 
              : (mode === 'create' ? 'Submit Feedback' : 'Update Feedback')
            }
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default FeedbackForm; 