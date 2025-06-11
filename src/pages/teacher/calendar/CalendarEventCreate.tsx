import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@radix-ui/themes";
import { calendarService } from "../../../services/calendarService";
import CalendarEventForm from "../../../components/teacher/CalendarEventForm";
import {
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from "../../../types";

const CalendarEventCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Get initial state from location if available
  const initialStartDate = location.state?.startDate;
  const initialEndDate = location.state?.endDate;
  const initialAllDay = location.state?.allDay;

  const createEventMutation = useMutation({
    mutationFn: (data: CreateCalendarEventData) =>
      calendarService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      navigate("/teacher/calendar");
    },
  });

  const handleSubmit = async (
    data: CreateCalendarEventData | UpdateCalendarEventData
  ) => {
    await createEventMutation.mutateAsync(data as CreateCalendarEventData);
  };

  return (
    <Box p="4">
      <CalendarEventForm
        mode="create"
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
        initialAllDay={initialAllDay}
        onSubmit={handleSubmit}
        isSubmitting={createEventMutation.isPending}
      />
    </Box>
  );
};

export default CalendarEventCreate;
