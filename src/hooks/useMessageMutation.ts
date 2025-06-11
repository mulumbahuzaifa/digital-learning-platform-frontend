import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "../services/messageService";
import { CreateMessageData, UpdateMessageData } from "../types";
import { toast } from "react-hot-toast";

export const useMessageMutation = () => {
  const queryClient = useQueryClient();

  const createMessage = useMutation({
    mutationFn: (data: CreateMessageData) => messageService.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const updateMessage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageData }) =>
      messageService.updateMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update message");
    },
  });

  const deleteMessage = useMutation({
    mutationFn: (id: string) => messageService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });

  return {
    createMessage,
    updateMessage,
    deleteMessage,
  };
};
