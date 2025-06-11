import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { subjectService } from "../services/subjectService";
import {
  CreateSubjectData,
  UpdateSubjectData,
  SubjectFilterParams,
} from "../types";
import { useAuth } from "../context/AuthProvider";

// Query hooks
export const useSubjects = (params?: SubjectFilterParams) => {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => subjectService.getAllSubjects(params),
  });
};

export const useSubject = (id: string) => {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubjectById(id),
    enabled: Boolean(id),
  });
};

export const useSubjectClasses = (id: string) => {
  return useQuery({
    queryKey: ["subjectClasses", id],
    queryFn: () => subjectService.getSubjectClasses(id),
    enabled: Boolean(id),
  });
};

export const useSubjectTeachers = (id: string) => {
  return useQuery({
    queryKey: ["subjectTeachers", id],
    queryFn: () => subjectService.getSubjectTeachers(id),
    enabled: Boolean(id),
  });
};

export const useSubjectStudents = (id: string) => {
  return useQuery({
    queryKey: ["subjectStudents", id],
    queryFn: () => subjectService.getSubjectStudents(id),
    enabled: Boolean(id),
  });
};

// Mutation hook
export const useSubjectMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createSubject = useMutation({
    mutationFn: (data: CreateSubjectData) => subjectService.createSubject(data),
    onSuccess: () => {
      toast.success("Subject created successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create subject");
    },
  });

  const updateSubject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectData }) =>
      subjectService.updateSubject(id, data),
    onSuccess: (_, variables) => {
      toast.success("Subject updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", variables.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subject");
    },
  });

  const deleteSubject = useMutation({
    mutationFn: (id: string) => subjectService.deleteSubject(id),
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete subject");
    },
  });

  // Check if user has admin role for mutations
  const isAdmin = user?.role === "admin";

  return {
    createSubject: isAdmin ? createSubject : undefined,
    updateSubject: isAdmin ? updateSubject : undefined,
    deleteSubject: isAdmin ? deleteSubject : undefined,
    isAdmin,
  };
};
