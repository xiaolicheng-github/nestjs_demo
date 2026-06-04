import { defineComponent, computed } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import { useUserStore } from '@/stores/user';
import styles from './HomeView.module.scss';

/** 功能菜单项 */
interface MenuItem {
  key: string;
  label: string;
  icon: string;
  desc: string;
}

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    /** 当前激活的菜单 key（从路由路径提取） */
    const activeMenu = computed(() => {
      // 取路由 path 的最后一段作为菜单 key，如 /ai-prompt → ai-prompt
      const segments = route.path.split('/').filter(Boolean);
      return segments[segments.length - 1] || '';
    });

    /** 从路由配置派生菜单列表 */
    const menuList = computed<MenuItem[]>(() => {
      // 获取当前路由的 children 配置
      const record = route.matched[0];
      if (!record?.children) return [];
      return record.children.map((child) => ({
        key: child.path,
        label:
          (child.meta?.label as string) || (child.name as string) || child.path,
        icon: (child.meta?.icon as string) || '📋',
        desc: (child.meta?.desc as string) || '',
      }));
    });

    /** 切换菜单：通过路由导航 */
    function switchMenu(key: string) {
      void router.push(`/${key}`);
    }

    /** 退出登录 */
    function handleLogout() {
      userStore.logout();
      void router.push('/login');
    }

    /** 跳转修改密码 */
    function goChangePassword() {
      void router.push('/change-password');
    }

    /** 跳转个人中心 */
    function goProfile() {
      void router.push('/profile');
    }

    return {
      userStore,
      activeMenu,
      menuList,
      switchMenu,
      handleLogout,
      goChangePassword,
      goProfile,
      styles,
    };
  },
  render() {
    return (
      <div class={styles.homePage}>
        {/* 顶部导航栏 */}
        <header class={styles.navbar}>
          <div class={styles.navBrand}>小月亮观景台</div>
          <div class={styles.navRight}>
            {this.userStore.user?.profile?.avatar ? (
              <img
                class={styles.navAvatar}
                src={this.userStore.user.profile.avatar}
                alt="头像"
                onClick={this.goProfile}
              />
            ) : (
              <span class={styles.userName} onClick={this.goProfile}>
                {this.userStore.user?.name}
              </span>
            )}
            <button class={styles.btnProfile} onClick={this.goProfile}>
              个人中心
            </button>
            <button class={styles.btnChangePwd} onClick={this.goChangePassword}>
              修改密码
            </button>
            <button class={styles.btnLogout} onClick={this.handleLogout}>
              退出
            </button>
          </div>
        </header>

        {/* 主体：左侧功能导航 + 右侧内容区 */}
        <main class={styles.mainLayout}>
          {/* 左侧功能导航 */}
          <aside class={styles.sidebar}>
            <h3 class={styles.sidebarTitle}>功能面板</h3>
            <nav class={styles.menu}>
              {this.menuList.map((item) => (
                <div
                  key={item.key}
                  class={[
                    styles.menuItem,
                    this.activeMenu === item.key ? styles.menuItemActive : '',
                  ].join(' ')}
                  onClick={() => this.switchMenu(item.key)}
                >
                  <span class={styles.menuIcon}>{item.icon}</span>
                  <div class={styles.menuInfo}>
                    <span class={styles.menuLabel}>{item.label}</span>
                    <span class={styles.menuDesc}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* 右侧内容区：使用 RouterView 渲染子路由 */}
          <section class={styles.contentArea}>
            <RouterView />
          </section>
        </main>
      </div>
    );
  },
});
