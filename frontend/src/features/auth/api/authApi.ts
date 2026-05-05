import axiosClient from '@/services/axiosClient';

// Tùy chỉnh Type theo API response của Backend
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      role: string;
    };
  };
}

export const authApi = {
  login: (data: any): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', data);
  },

  register: (data: any): Promise<AuthResponse> => {
    return axiosClient.post('/auth/register', data);
  },
};
