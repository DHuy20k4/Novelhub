import axiosClient from "@/services/axiosClient";

export interface Story {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  authorId: string;
  moderationStatus: string;
  writingStatus: string;
  viewCount: number;
  reviewCount: number;
  averageRating: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    displayName: string;
    username: string;
  };
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
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
  }): Promise<GetStoriesResponse> => {
    return axiosClient.get("/stories", { params });
  },

  getStoryById: (id: string): Promise<{ success: boolean; data: Story }> => {
    return axiosClient.get(`/stories/${id}`);
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
};
