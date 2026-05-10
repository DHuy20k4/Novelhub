import axiosClient from "@/services/axiosClient";

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ success: boolean; url: string; message?: string }> => {
    const formData = new FormData();
    formData.append("image", file); // Đã sửa từ 'file' thành 'image' để match với upload.single('image') ở Backend

    const res = await axiosClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }) as { success: boolean; data?: { imageUrl: string }; message?: string };

    return {
      success: res.success,
      url: res.data?.imageUrl, // Map chính xác data.imageUrl từ Backend
      message: res.message
    };
  },
};
