import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { assignmentService } from '../services/assignmentService';
import { 
  CreateAssignmentData, 
  UpdateAssignmentData,
  CreateSubmissionData,
  UpdateSubmissionData,
  GradeSubmissionData
} from '../types';

export const useAssignmentMutation = () => {
  const queryClient = useQueryClient();

  const createAssignment = useMutation({
    mutationFn: (data: CreateAssignmentData) => assignmentService.createAssignment(data),
    onSuccess: (response) => {
      toast.success('Assignment created successfully');
      
      // Invalidate both general and teacher-specific assignment queries
      // This ensures that the teacher assignments table is refreshed when redirected back
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      
      if (response?._id) {
        queryClient.invalidateQueries({ queryKey: ['assignment', response._id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create assignment');
    },
  });

  const updateAssignment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentData }) => 
      assignmentService.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      toast.success('Assignment updated successfully');
      
      // Invalidate both general and teacher-specific assignment queries
      // This ensures that the teacher assignments table is refreshed when redirected back
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update assignment');
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: (id: string) => assignmentService.deleteAssignment(id),
    onSuccess: (_, id) => {
      toast.success('Assignment deleted successfully');
      
      // Invalidate both general and teacher-specific assignment queries
      // This ensures that the teacher assignments table is refreshed when redirected back
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete assignment');
    },
  });

  const publishAssignment = useMutation({
    mutationFn: (id: string) => assignmentService.publishAssignment(id),
    onSuccess: (_, id) => {
      toast.success('Assignment published successfully');
      
      // Invalidate both general and teacher-specific assignment queries
      // This ensures that the teacher assignments table is refreshed when redirected back
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish assignment');
    },
  });

  const createSubmission = useMutation({
    mutationFn: (data: CreateSubmissionData) => assignmentService.createSubmission(data),
    onSuccess: (response, variables) => {
      toast.success('Submission created successfully');
      queryClient.invalidateQueries({ queryKey: ['submissions', { assignment: variables.assignment }] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create submission');
    },
  });

  const updateSubmission = useMutation({
    mutationFn: ({ 
      submissionId, 
      data 
    }: { 
      submissionId: string;
      data: UpdateSubmissionData 
    }) => assignmentService.updateSubmission(submissionId, data),
    onSuccess: (response) => {
      toast.success('Submission updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['submissions']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['submission', response._id]
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update submission');
    },
  });

  const gradeSubmission = useMutation({
    mutationFn: ({ 
      submissionId, 
      data 
    }: { 
      submissionId: string;
      data: GradeSubmissionData 
    }) => assignmentService.gradeSubmission(submissionId, data),
    onSuccess: (response) => {
      toast.success('Submission graded successfully');
      
      // Invalidate submission-specific queries
      queryClient.invalidateQueries({ 
        queryKey: ['submission', response._id]
      });
      
      // Invalidate general submissions queries
      queryClient.invalidateQueries({ 
        queryKey: ['submissions']
      });
      
      // If we know the assignment ID, invalidate that specific list
      if (typeof response.assignment === 'string') {
        queryClient.invalidateQueries({ 
          queryKey: ['submissions', { assignment: response.assignment }] 
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to grade submission');
    },
  });

  return {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
    createSubmission,
    updateSubmission,
    gradeSubmission,
  };
}; 