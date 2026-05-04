import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Lấy base URL từ biến môi trường (nếu có), hoặc dùng mặc định
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Thời gian timeout (10 giây)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động đính kèm token vào header (Authorization) trước khi gửi API
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý phản hồi và lỗi chung từ server
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về trực tiếp response.data để khi gọi API không cần chấm thêm .data
    // Giúp code gọn hơn: const data = await axiosClient.get('/users'); thay vì const res = ... res.data
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Xử lý lỗi 401 Unauthorized (Chưa đăng nhập hoặc Token hết hạn)
      if (error.response.status === 401) {
        console.warn("Phiên đăng nhập hết hạn hoặc chưa xác thực. Đang chuyển hướng...");
        // Xóa token cũ
        localStorage.removeItem('token');
        
        // Điều hướng người dùng về trang đăng nhập nếu đang không ở trang đăng nhập/đăng ký
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    // Ném lỗi để component có thể catch(err) và hiển thị thông báo
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
