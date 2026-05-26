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
