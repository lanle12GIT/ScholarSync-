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

// Group all Authentication and User-related APIs
export const authApi = {
  /**
   * Login user
   * @param data Data including email and password
   */
  login(data: LoginPayload) {
    return axiosClient.post('/auth/login', data);
  },

  /**
   * Register a new account
   * @param data Data including username, email, password
   */
  register(data: RegisterPayload) {
    return axiosClient.post('/auth/register', data);
  },
 
  /**
   * Logout (if backend requires API call to invalidate token/session)
   */
  logout() {
    return axiosClient.post('/auth/logout');
  }
};
