import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import styles from './HomeView.module.scss';

/** 功能入口卡片 */
interface FeatureCard {
  key: string;
  path: string;
  label: string;
  icon: string;
  desc: string;
  gradient: string;
}

const FEATURE_LIST: FeatureCard[] = [
  {
    key: 'ai-prompt',
    path: '/ai-prompt',
    label: 'AI 提示词生成器',
    icon: '🤖',
    desc: '填写条件，自动组装高效 Prompt',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'blog',
    path: '/blog',
    label: '个人博客',
    icon: '🌙',
    desc: '在月光下记录你的思绪与故事',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)',
  },
];

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    /** 跳转功能页面（新标签页） */
    function goFeature(path: string) {
      window.open(path, '_blank');
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
      FEATURE_LIST,
      goFeature,
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

        {/* 欢迎区域：月亮星空主题 */}
        <section class={styles.heroSection}>
          <div class={styles.moonDecor}>🌙</div>
          {/* 星星装饰 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              class={styles.star}
              style={{
                left: `${10 + ((i * 7.5) % 85)}%`,
                top: `${8 + ((i * 13) % 70)}%`,
                animationDelay: `${(i * 0.4) % 3}s`,
                fontSize: `${10 + (i % 3) * 4}px`,
              }}
            >
              ✦
            </span>
          ))}
          <div class={styles.heroContent}>
            <h1 class={styles.heroTitle}>
              欢迎来到<span class={styles.brandHighlight}>小月亮</span>观景台
            </h1>
            <p class={styles.heroSubtitle}>
              在静谧的夜空下，探索无限可能。选择下方功能，开启你的创作之旅。
            </p>
          </div>
        </section>

        {/* 功能卡片网格 */}
        <main class={styles.featureGrid}>
          {this.FEATURE_LIST.map((item) => (
            <div
              key={item.key}
              class={styles.featureCard}
              style={{ '--card-gradient': item.gradient }}
              onClick={() => this.goFeature(item.path)}
            >
              <span class={styles.cardIcon}>{item.icon}</span>
              <div class={styles.cardInfo}>
                <h3 class={styles.cardLabel}>{item.label}</h3>
                <p class={styles.cardDesc}>{item.desc}</p>
              </div>
              <span class={styles.cardArrow}>→</span>
            </div>
          ))}
        </main>

        {/* 页脚 */}
        <footer class={styles.footer}>
          <span>✦ 小月亮观景台 · 愿你每晚都有好风景 ✦</span>
        </footer>
      </div>
    );
  },
});
