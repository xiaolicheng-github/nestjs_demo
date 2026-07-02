import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.tsx'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ai-prompt',
      name: 'ai-prompt',
      component: () => import('@/views/AiPromptGenerator.tsx'),
      meta: {
        requiresAuth: true,
        label: 'AI 提示词生成器',
        icon: '🤖',
        desc: '填写条件，自动组装高效 Prompt',
      },
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/views/BlogView.tsx'),
      meta: {
        requiresAuth: true,
        label: '个人博客',
        icon: '🌙',
        desc: '在月光下记录你的思绪与故事',
      },
    },
    {
      path: '/blog/edit',
      name: 'blog-edit',
      component: () => import('@/components/BlogEditor/index.tsx'),
      meta: { requiresAuth: true },
    },
    {
      path: '/blog/detail',
      name: 'blog-detail',
      component: () => import('@/components/BlogDetail/index.tsx'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      component: () => import('@/views/LoginView.tsx'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      component: () => import('@/views/RegisterView.tsx'),
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      component: () => import('@/views/ForgotPasswordView.tsx'),
      meta: { guestOnly: true },
    },
    {
      path: '/change-password',
      component: () => import('@/views/ChangePasswordView.tsx'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      component: () => import('@/views/ProfileView.tsx'),
      meta: { requiresAuth: true },
    },
  ],
});

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();

  // 需要登录但未登录 → 跳转登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  // 已登录访问登录/注册页 → 跳转首页
  if ((to.meta as any).guestOnly && userStore.isLoggedIn) {
    return next('/');
  }
  next();
});

export default router;
