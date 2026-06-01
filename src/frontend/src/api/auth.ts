import request from './index';

/** 发送验证码 */
export const sendCodeApi = (email: string) =>
  request.post('/auth/send-code', { email });

/** 注册 */
export const registerApi = (data: {
  email: string;
  code: string;
  name: string;
  password: string;
}) => request.post('/auth/register', data);

/** 登录 */
export const loginApi = (data: { email: string; password: string }) =>
  request.post('/auth/login', data);

/** 获取用户信息 */
export const getProfileApi = () => request.get('/auth/profile');

/** 修改密码 */
export const changePasswordApi = (data: {
  oldPassword: string;
  newPassword: string;
}) => request.post('/auth/change-password', data);

/** 发送重置密码验证码 */
export const forgotPasswordApi = (data: { email: string }) =>
  request.post('/auth/forgot-password', data);

/** 验证验证码并重置密码 */
export const resetPasswordApi = (data: {
  email: string;
  code: string;
  password: string;
}) => request.post('/auth/reset-password', data);

/** 获取用户完整信息（含 profile） */
export const getFullProfileApi = () => request.get('/auth/profile');

/** 更新个人资料 */
export const updateProfileApi = (data: {
  name?: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
}) => request.put('/auth/profile', data);
