import axiosClient from './axiosClient';


export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
}

// Gom nhóm các API liên quan đến Xác thực và Người dùng
export const authApi = {
  /**
   * Đăng nhập người dùng
   * @param data Dữ liệu gồm email và password
   */
  login(data: LoginPayload) {
    return axiosClient.post('/auth/login', data);
  },

  /**
   * Đăng ký tài khoản mới
   * @param data Dữ liệu gồm username, email, password
   */
  register(data: RegisterPayload) {
    return axiosClient.post('/auth/register', data);
  },

  /**
   * Lấy thông tin người dùng đang đăng nhập (dựa vào token đã lưu)
   * API đường dẫn có thể là '/users/me' hoặc '/auth/me' tùy backend của bạn cấu hình
   */
  getCurrentUser() {
    return axiosClient.get('/users/me'); 
  },
  
  /**
   * Đăng xuất (nếu backend yêu cầu gọi API để xóa token/session)
   */
  logout() {
    return axiosClient.post('/auth/logout');
  }
};
