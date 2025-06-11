import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@radix-ui/themes";
import { calendarService } from "../../../services/calendarService";
import CalendarEventForm from "../../../components/teacher/CalendarEventForm";
import { UpdateCalendarEventData } from "../../../types";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const CalendarEventEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ["calendarEvent", id],
    queryFn: () => calendarService.getEventById(id!),
    enabled: !!id,
  });

  const updateEventMutation = useMutation({
    mutationFn: (data: UpdateCalendarEventData) =>
      calendarService.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      navigate("/teacher/calendar");
    },
  });

  const handleSubmit = async (data: UpdateCalendarEventData) => {
    await updateEventMutation.mutateAsync(data);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <Box p="4">
      <CalendarEventForm
        mode="edit"
        initialData={event}
        onSubmit={handleSubmit}
        isSubmitting={updateEventMutation.isPending}
      />
    </Box>
  );
};

export default CalendarEventEdit;
