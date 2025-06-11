// src/services/roleService.ts
import { userService } from './userService';
import type { User, UserRole } from '../types';

export const roleService = {
  
    async getAllRoles(): Promise<User[]> {
    // Get all users with their roles
    const users = await userService.getAllUsers();
    return users.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));
  },

//   async updateUserRole(userId: string, role: UserRole): Promise<User> {
//     // Use the existing userService.updateUser endpoint
//     return await userService.updateUser(userId, { role });
//   }
};