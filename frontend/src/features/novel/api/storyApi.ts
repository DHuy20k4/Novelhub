import axiosClient from "@/services/axiosClient";

export interface StoryCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Story {
  id: string;
  uploaderId: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  moderationStatus: string;
  writingStatus: string;
  viewCount: number;
  reviewCount: number;
  averageRating: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
  uploader: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    username?: string;
  };
  // Backend trả về categories đã flatten thành mảng Category trực tiếp
  categories: StoryCategory[];
}

export interface GetStoriesResponse {
  success: boolean;
  message: string;
  data: Story[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const storyApi = {
  getStories: (params: {
    sortBy?: "newest" | "updated" | "topView" | "topRate";
    limit?: number;
    page?: number;
    search?: string;
    categories?: string;
    uploaderId?: string;
    status?: string;
  }): Promise<GetStoriesResponse> => {
    return axiosClient.get("/stories", { params });
  },

  getStoryById: (id: string): Promise<{ success: boolean; data: Story }> => {
    return axiosClient.get(`/stories/${id}`);
  },

  getStoryBySlug: (slug: string): Promise<{ success: boolean; data: Story }> => {
    return axiosClient.get(`/stories/${slug}`);
  },

  createStory: (data: {
    title: string;
    slug: string;
    summary?: string;
    coverUrl?: string;
    categoryIds: string[];
  }): Promise<{ success: boolean; message: string; data: Story }> => {
    return axiosClient.post("/stories", data);
  },

  updateStoryStatus: (id: string, moderationStatus: "approved" | "rejected"): Promise<{ success: boolean; message: string }> => {
    return axiosClient.put(`/stories/${id}`, { moderationStatus });
  },
};
