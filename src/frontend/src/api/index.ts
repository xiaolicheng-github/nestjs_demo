import axios from 'axios';

/** 创建 axios 实例 */
const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

/** 请求拦截器 - 自动携带 Token */
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 不需要 401 强制跳转的接口白名单 */
const AUTH_EXEMPT_URLS = ['/auth/login', '/auth/register', '/auth/send-code', '/auth/change-password'];

/** 响应拦截器 - 统一错误处理 */
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || error.message;
    // 仅对非登录/注册类接口的 401/403 执行踢回登录页
    const isAuthUrl = AUTH_EXEMPT_URLS.some((url) =>
      error.config?.url?.includes(url),
    );
    if (!isAuthUrl && [401, 403].includes(error.response?.status)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(msg));
  },
);

export default request;
