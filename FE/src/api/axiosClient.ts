import axios from 'axios';
import type { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Get base URL from environment variable (if available), or use default
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout duration (10 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach token to header (Authorization) before sending API request
axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle responses and common server errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return response.data directly so we don't need to access .data when calling API
    // Cleaner code: const data = await axiosClient.get('/users'); instead of const res = ... res.data
    if (response && response.data !== undefined) {
      return response.data;
    }
    return null;
  },
  async (error) => {
    const originalRequest = error.config as any;

    // Login/Register/Logout: a 401 here means bad credentials, NOT an expired token.
    // Skip the refresh-token flow so the real error message propagates to the form.
    const isAuthEndpoint = typeof originalRequest?.url === 'string' && originalRequest.url.includes('/auth/');

    if (error.response) {
      // Handle 401 Unauthorized (Token expired)
      if (error.response.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;

        try {
          // Call API to refresh token
          const res = await axios.post(`${BASE_URL}/refresh`, {}, { withCredentials: true });
          const newAccessToken = res.data.accessToken || res.data.token;

          if (!newAccessToken) {
            throw new Error('No valid token received on refresh');
          }

          // Save new token
          Cookies.set('token', newAccessToken, { expires: 7 });
          
          // Update default headers and original request headers
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return axiosClient(originalRequest);
        } catch (refreshError) {
          console.warn("Session expired or refresh failed. Redirecting to login...");
          // Remove old token
          Cookies.remove('token');
          
          // Redirect user to login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    // Throw error so component can catch(err) and display error message
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
