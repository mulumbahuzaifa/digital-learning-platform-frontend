import api from "./api";
import {
  LiveSession,
  CreateLiveSessionData,
  UpdateLiveSessionData,
  LiveSessionFilterParams,
  AddChatMessageData,
} from "../types";

class LiveSessionService {
  async getAllLiveSessions(
    params?: LiveSessionFilterParams
  ): Promise<LiveSession[]> {
    const response = await api.get("/live-sessions", { params });
    return response.data.data;
  }

  async getLiveSessionById(id: string): Promise<LiveSession> {
    const response = await api.get(`/live-sessions/${id}`);
    return response.data.data;
  }

  async createLiveSession(data: CreateLiveSessionData): Promise<LiveSession> {
    const response = await api.post("/live-sessions", data);
    return response.data.data;
  }

  async updateLiveSession(
    id: string,
    data: UpdateLiveSessionData
  ): Promise<LiveSession> {
    const response = await api.put(`/live-sessions/${id}`, data);
    return response.data.data;
  }

  async deleteLiveSession(id: string): Promise<void> {
    await api.delete(`/live-sessions/${id}`);
  }

  async joinLiveSession(id: string): Promise<LiveSession> {
    const response = await api.post(`/live-sessions/${id}/join`);
    return response.data.data;
  }

  async leaveLiveSession(id: string): Promise<LiveSession> {
    const response = await api.post(`/live-sessions/${id}/leave`);
    return response.data.data;
  }

  async startLiveSession(id: string): Promise<LiveSession> {
    const response = await api.post(`/live-sessions/${id}/start`);
    return response.data.data;
  }

  async endLiveSession(id: string): Promise<LiveSession> {
    const response = await api.post(`/live-sessions/${id}/end`);
    return response.data.data;
  }

  async addChatMessage(
    id: string,
    data: AddChatMessageData
  ): Promise<LiveSession> {
    const response = await api.post(`/live-sessions/${id}/chat`, data);
    return response.data.data;
  }
}

export const liveSessionService = new LiveSessionService();
