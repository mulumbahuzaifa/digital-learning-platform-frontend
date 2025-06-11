import api from "./api";
import {
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData,
  CalendarEventFilterParams,
  UpdateAttendanceData,
} from "../types";

export const calendarService = {
  async getEvents(
    params?: CalendarEventFilterParams
  ): Promise<CalendarEvent[]> {
    const response = await api.get("/calendar", { params });
    return response.data.data;
  },

  async getEventById(id: string): Promise<CalendarEvent> {
    const response = await api.get(`/calendar/${id}`);
    return response.data.data;
  },

  async createEvent(data: CreateCalendarEventData): Promise<CalendarEvent> {
    const response = await api.post("/calendar", data);
    return response.data.data;
  },

  async updateEvent(
    id: string,
    data: UpdateCalendarEventData
  ): Promise<CalendarEvent> {
    const response = await api.put(`/calendar/${id}`, data);
    return response.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/calendar/${id}`);
  },

  async updateAttendanceStatus(
    id: string,
    status: string
  ): Promise<CalendarEvent> {
    const response = await api.put(`/calendar/${id}/attendance`, { status });
    return response.data.data;
  },
};
