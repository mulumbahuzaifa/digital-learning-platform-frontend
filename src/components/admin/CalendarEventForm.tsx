import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Flex, 
  Heading, 
  Button, 
  Text, 
  Grid, 
  Select, 
  TextField,
  Switch,
  Table
} from '@radix-ui/themes';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CalendarIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { 
  CalendarEvent, 
  CreateCalendarEventData, 
  UpdateCalendarEventData,
  EventType,
  RecurringFrequency,
  EventAttendanceStatus
} from '../../types';

// Validation schema for calendar event form
const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  end: z.string().min(1, 'End date is required'),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  class: z.string().optional(),
  subject: z.string().optional(),
  eventType: z.enum(['class', 'exam', 'assignment', 'holiday', 'meeting', 'school', 'personal'] as const),
  location: z.string().optional(),
  recurring: z.object({
    isRecurring: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'] as const).optional(),
    endRecurring: z.string().optional()
  }),
  attendees: z.array(
    z.object({
      user: z.string().min(1, 'Attendee is required'),
    })
  ).default([]),
});

type CalendarEventFormData = z.infer<typeof calendarEventSchema>;

interface CalendarEventFormProps {
  initialData?: CalendarEvent;
  initialStartDate?: string;
  initialEndDate?: string;
  initialAllDay?: boolean;
  mode: 'create' | 'edit';
  onSubmit: (data: CreateCalendarEventData | UpdateCalendarEventData) => Promise<void>;
  isSubmitting: boolean;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  initialData,
  initialStartDate,
  initialEndDate,
  initialAllDay,
  mode,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    typeof initialData?.class === 'string' ? initialData.class : initialData?.class?._id || ''
  );

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch,
    register
  } = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventSchema) as any,
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      start: typeof initialData.start === 'string' 
        ? initialData.start.split('T')[0] 
        : new Date(initialData.start).toISOString().split('T')[0],
      startTime: typeof initialData.start === 'string' && !initialData.allDay
        ? initialData.start.split('T')[1]?.substring(0, 5) || ''
        : !initialData.allDay ? new Date(initialData.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      end: typeof initialData.end === 'string' 
        ? initialData.end.split('T')[0] 
        : new Date(initialData.end).toISOString().split('T')[0],
      endTime: typeof initialData.end === 'string' && !initialData.allDay
        ? initialData.end.split('T')[1]?.substring(0, 5) || ''
        : !initialData.allDay ? new Date(initialData.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      allDay: initialData.allDay,
      class: typeof initialData.class === 'string' ? initialData.class : initialData.class?._id || '',
      subject: typeof initialData.subject === 'string' ? initialData.subject : initialData.subject?._id || '',
      eventType: initialData.eventType,
      location: initialData.location || '',
      recurring: {
        isRecurring: initialData.recurring?.isRecurring || false,
        frequency: initialData.recurring?.frequency,
        endRecurring: initialData.recurring?.endRecurring 
          ? (typeof initialData.recurring.endRecurring === 'string'
            ? initialData.recurring.endRecurring.split('T')[0]
            : new Date(initialData.recurring.endRecurring).toISOString().split('T')[0])
          : undefined
      },
      attendees: initialData.attendees?.map(a => ({
        user: typeof a.user === 'string' ? a.user : a.user._id,
      })) || []
    } : {
      title: '',
      description: '',
      start: initialStartDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      startTime: initialStartDate?.split('T')[1]?.substring(0, 5) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end: initialEndDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      endTime: initialEndDate?.split('T')[1]?.substring(0, 5) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      allDay: initialAllDay || false,
      class: '',
      subject: '',
      eventType: 'class' as EventType,
      location: '',
      recurring: {
        isRecurring: false,
        frequency: undefined,
        endRecurring: undefined
      },
      attendees: [],
    }
  });

  // Field array for attendees
  const { fields: attendeeFields, append: appendAttendee, remove: removeAttendee } = useFieldArray({
    control,
    name: 'attendees'
  });

  // Fetch users data for attendees
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch classes data
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  // Fetch subjects data
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAllSubjects(),
  });

  // Watch class to handle dependencies
  const watchedClass = watch('class');
  const watchedAllDay = watch('allDay');
  const watchedIsRecurring = watch('recurring.isRecurring');

  // Update local state when the form values change
  useEffect(() => {
    if (watchedClass !== selectedClass) {
      setSelectedClass(watchedClass || '');
      
      // Clear subject when class changes
      if (watchedClass !== selectedClass) {
        setValue('subject', '');
      }
    }
  }, [watchedClass, selectedClass, setValue]);

  // Handle all day changes
  useEffect(() => {
    if (watchedAllDay) {
      setValue('startTime', '');
      setValue('endTime', '');
    }
  }, [watchedAllDay, setValue]);

  if (loadingUsers || loadingClasses || loadingSubjects) {
    return <LoadingSpinner />;
  }

  const handleFormSubmit = async (data: CalendarEventFormData) => {
    // Format the data for API
    const formattedData: CreateCalendarEventData | UpdateCalendarEventData = {
      title: data.title,
      description: data.description,
      // Combine date and time
      start: data.allDay 
        ? `${data.start}T00:00:00.000Z` 
        : `${data.start}T${data.startTime || '00:00'}:00.000Z`,
      end: data.allDay 
        ? `${data.end}T23:59:59.999Z` 
        : `${data.end}T${data.endTime || '23:59'}:00.000Z`,
      allDay: data.allDay,
      // Remove empty strings
      class: data.class || undefined,
      subject: data.subject || undefined,
      location: data.location || undefined,
      eventType: data.eventType,
      // Format recurring data
      recurring: {
        isRecurring: data.recurring.isRecurring,
        frequency: data.recurring.isRecurring ? data.recurring.frequency : undefined,
        endRecurring: data.recurring.isRecurring && data.recurring.endRecurring
          ? `${data.recurring.endRecurring}T23:59:59.999Z`
          : undefined
      },
      // Format attendees with proper type
      attendees: data.attendees.map(a => ({
        user: a.user,
        status: 'pending' as EventAttendanceStatus
      }))
    };

    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)}>
      <Flex direction="column" gap="5">
        <Heading size="4">{mode === 'create' ? 'Create' : 'Edit'} Calendar Event</Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {/* Title */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Title <span style={{ color: 'red' }}>*</span>
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <input
                  type="text"
                  {...register('title')}
                  style={{ color: errors.title ? 'red' : undefined }}
                />
              </TextField.Slot>
            </TextField.Root>
            {errors.title && (
              <Text size="1" color="red" mt="1">
                {errors.title.message}
              </Text>
            )}
          </Box>

          {/* Event Type */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Event Type <span style={{ color: 'red' }}>*</span>
            </Text>
            <Controller
              control={control}
              name="eventType"
              render={({ field }) => (
                <Select.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  size="3"
                >
                  <Select.Trigger 
                    placeholder="Select event type" 
                    variant="soft"
                    color={errors.eventType ? 'red' : undefined}
                  />
                  <Select.Content>
                    <Select.Item value="class">Class</Select.Item>
                    <Select.Item value="exam">Exam</Select.Item>
                    <Select.Item value="assignment">Assignment</Select.Item>
                    <Select.Item value="holiday">Holiday</Select.Item>
                    <Select.Item value="meeting">Meeting</Select.Item>
                    <Select.Item value="school">School</Select.Item>
                    <Select.Item value="personal">Personal</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
            {errors.eventType && (
              <Text size="1" color="red" mt="1">
                {errors.eventType.message}
              </Text>
            )}
          </Box>

          {/* Date and Time Section */}
          <Box>
            <Text size="2" weight="bold" mb="2">Start Date & Time <span style={{ color: 'red' }}>*</span></Text>
            <Flex gap="2" align="center">
              <Box style={{ flexGrow: 1 }}>
                <TextField.Root>
                  <TextField.Slot>
                    <CalendarIcon height="16" width="16" />
                  </TextField.Slot>
                  <TextField.Slot>
                    <input
                      type="date"
                      {...register('start')}
                      style={{ color: errors.start ? 'red' : undefined }}
                    />
                  </TextField.Slot>
                </TextField.Root>
                {errors.start && (
                  <Text size="1" color="red" mt="1">
                    {errors.start.message}
                  </Text>
                )}
              </Box>
              {!watchedAllDay && (
                <Box>
                  <TextField.Root>
                    <TextField.Slot>
                      <input
                        type="time"
                        {...register('startTime')}
                      />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
              )}
            </Flex>
          </Box>

          <Box>
            <Text size="2" weight="bold" mb="2">End Date & Time <span style={{ color: 'red' }}>*</span></Text>
            <Flex gap="2" align="center">
              <Box style={{ flexGrow: 1 }}>
                <TextField.Root>
                  <TextField.Slot>
                    <CalendarIcon height="16" width="16" />
                  </TextField.Slot>
                  <TextField.Slot>
                    <input
                      type="date"
                      {...register('end')}
                      style={{ color: errors.end ? 'red' : undefined }}
                    />
                  </TextField.Slot>
                </TextField.Root>
                {errors.end && (
                  <Text size="1" color="red" mt="1">
                    {errors.end.message}
                  </Text>
                )}
              </Box>
              {!watchedAllDay && (
                <Box>
                  <TextField.Root>
                    <TextField.Slot>
                      <input
                        type="time"
                        {...register('endTime')}
                      />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
              )}
            </Flex>
          </Box>

          {/* All Day Switch */}
          <Box>
            <Flex gap="2" align="center">
              <Text as="label" size="2" weight="bold">
                All Day Event
              </Text>
              <Controller
                control={control}
                name="allDay"
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>
          </Box>

          {/* Location */}
          <Box>
            <Text as="label" size="2" weight="bold" mb="1">
              Location
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <input
                  type="text"
                  {...register('location')}
                />
              </TextField.Slot>
            </TextField.Root>
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
                    placeholder="Select a class" 
                    variant="soft"
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Classes</Select.Label>
                      <Select.Item value="none">None</Select.Item>
                      {classes?.map(cls => (
                        <Select.Item key={cls._id} value={cls._id}>
                          {cls.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Box>

          {/* Subject Selection */}
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
                  disabled={!selectedClass}
                >
                  <Select.Trigger 
                    placeholder="Select a subject" 
                    variant="soft"
                  />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Subjects</Select.Label>
                      <Select.Item value="none">None</Select.Item>
                      {subjects?.map(subject => (
                        <Select.Item key={subject._id} value={subject._id}>
                          {subject.name}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Box>
        </Grid>

        {/* Description */}
        <Box>
          <Text as="label" size="2" weight="bold" mb="1">
            Description
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <textarea
                {...register('description')}
                rows={4}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        {/* Recurring Settings */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex gap="2" align="center">
              <Text as="label" size="2" weight="bold">
                Recurring Event
              </Text>
              <Controller
                control={control}
                name="recurring.isRecurring"
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Flex>
            
            {watchedIsRecurring && (
              <Grid columns="2" gap="4">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Frequency
                  </Text>
                  <Controller
                    control={control}
                    name="recurring.frequency"
                    render={({ field }) => (
                      <Select.Root
                        value={field.value || 'weekly'}
                        onValueChange={field.onChange as (value: string) => void}
                        size="3"
                      >
                        <Select.Trigger 
                          placeholder="Select frequency" 
                          variant="soft"
                        />
                        <Select.Content>
                          <Select.Item value="daily">Daily</Select.Item>
                          <Select.Item value="weekly">Weekly</Select.Item>
                          <Select.Item value="monthly">Monthly</Select.Item>
                          <Select.Item value="yearly">Yearly</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    End Date
                  </Text>
                  <TextField.Root>
                    <TextField.Slot>
                      <CalendarIcon height="16" width="16" />
                    </TextField.Slot>
                    <TextField.Slot>
                      <input
                        type="date"
                        {...register('recurring.endRecurring')}
                      />
                    </TextField.Slot>
                  </TextField.Root>
                </Box>
              </Grid>
            )}
          </Flex>
        </Card>

        {/* Attendees */}
        <Card>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Attendees</Heading>
              <Button 
                size="1" 
                onClick={() => appendAttendee({ user: '' })}
                type="button"
              >
                <PlusIcon /> Add Attendee
              </Button>
            </Flex>
            
            {attendeeFields.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="50px"></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {attendeeFields.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.Cell>
                        <Controller
                          control={control}
                          name={`attendees.${index}.user` as const}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={field.onChange}
                              size="2"
                            >
                              <Select.Trigger 
                                placeholder="Select user" 
                                variant="soft"
                              />
                              <Select.Content>
                                {users?.map(user => (
                                  <Select.Item key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} ({user.role})
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Button 
                          size="1" 
                          variant="soft" 
                          color="red" 
                          onClick={() => removeAttendee(index)}
                          type="button"
                        >
                          <TrashIcon />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Text size="2" color="gray">No attendees added yet</Text>
            )}
          </Flex>
        </Card>

        {/* Form Actions */}
        <Flex gap="3" justify="end">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Event' : 'Update Event')
            }
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default CalendarEventForm;