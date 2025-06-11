import { useState } from 'react';
import { Card, Flex, Button } from '@radix-ui/themes';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
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
    <Card size="4">
      <Flex direction="column" gap="4">
        <Flex>
          <Button 
            size="1" 
            variant="ghost" 
            onClick={() => navigate('/admin/calendar')}
          >
            <ChevronLeftIcon /> Back to Calendar
          </Button>
        </Flex>
        
        <CalendarEventForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialStartDate={initialState?.start}
          initialEndDate={initialState?.end}
          initialAllDay={initialState?.allDay}
        />
      </Flex>
    </Card>
  );
};

export default CalendarEventCreate; 