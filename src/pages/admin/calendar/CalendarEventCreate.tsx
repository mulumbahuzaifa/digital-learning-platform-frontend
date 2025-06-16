import { useState } from 'react';
import { Card, Flex, Button, Heading, Container, Box, Theme, Separator } from '@radix-ui/themes';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CalendarIcon } from '@radix-ui/react-icons';
import { useCalendarMutation } from '../../../hooks/useCalendarMutation';
import CalendarEventForm from '../../../components/admin/CalendarEventForm';
import { CreateCalendarEventData, UpdateCalendarEventData } from '../../../types';

const CalendarEventCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { createEvent } = useCalendarMutation();
  
  // Get initial date from location state if available (when created from calendar click)
  const initialState = location.state as { 
    start?: string; 
    end?: string; 
    allDay?: boolean 
  } | undefined;

  const handleSubmit = async (data: CreateCalendarEventData | UpdateCalendarEventData) => {
    setIsSubmitting(true);
    try {
      // Since we're creating, we can be sure this is CreateCalendarEventData
      await createEvent.mutateAsync(data as CreateCalendarEventData);
      navigate('/admin/calendar');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Theme appearance="light">
      <Container size="3">
        <Card size="4">
          <Flex direction="column" gap="4">
            {/* Header */}
            <Flex justify="between" align="center">
              <Flex align="center" gap="2">
                <CalendarIcon width="20" height="20" />
                <Heading size="4">Create New Event</Heading>
              </Flex>
              <Button 
                size="2" 
                variant="soft" 
                onClick={() => navigate('/admin/calendar')}
              >
                <ChevronLeftIcon /> Back to Calendar
              </Button>
            </Flex>
            
            <Separator size="4" />
            
            <Box py="2">
              <CalendarEventForm
                mode="create"
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                initialStartDate={initialState?.start}
                initialEndDate={initialState?.end}
                initialAllDay={initialState?.allDay}
              />
            </Box>
          </Flex>
        </Card>
      </Container>
    </Theme>
  );
};

export default CalendarEventCreate;