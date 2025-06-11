import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { classService } from "../services/classService";
import {
  CreateClassData,
  UpdateClassData,
  AddSubjectToClassData,
  AssignTeacherToSubjectData,
  AssignPrefectData,
} from "../types";

export const useClassMutation = () => {
  const queryClient = useQueryClient();

  const createClass = useMutation({
    mutationFn: (data: CreateClassData) => classService.createClass(data),
    onSuccess: (response) => {
      toast.success("Class created successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      if (response?._id) {
        queryClient.invalidateQueries({ queryKey: ["class", response._id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create class");
    },
  });

  const updateClass = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassData }) =>
      classService.updateClass(id, data),
    onSuccess: (_, variables) => {
      toast.success("Class updated successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update class");
    },
  });

  const deleteClass = useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onSuccess: (_, id) => {
      toast.success("Class deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete class");
    },
  });

  const addSubject = useMutation({
    mutationFn: ({
      classId,
      data,
    }: {
      classId: string;
      data: AddSubjectToClassData;
    }) => classService.addSubjectToClass(classId, data),
    onSuccess: (_, variables) => {
      toast.success("Subject added to class successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.classId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add subject to class");
    },
  });

  const assignTeacher = useMutation({
    mutationFn: ({
      classId,
      subjectId,
      data,
    }: {
      classId: string;
      subjectId: string;
      data: AssignTeacherToSubjectData;
    }) => classService.assignTeacherToSubject(classId, subjectId, data),
    onSuccess: (_, variables) => {
      toast.success("Teacher assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.classId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign teacher");
    },
  });

  const assignPrefect = useMutation({
    mutationFn: ({
      classId,
      data,
    }: {
      classId: string;
      data: AssignPrefectData;
    }) => classService.assignPrefect(classId, data),
    onSuccess: (_, variables) => {
      toast.success("Prefect assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.classId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign prefect");
    },
  });

  return {
    createClass,
    updateClass,
    deleteClass,
    addSubject,
    assignTeacher,
    assignPrefect,
  };
};
