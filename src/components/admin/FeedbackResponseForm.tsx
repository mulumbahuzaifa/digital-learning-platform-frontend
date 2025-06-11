import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Text, 
  Select, 
  TextField,
} from '@radix-ui/themes';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FeedbackResponseData, FeedbackStatus } from '../../types';

// Validation schema for feedback response form
const feedbackResponseSchema = z.object({
  response: z.string().min(1, 'Response is required'),
  status: z.enum(['submitted', 'reviewed', 'actioned', 'resolved'] as const).optional(),
});

type FeedbackResponseFormData = z.infer<typeof feedbackResponseSchema>;

interface FeedbackResponseFormProps {
  currentStatus: FeedbackStatus;
  onSubmit: (data: FeedbackResponseData) => Promise<void>;
  isSubmitting: boolean;
}

const FeedbackResponseForm: React.FC<FeedbackResponseFormProps> = ({
  currentStatus,
  onSubmit,
  isSubmitting,
}) => {
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    register
  } = useForm<FeedbackResponseFormData>({
    resolver: zodResolver(feedbackResponseSchema) as any,
    defaultValues: {
      response: '',
      status: currentStatus !== 'submitted' ? currentStatus : 'reviewed',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Flex direction="column" gap="4">
        <Heading size="3">Respond to Feedback</Heading>
        
        {/* Status Selection */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Update Status
          </Text>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select.Root
                value={field.value}
                onValueChange={field.onChange}
                size="3"
              >
                <Select.Trigger variant="soft" />
                <Select.Content>
                  <Select.Item value="reviewed">Reviewed</Select.Item>
                  <Select.Item value="actioned">Actioned</Select.Item>
                  <Select.Item value="resolved">Resolved</Select.Item>
                </Select.Content>
              </Select.Root>
            )}
          />
        </Box>

        {/* Response Content */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Response <span style={{ color: 'red' }}>*</span>
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <textarea
                {...register('response')}
                rows={5}
                style={{ 
                  width: '100%', 
                  resize: 'vertical',
                  color: errors.response ? 'red' : undefined 
                }}
                placeholder="Type your response here..."
              />
            </TextField.Slot>
          </TextField.Root>
          {errors.response && (
            <Text size="1" color="red" mt="1">
              {errors.response.message}
            </Text>
          )}
        </Box>

        {/* Form Actions */}
        <Flex gap="3" justify="end">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default FeedbackResponseForm; 