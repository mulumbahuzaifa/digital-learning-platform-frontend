import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "../services/assignmentService";
import { CreateAssignmentData, UpdateAssignmentData } from "../types";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentData) =>
      assignmentService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment created successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to create assignment");
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentData }) =>
      assignmentService.updateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", id] });
      toast.success("Assignment updated successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to update assignment");
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment deleted successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to delete assignment");
    },
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      assignment: string;
      textSubmission: string;
      submissionType: "text" | "file" | "both";
      submissionMethod?: "online" | "offline";
      submissionNotes?: string;
      studentComments?: string;
      attachments?: File[];
    }) => assignmentService.createSubmission(data),
    onSuccess: (_, { assignment }) => {
      queryClient.invalidateQueries({
        queryKey: ["assignment", assignment, "submissions"],
      });
      toast.success("Assignment submitted successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to submit assignment");
    },
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: { grade: number; feedback: string };
    }) => assignmentService.gradeSubmission(submissionId, data),
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["submission", submissionId],
      });
      toast.success("Submission graded successfully");
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to grade submission");
    },
  });
};
