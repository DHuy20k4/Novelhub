import axiosClient from "@/services/axiosClient";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const categoryApi = {
  getAllCategories: (): Promise<{ success: boolean; data: Category[] }> => {
    return axiosClient.get("/categories");
  },
};
