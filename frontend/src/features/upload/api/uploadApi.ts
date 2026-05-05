import axiosClient from "@/services/axiosClient";

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ success: boolean; url: string; message?: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    // Backend endpoint is likely /upload or /upload/image
    return axiosClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
