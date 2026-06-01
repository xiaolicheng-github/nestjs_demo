import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginApi, getFullProfileApi } from '@/api/auth';

interface UserProfile {
  nickname?: string;
  bio?: string;
  avatar?: string;
}

interface UserInfo {
  id: number;
  email: string;
  name: string;
  profile?: UserProfile;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  );

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value);

  /** 登录 */
  async function login(email: string, password: string) {
    const res: any = await loginApi({ email, password });
    token.value = res.access_token;
    user.value = res.user;
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  /** 登出 */
  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /** 刷新用户信息 */
  async function refreshUserInfo() {
    try {
      const res: any = await getFullProfileApi();
      user.value = res;
      localStorage.setItem('user', JSON.stringify(res));
    } catch {
      logout();
    }
  }

  return { token, user, isLoggedIn, login, logout, refreshUserInfo };
});
