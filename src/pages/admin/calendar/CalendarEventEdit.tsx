import { useState } from 'react';
import { Card, Flex, Button } from '@radix-ui/themes';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarMutation } from '../../../hooks/useCalendarMutation';
import { calendarService } from '../../../services/calendarService';
import CalendarEventForm from '../../../components/admin/CalendarEventForm';
import { UpdateCalendarEventData } from '../../../types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const CalendarEventEdit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEvent } = useCalendarMutation();
  
  const { data: event, isLoading } = useQuery({
    queryKey: ['calendarEvent', id],
    queryFn: () => id ? calendarService.getEventById(id) : Promise.reject('No event ID'),
    enabled: !!id,
  });

  const handleSubmit = async (data: UpdateCalendarEventData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateEvent.mutateAsync({ id, data });
      navigate('/admin/calendar');
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <Card size="4">
        <Flex direction="column" gap="4" align="center" justify="center">
          <p>Event not found</p>
          <Button onClick={() => navigate('/admin/calendar')}>
            Back to Calendar
          </Button>
        </Flex>
      </Card>
    );
  }

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
          mode="edit"
          initialData={event}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Flex>
    </Card>
  );
};

export default CalendarEventEdit; 