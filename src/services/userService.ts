// src/services/userService.ts
import api from "./api";
import {
  User,
  UserCreateFormData,
  UserEditFormData,
  GetAllUsersParams,
  UserRole,
} from "../types";
// import { UserFormData } from '../components/admin/UserForm';

export interface GetAllUsersParams {
  role?: UserRole;
  class?: string;
  subject?: string;
  search?: string;
}

export const userService = {
  async getAllUsers(params?: GetAllUsersParams): Promise<User[]> {
    const response = await api.get("/users", { params });
    return response.data.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(userData: UserCreateFormData): Promise<User> {
    const response = await api.post("/users", userData);
    return response.data.data;
  },

  async updateUser(
    id: string,
    userData: Partial<UserEditFormData>
  ): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async updateProfile(id: string, profileData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/profile/${id}`, profileData);
    return response.data.data;
  },

  async getUsersForMessaging(params: GetAllUsersParams): Promise<User[]> {
    const response = await api.get("/messages/users", { params });
    return response.data.data;
  },
};
