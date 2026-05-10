import axiosClient from "@/services/axiosClient";
import type { Story } from "./storyApi";

export interface Bookmark {
  id: string;
  userId: string;
  storyId: string;
  createdAt: string;
  story: Story;
}

export const bookmarkApi = {
  getBookmarks: (): Promise<{ success: boolean; data: Bookmark[] }> => {
    return axiosClient.get("/bookmarks");
  },

  addBookmark: (data: { storyId: string }): Promise<{ success: boolean; message: string; data: Bookmark }> => {
    return axiosClient.post("/bookmarks", data);
  },

  removeBookmark: (storyId: string): Promise<{ success: boolean; message: string }> => {
    return axiosClient.delete(`/bookmarks/${storyId}`);
  },
};
