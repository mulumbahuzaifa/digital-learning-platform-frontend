import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { liveSessionService } from "../services/liveSessionService";
import {
  CreateLiveSessionData,
  UpdateLiveSessionData,
  AddChatMessageData,
} from "../types";

export const useLiveSessionMutation = () => {
  const queryClient = useQueryClient();

  const createLiveSession = useMutation({
    mutationFn: (data: CreateLiveSessionData) =>
      liveSessionService.createLiveSession(data),
    onSuccess: (response) => {
      toast.success("Live session created successfully");
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      if (response?._id) {
        queryClient.invalidateQueries({
          queryKey: ["live-session", response._id],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create live session");
    },
  });

  const updateLiveSession = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLiveSessionData }) =>
      liveSessionService.updateLiveSession(id, data),
    onSuccess: (_, variables) => {
      toast.success("Live session updated successfully");
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["live-session", variables.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update live session");
    },
  });

  const deleteLiveSession = useMutation({
    mutationFn: (id: string) => liveSessionService.deleteLiveSession(id),
    onSuccess: (_, id) => {
      toast.success("Live session deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete live session");
    },
  });

  const joinLiveSession = useMutation({
    mutationFn: (id: string) => liveSessionService.joinLiveSession(id),
    onSuccess: (_, id) => {
      toast.success("Joined live session successfully");
      queryClient.invalidateQueries({ queryKey: ["live-session", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join live session");
    },
  });

  const leaveLiveSession = useMutation({
    mutationFn: (id: string) => liveSessionService.leaveLiveSession(id),
    onSuccess: (_, id) => {
      toast.success("Left live session");
      queryClient.invalidateQueries({ queryKey: ["live-session", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to leave live session");
    },
  });

  const startLiveSession = useMutation({
    mutationFn: (id: string) => liveSessionService.startLiveSession(id),
    onSuccess: (_, id) => {
      toast.success("Live session started successfully");
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start live session");
    },
  });

  const endLiveSession = useMutation({
    mutationFn: (id: string) => liveSessionService.endLiveSession(id),
    onSuccess: (_, id) => {
      toast.success("Live session ended successfully");
      queryClient.invalidateQueries({ queryKey: ["live-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["live-session", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to end live session");
    },
  });

  const addChatMessage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddChatMessageData }) =>
      liveSessionService.addChatMessage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["live-session", variables.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  return {
    createLiveSession,
    updateLiveSession,
    deleteLiveSession,
    joinLiveSession,
    leaveLiveSession,
    startLiveSession,
    endLiveSession,
    addChatMessage,
  };
};
