import axiosClient from "@/services/axiosClient";

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  chapterIndex: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export const chapterApi = {
  getChaptersByStoryId: (storyId: string): Promise<{ success: boolean; data: Chapter[] }> => {
    return axiosClient.get(`/stories/${storyId}/chapters`);
  },

  getChapterById: (chapterId: string): Promise<{ success: boolean; data: Chapter }> => {
    return axiosClient.get(`/chapters/${chapterId}`);
  },

  createChapter: (storyId: string, data: { title: string; content: string; chapterIndex: number }): Promise<{ success: boolean; data: Chapter; message: string }> => {
    return axiosClient.post(`/stories/${storyId}/chapters`, data);
  },

  updateChapter: (chapterId: string, data: { title?: string; content?: string; chapterIndex?: number }): Promise<{ success: boolean; data: Chapter; message: string }> => {
    return axiosClient.put(`/chapters/${chapterId}`, data);
  },

  deleteChapter: (chapterId: string): Promise<{ success: boolean; message: string }> => {
    return axiosClient.delete(`/chapters/${chapterId}`);
  },
};
