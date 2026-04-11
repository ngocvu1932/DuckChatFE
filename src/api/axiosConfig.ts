import axios from 'axios';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 phút
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${accessToken ?? ''}`,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('accessToken');
    config.headers.Authorization = `Bearer ${accessToken ?? ''}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // xử lý response trước khi trả về
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Xử lý lỗi toàn cục
    if (error.response.status === 400) {
      return error.response.data;
    }

    // Nếu lỗi 401 và không phải là request để làm mới token
    if (error.response.status === 401 && !originalRequest._retry) {
      const config = localStorage.getItem('appConfig');
      const appConfig = config ? JSON.parse(config) : {};

      if (!appConfig.rememberMe) {
        return;
      }

      originalRequest._retry = true; // Đánh dấu để không lặp lại việc làm mới token
      try {
        const refreshToken = Cookies.get('refreshToken');
        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken: refreshToken,
        });
        const newAccessToken = refreshResponse.data.data.accessToken;
        Cookies.set('accessToken', newAccessToken); // Cập nhật accessToken mới vào cookie
        // Cập nhật header Authorization với accessToken mới
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // Thực hiện lại request ban đầu với accessToken mới
        return axiosInstance(originalRequest);
      } catch (err) {
        // Nếu làm mới token thất bại, điều hướng về trang login hoặc xử lý phù hợp
        console.error('Làm mới token thất bại:', err);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    }

    return Promise.reject(error); // Trả về lỗi nếu không phải lỗi 401 hoặc đã xử lý hết
  }
);

export default axiosInstance;
