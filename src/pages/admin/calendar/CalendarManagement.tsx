import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Flex,
  Heading,
  Button,
  Text,
  Select,
  Separator,
  AlertDialog,
  Container,
  Badge,
  Grid,
  Theme
} from '@radix-ui/themes';
import { calendarService } from '../../../services/calendarService';
import { classService } from '../../../services/classService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useCalendarMutation } from '../../../hooks/useCalendarMutation';
import { CalendarEvent, EventType, Class } from '../../../types';
import { PlusIcon, TrashIcon, CalendarIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventSourceInput } from '@fullcalendar/core';
import { formatDate } from '../../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';

// Event color mapping based on event type
const eventColorMap: Record<EventType, string> = {
  class: '#4338ca', // indigo
  exam: '#be123c', // rose
  assignment: '#0284c7', // sky
  holiday: '#ca8a04', // yellow
  meeting: '#15803d', // green
  school: '#7c3aed', // violet
  personal: '#6d28d9', // purple
};

const CalendarManagement = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [classFilter, setClassFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [clickedEventId, setClickedEventId] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const { deleteEvent } = useCalendarMutation();

  // Calculate start and end dates for the current view (month by default)
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(currentDate);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Last day of current month
    end.setHours(23, 59, 59, 999);

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }, [currentDate]);

  // Fetch calendar events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendarEvents', {
      start: dateRange.start,
      end: dateRange.end,
      class: classFilter !== 'all' ? classFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined
    }],
    queryFn: () => calendarService.getEvents({
      start: dateRange.start,
      end: dateRange.end,
      class: classFilter !== 'all' ? classFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter as EventType : undefined
    }),
  });

  // Fetch clicked event details
  const { data: clickedEvent, isLoading: isLoadingClickedEvent } = useQuery({
    queryKey: ['calendarEvent', clickedEventId],
    queryFn: () => clickedEventId ? calendarService.getEventById(clickedEventId) : Promise.reject('No event ID'),
    enabled: !!clickedEventId && showEventDetails,
  });

  // Fetch classes for filter
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAllClasses(),
  });

  if (isLoadingEvents || isLoadingClasses) {
    return <LoadingSpinner />;
  }

  // Format events for FullCalendar
  const formattedEvents: EventSourceInput = events?.map(event => ({
    id: event._id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: eventColorMap[event.eventType],
    borderColor: eventColorMap[event.eventType],
    extendedProps: {
      description: event.description,
      location: event.location,
      type: event.eventType,
    }
  })) || [];

  const handleDateChange = (dateInfo: any) => {
    setCurrentDate(dateInfo.view.currentStart);
  };

  const handleEventClick = (info: any) => {
    setClickedEventId(info.event.id);
    setShowEventDetails(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    navigate('/admin/calendar/create', {
      state: {
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      }
    });
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      await deleteEvent.mutateAsync(eventToDelete);
      setEventToDelete(null);
      setShowEventDetails(false);
    }
  };

  const getClassName = (classId: string) => {
    const targetClass = classes?.find(c => c._id === classId);
    return targetClass ? targetClass.name : classId;
  };

  const getEventTypeBadgeColor = (type: EventType) => {
    switch(type) {
      case 'class': return 'indigo';
      case 'exam': return 'red';
      case 'assignment': return 'blue';
      case 'holiday': return 'yellow';
      case 'meeting': return 'green';
      case 'school': return 'purple';
      case 'personal': return 'violet';
      default: return 'gray';
    }
  };

  return (
    <Theme appearance="light">
      <Container size="4">
        <Card size="4" style={{ overflow: 'hidden' }}>
          <Flex direction="column" gap="5">
            {/* Header with title and action button */}
            <Flex justify="between" align="center" py="2">
              <Flex align="center" gap="2">
                <CalendarIcon width="24" height="24" />
                <Heading size="5">Calendar Management</Heading>
              </Flex>
              <Button asChild size="2">
                <Link to="/admin/calendar/create">
                  <PlusIcon /> Add New Event
                </Link>
              </Button>
            </Flex>
            
            <Separator size="4" />
            
            {/* Filters section with improved layout */}
            <Card size="1">
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <MagnifyingGlassIcon />
                  <Text weight="bold" size="2">Filters</Text>
                </Flex>
                
                <Grid columns={{ initial: '1', sm: '2' }} gap="3">
                  <Flex direction="column" gap="1">
                    <Text as="label" size="1" weight="medium">Class</Text>
                    <Select.Root 
                      value={classFilter} 
                      onValueChange={setClassFilter}
                      size="2"
                    >
                      <Select.Trigger placeholder="Filter by class" />
                      <Select.Content>
                        <Select.Item value="all">All Classes</Select.Item>
                        {classes?.map(c => (
                          <Select.Item key={c._id} value={c._id}>
                            {c.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                  
                  <Flex direction="column" gap="1">
                    <Text as="label" size="1" weight="medium">Event Type</Text>
                    <Select.Root 
                      value={typeFilter} 
                      onValueChange={setTypeFilter}
                      size="2"
                    >
                      <Select.Trigger placeholder="Filter by event type" />
                      <Select.Content>
                        <Select.Item value="all">All Event Types</Select.Item>
                        <Select.Item value="class">Class</Select.Item>
                        <Select.Item value="exam">Exam</Select.Item>
                        <Select.Item value="assignment">Assignment</Select.Item>
                        <Select.Item value="holiday">Holiday</Select.Item>
                        <Select.Item value="meeting">Meeting</Select.Item>
                        <Select.Item value="school">School</Select.Item>
                        <Select.Item value="personal">Personal</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Grid>
                
                {/* Event type legend */}
                <Flex gap="2" wrap="wrap" mt="1">
                  {Object.entries(eventColorMap).map(([type, color]) => (
                    <Badge key={type} style={{ backgroundColor: color, color: 'white' }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            </Card>

            {/* Calendar with improved height */}
            <Box style={{ height: '700px', borderRadius: '8px', overflow: 'hidden' }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={formattedEvents}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                datesSet={handleDateChange}
                eventClick={handleEventClick}
                select={handleDateSelect}
                height="100%"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day'
                }}
              />
            </Box>

            {/* Event Details Dialog */}
            {/* {showEventDetails && (
              <AlertDialog.Root 
                open={showEventDetails}
                onOpenChange={(open) => {
                  setShowEventDetails(open);
                  if (!open) setClickedEventId(null);
                }}
              >
                <AlertDialog.Content style={{ maxWidth: '500px' }}>
                  <AlertDialog.Title>Event Details</AlertDialog.Title>
                  <AlertDialog.Description>
                    {isLoadingClickedEvent ? (
                      <LoadingSpinner />
                    ) : clickedEvent ? (
                      <Flex direction="column" gap="3">
                        <Heading size="4">{clickedEvent.title}</Heading>
                        
                        <Flex gap="2" align="center">
                          <Badge style={{ backgroundColor: eventColorMap[clickedEvent.eventType], color: 'white' }}>
                            {clickedEvent.eventType.charAt(0).toUpperCase() + clickedEvent.eventType.slice(1)}
                          </Badge>
                          {clickedEvent.location && (
                            <Text size="2" color="gray">
                              @ {clickedEvent.location}
                            </Text>
                          )}
                        </Flex>
                        
                        <Card size="1">
                          <Flex direction="column" gap="2">
                            <Flex direction="column" gap="1">
                              <Text size="2" weight="bold">Time:</Text>
                              <Text size="2">
                                {formatDate(clickedEvent.start)} 
                                {!clickedEvent.allDay && (
                                  ` ${new Date(clickedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                )}
                                {' to '}
                                {formatDate(clickedEvent.end)}
                                {!clickedEvent.allDay && (
                                  ` ${new Date(clickedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                )}
                                {clickedEvent.allDay && ' (All day)'}
                              </Text>
                            </Flex>

                            {clickedEvent.class && (
                              <Flex direction="column" gap="1">
                                <Text size="2" weight="bold">Class:</Text>
                                <Text size="2">
                                  {typeof clickedEvent.class === 'string' 
                                    ? getClassName(clickedEvent.class)
                                    : clickedEvent.class.name}
                                </Text>
                              </Flex>
                            )}

                            {clickedEvent.subject && (
                              <Flex direction="column" gap="1">
                                <Text size="2" weight="bold">Subject:</Text>
                                <Text size="2">
                                  {typeof clickedEvent.subject === 'string' 
                                    ? clickedEvent.subject
                                    : clickedEvent.subject.name}
                                </Text>
                              </Flex>
                            )}

                            {clickedEvent.description && (
                              <Flex direction="column" gap="1">
                                <Text size="2" weight="bold">Description:</Text>
                                <Text size="2">{clickedEvent.description}</Text>
                              </Flex>
                            )}

                            {clickedEvent.recurring?.isRecurring && (
                              <Flex direction="column" gap="1">
                                <Text size="2" weight="bold">Recurring:</Text>
                                <Text size="2">
                                  {clickedEvent.recurring.frequency} 
                                  {clickedEvent.recurring.endRecurring && 
                                    ` until ${formatDate(clickedEvent.recurring.endRecurring)}`
                                  }
                                </Text>
                              </Flex>
                            )}

                            {clickedEvent.attendees?.length > 0 && (
                              <Flex direction="column" gap="1">
                                <Text size="2" weight="bold">Attendees:</Text>
                                <Text size="2">{clickedEvent.attendees.length} people</Text>
                              </Flex>
                            )}
                          </Flex>
                        </Card>

                        <Separator my="3" size="4" />

                        <Flex gap="3" justify="end">
                          <Button asChild variant="soft" size="2">
                            <Link to={`/admin/calendar/${clickedEvent._id}/edit`}>
                              Edit Event
                            </Link>
                          </Button>
                          <Button 
                            color="red" 
                            variant="soft"
                            size="2"
                            onClick={() => {
                              setEventToDelete(clickedEvent._id);
                              setShowEventDetails(false);
                            }}
                          >
                            <TrashIcon /> Delete
                          </Button>
                        </Flex>
                      ) : (
                      <Text>Event not found</Text>
                    )}
                  </AlertDialog.Description>

                  <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                      <Button variant="soft" color="gray" size="2">
                        Close
                      </Button>
                    </AlertDialog.Cancel>
                  </Flex>
                </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            )} */}

            {/* Delete Confirmation Dialog */}
            <AlertDialog.Root
              open={!!eventToDelete}
              onOpenChange={() => setEventToDelete(null)}
            >
              <AlertDialog.Content style={{ maxWidth: '400px' }}>
                <AlertDialog.Title>Delete Event</AlertDialog.Title>
                <AlertDialog.Description>
                  Are you sure you want to delete this event? This action cannot be undone.
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                  <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" size="2">Cancel</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action>
                    <Button 
                      color="red" 
                      size="2"
                      disabled={deleteEvent.isPending}
                      onClick={handleDeleteEvent}
                    >
                      {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          </Flex>
        </Card>
      </Container>
    </Theme>
  );
};

export default CalendarManagement;