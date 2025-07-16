import api from "./api";
import {
  Assignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentFilterParams,
  Submission,
  CreateSubmissionData,
} from "../types";

export const assignmentService = {
  // Get all assignments (for teachers/admins)
  async getAllAssignments(
    params?: AssignmentFilterParams
  ): Promise<Assignment[]> {
    const response = await api.get("/assignments", { params });
    return response.data.data;
  },

  // Get assignments for a student
  async getStudentAssignments(): Promise<Assignment[]> {
    const response = await api.get("/assignments/student");
    return response.data.data;
  },

  // Get assignments for a teacher
  async getTeacherAssignments(): Promise<Assignment[]> {
    const response = await api.get("/assignments/teacher");
    return response.data.data;
  },

  // Get assignment by ID
  async getAssignmentById(id: string): Promise<Assignment> {
    const response = await api.get(`/assignments/${id}`);
    return response.data.data;
  },

  // Create assignment
  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    const response = await api.post("/assignments", data); // No FormData
    return response.data.data;
  },
  // async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
  //   const formData = new FormData();

  //   // Append basic fields
  //   Object.entries(data).forEach(([key, value]) => {
  //     if (key === "attachments") {
  //       // Handle attachments separately
  //       return;
  //     }
  //     if (value !== undefined) {
  //       if (typeof value === "object") {
  //         formData.append(key, JSON.stringify(value));
  //       } else {
  //         formData.append(key, value.toString());
  //       }
  //     }
  //   });

  //   // Handle attachments if present
  //   if (data.attachments) {
  //     data.attachments.forEach((attachment, index) => {
  //       if (attachment.type === "file" && attachment.path) {
  //         formData.append(`attachments[${index}]`, attachment.path);
  //       } else if (attachment.type === "link") {
  //         formData.append(`attachments[${index}]`, JSON.stringify(attachment));
  //       }
  //     });
  //   }

  //   const response = await api.post("/assignments", formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   });
  //   return response.data.data;
  // },

  // Update assignment
  async updateAssignment(
    id: string,
    data: UpdateAssignmentData
  ): Promise<Assignment> {
    // Send as JSON, not FormData
    const response = await api.put(`/assignments/${id}`, data);
    return response.data.data;
  },

  // Publish assignment
  async publishAssignment(id: string, data: UpdateAssignmentData): Promise<Assignment> {
    // const response = await api.put(`/assignments/${id}/publish`);
    const response = await api.put(`/assignments/${id}`, data);
    return response.data.data;
  },

  // Delete assignment
  async deleteAssignment(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },

  // Get all submissions for an assignment (teacher/admin view)
  async getAssignmentSubmissions(assignmentId: string): Promise<{
    assignment: Assignment;
    submissions: Submission[];
  }> {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data.data;
  },

  // Get a student's submission for an assignment
  async getMySubmission(assignmentId: string): Promise<Submission> {
    const response = await api.get(
      `/assignments/${assignmentId}/submissions/me`
    );
    return response.data.data;
  },

  // Submit an assignment
  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    const formData = new FormData();
    formData.append("assignment", data.assignment);
    formData.append("textSubmission", data.textSubmission);
    formData.append("submissionType", data.submissionType);
    formData.append("submissionMethod", data.submissionMethod || "online");

    if (data.submissionNotes) {
      formData.append("submissionNotes", data.submissionNotes);
    }

    if (data.studentComments) {
      formData.append("studentComments", data.studentComments);
    }

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.post(
      `/assignments/${data.assignment}/submissions`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Grade a submission (teacher/admin only)
  async gradeSubmission(
    submissionId: string,
    data: { grade: number; feedback: string }
  ): Promise<Submission> {
    const response = await api.put(`/submissions/${submissionId}/grade`, data);
    return response.data.data;
  },

  // Download a submission file
  async downloadSubmissionFile(
    submissionId: string,
    fileId: string
  ): Promise<Blob> {
    const response = await api.get(
      `/submissions/${submissionId}/download/${fileId}`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
