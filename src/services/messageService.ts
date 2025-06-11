import {
  Message,
  CreateMessageData,
  UpdateMessageData,
  MessageFilterParams,
} from "../types";
import api from "./api";

export const messageService = {
  getMessages: async (params?: MessageFilterParams): Promise<Message[]> => {
    const { data } = await api.get("/messages", { params });
    return data.data;
  },

  getMessage: async (id: string): Promise<Message> => {
    const { data } = await api.get(`/messages/${id}`);
    return data.data;
  },

  createMessage: async (messageData: CreateMessageData): Promise<Message> => {
    const { data } = await api.post("/messages", messageData);
    return data.data;
  },

  updateMessage: async (
    id: string,
    messageData: UpdateMessageData
  ): Promise<Message> => {
    const { data } = await api.put(`/messages/${id}`, messageData);
    return data.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },
};
