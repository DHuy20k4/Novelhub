import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc Zustand store) nếu có
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      // API của Backend luôn trả về { success, message, data } theo như controller đã xem
      // Tùy theo nhu cầu, có thể chỉ return response.data ở đây để code gọi API gọn hơn
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi toàn cục (ví dụ: Hết hạn token -> đăng xuất)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Token hết hạn hoặc không hợp lệ.');
      localStorage.removeItem('access_token');
      // Tùy chọn: Dùng react-router để redirect về trang /login ở đây
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
