import api from "./api";
import {
  Content,
  ContentFilterParams,
  CreateContentData,
  UpdateContentData,
} from "../types";

export const contentService = {
  // Get all content with optional filters
  getAllContent: async (filters?: ContentFilterParams): Promise<Content[]> => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.class) params.append("class", filters.class);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.type) params.append("type", filters.type);
      if (filters.isPublic !== undefined)
        params.append("isPublic", String(filters.isPublic));
      if (filters.accessLevel)
        params.append("accessLevel", filters.accessLevel);
      if (filters.search) params.append("search", filters.search);
    }

    const queryString = params.toString();
    const response = await api.get(
      `/content${queryString ? `?${queryString}` : ""}`
    );
    return response.data.data;
  },

  // Get content created by the current user (teacher)
  getMyContent: async (filters?: ContentFilterParams): Promise<Content[]> => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.class) params.append("class", filters.class);
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.type) params.append("type", filters.type);
      if (filters.isPublic !== undefined)
        params.append("isPublic", String(filters.isPublic));
      if (filters.accessLevel)
        params.append("accessLevel", filters.accessLevel);
      if (filters.search) params.append("search", filters.search);
    }

    const queryString = params.toString();
    const response = await api.get(
      `/content/my-content${queryString ? `?${queryString}` : ""}`
    );
    return response.data.data;
  },

  // Get content by ID
  getContentById: async (id: string): Promise<Content> => {
    const response = await api.get(`/content/${id}`);
    return response.data.data;
  },

  // Create new content (handles file upload)
  createContent: async (data: CreateContentData): Promise<Content> => {
    const formData = new FormData();

    // Add text fields
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("class", data.class);
    formData.append("subject", data.subject);

    if (data.description) formData.append("description", data.description);
    if (data.tags && data.tags.length > 0)
      formData.append("tags", data.tags.join(","));
    if (data.isPublic !== undefined)
      formData.append("isPublic", String(data.isPublic));
    if (data.accessLevel) formData.append("accessLevel", data.accessLevel);

    // Add file if available
    if (data.file) formData.append("file", data.file);

    const response = await api.post("/content", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  // Update content
  updateContent: async (
    id: string,
    data: UpdateContentData
  ): Promise<Content> => {
    const response = await api.put(`/content/${id}`, data);
    return response.data.data;
  },

  // Delete content
  deleteContent: async (id: string): Promise<void> => {
    await api.delete(`/content/${id}`);
  },

  // Get download URL (returns URL to redirect to)
  getDownloadUrl: (id: string): string => {
    return `${api.defaults.baseURL}/content/${id}/download`;
  },

  // Download content directly with authentication
  downloadContent: async (id: string): Promise<Blob> => {
    const response = await api.get(`/content/${id}/download`, {
      responseType: "blob",
      headers: {
        // Authentication is automatically handled by the api instance
      },
    });
    return response.data;
  },
};
