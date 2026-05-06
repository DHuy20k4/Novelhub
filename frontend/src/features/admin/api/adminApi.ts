import axiosClient from "@/services/axiosClient";
import type { Category } from "@/features/category/api/categoryApi";

export interface AdminStats {
  users: number;
  stories: number;
  chapters: number;
  categories: number;
}

export interface UserAdminView {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  _count: {
    stories: number;
    comments: number;
    reviews: number;
  };
}

export const adminApi = {
  getStats: (): Promise<{ success: boolean; data: AdminStats }> => {
    return axiosClient.get("/admin/stats");
  },

  getAllUsers: (params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data: UserAdminView[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    return axiosClient.get("/admin/users", { params });
  },

  createCategory: (data: { name: string; slug: string }): Promise<{ success: boolean; data: Category }> => {
    return axiosClient.post("/categories", data);
  },

  updateCategory: (id: string, data: { name?: string; slug?: string }): Promise<{ success: boolean; data: Category }> => {
    return axiosClient.put(`/categories/${id}`, data);
  },

  deleteCategory: (id: string): Promise<{ success: boolean; message: string }> => {
    return axiosClient.delete(`/categories/${id}`);
  },
};
