import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { submissionService } from "../services/submissionService";
import {
  CreateSubmissionData,
  UpdateSubmissionData,
  GradeSubmissionData,
  RequestResubmissionData,
} from "../types";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
  success: boolean;
}

export const useSubmissionMutation = () => {
  const queryClient = useQueryClient();

  const createSubmission = useMutation({
    mutationFn: (data: CreateSubmissionData) =>
      submissionService.createSubmission(data),
    onSuccess: (response, variables) => {
      toast.success("Submission created successfully");
      queryClient.invalidateQueries({
        queryKey: ["submissions", { assignment: variables.assignment }],
      });
      queryClient.invalidateQueries({
        queryKey: ["submissions", "student"],
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create submission";
      toast.error(errorMessage);
      console.error("Submission error:", error);
    },
  });

  const updateSubmission = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubmissionData }) =>
      submissionService.updateSubmission(id, data),
    onSuccess: (response) => {
      toast.success("Submission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", response._id] });
      queryClient.invalidateQueries({ queryKey: ["submissions", "student"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update submission";
      toast.error(errorMessage);
      console.error("Update error:", error);
    },
  });

  const gradeSubmission = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GradeSubmissionData }) =>
      submissionService.gradeSubmission(id, data),
    onSuccess: (response) => {
      toast.success("Submission graded successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", response._id] });
      queryClient.invalidateQueries({ queryKey: ["submissions", "teacher"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to grade submission";
      toast.error(errorMessage);
      console.error("Grading error:", error);
    },
  });

  const requestResubmission = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RequestResubmissionData }) =>
      submissionService.requestResubmission(id, data),
    onSuccess: (response) => {
      toast.success("Resubmission requested successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submission", response._id] });
      queryClient.invalidateQueries({ queryKey: ["submissions", "teacher"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to request resubmission";
      toast.error(errorMessage);
      console.error("Resubmission request error:", error);
    },
  });

  const checkPlagiarism = useMutation({
    mutationFn: (id: string) => submissionService.checkPlagiarism(id),
    onSuccess: (response) => {
      toast.success("Plagiarism check completed");
      queryClient.invalidateQueries({ queryKey: ["submission", response._id] });
      queryClient.invalidateQueries({ queryKey: ["submissions", "teacher"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to check plagiarism";
      toast.error(errorMessage);
      console.error("Plagiarism check error:", error);
    },
  });

  return {
    createSubmission,
    updateSubmission,
    gradeSubmission,
    requestResubmission,
    checkPlagiarism,
  };
};
