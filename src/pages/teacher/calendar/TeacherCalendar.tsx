import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Flex,
  Heading,
  Button,
  Text,
  Dialog,
  AlertDialog,
} from "@radix-ui/themes";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import {
  CalendarEvent,
  EventType,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from "../../../types";
import { calendarService } from "../../../services/calendarService";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CalendarEventForm from "../../../components/teacher/CalendarEventForm";
import { EventClickArg } from "@fullcalendar/core";

// Event color mapping based on event type
const eventColorMap: Record<EventType, string> = {
  class: "#4F46E5", // Indigo
  exam: "#DC2626", // Red
  assignment: "#F59E0B", // Amber
  holiday: "#10B981", // Emerald
  meeting: "#8B5CF6", // Violet
  school: "#EC4899", // Pink
  personal: "#6B7280", // Gray
};

const TeacherCalendar: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: () => calendarService.getEvents(),
  });

  console.log(events);

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    },
  });

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event.extendedProps as CalendarEvent;
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleDateSelect = (selectInfo: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => {
    setSelectedDate(selectInfo.start);
    setShowCreateDialog(true);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent._id);
    }
  };

  const formatEvents = (events: CalendarEvent[]) => {
    return events.map((event) => ({
      id: event._id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: eventColorMap[event.eventType as EventType],
      borderColor: eventColorMap[event.eventType as EventType],
      extendedProps: event,
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Calendar</Heading>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon /> New Event
        </Button>
      </Flex>

      <Card>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={formatEvents(events)}
          eventClick={handleEventClick}
          select={handleDateSelect}
          height="auto"
        />
      </Card>

      {/* Create Event Dialog */}
      <Dialog.Root open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          {/* <Dialog.Title>Create New Event</Dialog.Title> */}
          <CalendarEventForm
            mode="create"
            initialStartDate={
              selectedDate
                ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
                : undefined
            }
            initialEndDate={
              selectedDate
                ? format(
                    new Date(selectedDate.getTime() + 60 * 60 * 1000),
                    "yyyy-MM-dd'T'HH:mm"
                  )
                : undefined
            }
            onSubmit={async (
              data: CreateCalendarEventData | UpdateCalendarEventData
            ) => {
              if ("_id" in data && typeof data._id === "string") {
                await calendarService.updateEvent(
                  data._id,
                  data as UpdateCalendarEventData
                );
              } else {
                await calendarService.createEvent(
                  data as CreateCalendarEventData
                );
              }
              queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
              setShowCreateDialog(false);
            }}
            isSubmitting={false}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Event Details Dialog */}
      <Dialog.Root open={showEventDialog} onOpenChange={setShowEventDialog}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>{selectedEvent?.title}</Dialog.Title>
          <Box>
            <Text as="p" mb="2">
              {selectedEvent?.description}
            </Text>
            <Text as="p" mb="2">
              <strong>Type:</strong> {selectedEvent?.eventType}
            </Text>
            <Text as="p" mb="2">
              <strong>Start:</strong>{" "}
              {selectedEvent?.start &&
                format(new Date(selectedEvent.start), "PPp")}
            </Text>
            <Text as="p" mb="2">
              <strong>End:</strong>{" "}
              {selectedEvent?.end && format(new Date(selectedEvent.end), "PPp")}
            </Text>
            {selectedEvent?.location && (
              <Text as="p" mb="2">
                <strong>Location:</strong> {selectedEvent.location}
              </Text>
            )}
          </Box>
          <Flex gap="2" mt="4">
            <Button
              variant="soft"
              onClick={() => {
                setShowEventDialog(false);
                navigate(`/teacher/calendar/${selectedEvent?._id}/edit`);
              }}
            >
              <Pencil1Icon /> Edit
            </Button>
            <Button
              variant="soft"
              color="red"
              onClick={() => {
                setShowEventDialog(false);
                setShowDeleteDialog(true);
              }}
            >
              <TrashIcon /> Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Event</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={handleDeleteEvent}
                disabled={deleteEventMutation.isPending}
              >
                {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};

export default TeacherCalendar;
