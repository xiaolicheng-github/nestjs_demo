import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import styles from './HomeView.module.scss';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    /** 退出登录 */
    function handleLogout() {
      userStore.logout();
      router.push('/login');
    }

    /** 跳转修改密码 */
    function goChangePassword() {
      router.push('/change-password');
    }

    return {
      userStore,
      handleLogout,
      goChangePassword,
    };
  },
  render() {
    return (
      <div class={styles.homePage}>
        {/* 顶部导航 */}
        <header class={styles.navbar}>
          <div class={styles.navBrand}>NestJS Demo</div>
          <div class={styles.navRight}>
            <span class={styles.userName}>{this.userStore.user?.name}</span>
            <button class={styles.btnChangePwd} onClick={this.goChangePassword}>
              修改密码
            </button>
            <button class={styles.btnLogout} onClick={this.handleLogout}>
              退出
            </button>
          </div>
        </header>

        {/* 主内容 */}
        <main class={styles.mainContent}>
          <div class={styles.welcomeCard}>
            <h2>欢迎回来！</h2>
            <p class={styles.greeting}>你好，{this.userStore.user?.name} 👋</p>
            <div class={styles.infoGrid}>
              <div class={styles.infoItem}>
                <span class={styles.label}>用户 ID</span>
                <span class={styles.value}>{this.userStore.user?.id}</span>
              </div>
              <div class={styles.infoItem}>
                <span class={styles.label}>邮箱</span>
                <span class={styles.value}>{this.userStore.user?.email}</span>
              </div>
              <div class={styles.infoItem}>
                <span class={styles.label}>状态</span>
                <span class={[styles.value, styles.statusActive].join(' ')}>
                  已登录 ✅
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  },
});
