import { useState } from 'react';
import { Card, Flex, Button, Heading, Container, Box, Theme, Separator, Text } from '@radix-ui/themes';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, CalendarIcon, Pencil1Icon } from '@radix-ui/react-icons';
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
    return (
      <Theme appearance="light">
        <Container size="3">
          <Card size="4">
            <Flex direction="column" gap="4" align="center" justify="center" py="6">
              <LoadingSpinner />
              <Text size="2" color="gray">Loading event details...</Text>
            </Flex>
          </Card>
        </Container>
      </Theme>
    );
  }

  if (!event) {
    return (
      <Theme appearance="light">
        <Container size="3">
          <Card size="4">
            <Flex direction="column" gap="4" align="center" justify="center" py="6">
              <Text size="3" weight="medium">Event not found</Text>
              <Button onClick={() => navigate('/admin/calendar')} size="2">
                <ChevronLeftIcon /> Back to Calendar
              </Button>
            </Flex>
          </Card>
        </Container>
      </Theme>
    );
  }

  return (
    <Theme appearance="light">
      <Container size="3">
        <Card size="4">
          <Flex direction="column" gap="4">
            {/* Header */}
            <Flex justify="between" align="center">
              <Flex align="center" gap="2">
                <Pencil1Icon width="20" height="20" />
                <Heading size="4">Edit Event: {event.title}</Heading>
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
                mode="edit"
                initialData={event}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </Box>
          </Flex>
        </Card>
      </Container>
    </Theme>
  );
};

export default CalendarEventEdit;