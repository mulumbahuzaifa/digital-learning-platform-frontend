import api from "./api";
import {
  Submission,
  CreateSubmissionData,
  UpdateSubmissionData,
  GradeSubmissionData,
  RequestResubmissionData,
  SubmissionFilterParams,
} from "../types";

export const submissionService = {
  // Get all submissions (for teachers/admins)
  async getAllSubmissions(
    params?: SubmissionFilterParams
  ): Promise<Submission[]> {
    const response = await api.get("/submissions", { params });
    return response.data.data;
  },

  // Get submissions for a student
  async getStudentSubmissions(): Promise<Submission[]> {
    const response = await api.get("/submissions/student");
    return response.data.data;
  },

  // Get submissions for a teacher
  async getTeacherSubmissions(): Promise<Submission[]> {
    const response = await api.get("/submissions/teacher");
    return response.data.data;
  },

  // Get submission by ID
  async getSubmissionById(id: string): Promise<Submission> {
    const response = await api.get(`/submissions/${id}`);
    return response.data.data;
  },

  // Create submission
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

    const response = await api.post("/submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Update submission
  async updateSubmission(
    id: string,
    data: UpdateSubmissionData
  ): Promise<Submission> {
    const formData = new FormData();

    if (data.textSubmission) {
      formData.append("textSubmission", data.textSubmission);
    }

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.put(`/submissions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Grade submission
  async gradeSubmission(
    id: string,
    data: GradeSubmissionData
  ): Promise<Submission> {
    const response = await api.put(`/submissions/${id}/grade`, data);
    return response.data.data;
  },

  // Request resubmission
  async requestResubmission(
    id: string,
    data: RequestResubmissionData
  ): Promise<Submission> {
    const response = await api.put(
      `/submissions/${id}/request-resubmission`,
      data
    );
    return response.data.data;
  },

  // Check plagiarism
  async checkPlagiarism(id: string): Promise<Submission> {
    const response = await api.post(`/submissions/${id}/check-plagiarism`);
    return response.data.data;
  },

  // Get submission statistics
  async getSubmissionStats(): Promise<{
    total: number;
    graded: number;
    pending: number;
    late: number;
  }> {
    const response = await api.get("/submissions/stats");
    return response.data.data;
  },

  // Download submission file
  async downloadSubmissionFile(
    submissionId: string,
    fileId: string
  ): Promise<Blob> {
    const response = await api.get(
      `/submissions/${submissionId}/download/${fileId}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
