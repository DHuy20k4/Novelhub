import axiosClient from "@/services/axiosClient";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    stories: number;
  };
}

export const userApi = {
  getMyProfile: (): Promise<{ success: boolean; data: UserProfile }> => {
    return axiosClient.get("/users/me");
  },

  updateMyProfile: (data: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; data: UserProfile; message: string }> => {
    return axiosClient.patch("/users/me", data);
  },
};
