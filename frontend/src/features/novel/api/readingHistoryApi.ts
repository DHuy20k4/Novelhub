import axiosClient from "@/services/axiosClient";

export interface ReadingHistoryItem {
  id: string;
  userId: string;
  storyId: string;
  updatedAt: string;
  createdAt: string;
  story: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    chapterCount: number;
    uploader: { displayName: string };
  };
  chapter: {
    id: string;
    title: string;
    chapterIndex: number;
  };
}

export const readingHistoryApi = {
  getHistory: (): Promise<{ success: boolean; data: ReadingHistoryItem[] }> =>
    axiosClient.get("/history"),

  deleteItem: (storyId: string): Promise<{ success: boolean; message: string }> =>
    axiosClient.delete(`/history/${storyId}`),

  clearAll: (): Promise<{ success: boolean; message: string }> =>
    axiosClient.delete("/history/clear"),
};
