import { defineComponent, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import styles from './LoginView.module.scss';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    /** 表单数据 */
    const form = reactive({ email: '', password: '' });
    const loading = ref(false);
    const errorMsg = ref('');

    /** 处理登录 */
    function handleLogin(e: Event) {
      e.preventDefault();
      if (!form.email || !form.password) return;
      loading.value = true;
      errorMsg.value = '';
      userStore
        .login(form.email, form.password)
        .then(() => {
          const redirect = (route.query.redirect as string) || '/';
          router.push(redirect);
        })
        .catch((err: Error) => {
          errorMsg.value = err.message;
        })
        .finally(() => {
          loading.value = false;
        });
      // 显式返回 false 阻止表单默认提交刷新页面
      return false;
    }

    /** 跳转注册 */
    function goRegister() {
      router.push('/register');
    }

    /** 跳转忘记密码 */
    function goForgotPassword() {
      router.push('/forgot-password');
    }

    return {
      form,
      loading,
      errorMsg,
      handleLogin,
      goRegister,
      goForgotPassword,
    };
  },
  render() {
    return (
      <div class={styles.loginPage}>
        <div class={styles.loginContainer}>
          <h1 class={styles.title}>登录</h1>
          <form onSubmit={this.handleLogin} class={styles.form}>
            <div class={styles.formItem}>
              <label>邮箱</label>
              <input
                value={this.form.email}
                onInput={(e: Event) => {
                  this.form.email = (e.target as HTMLInputElement).value;
                }}
                type="email"
                placeholder="请输入邮箱地址"
                required
              />
            </div>
            <div class={styles.formItem}>
              <label>密码</label>
              <input
                value={this.form.password}
                onInput={(e: Event) => {
                  this.form.password = (e.target as HTMLInputElement).value;
                }}
                type="password"
                placeholder="请输入密码"
                required
              />
            </div>
            <button
              type="submit"
              class={styles.btnPrimary}
              disabled={this.loading}
            >
              {this.loading ? '登录中...' : '登 录'}
            </button>
            {this.errorMsg && (
              <p class={styles.errorMsg}>{this.errorMsg}</p>
            )}
          </form>
          <div class={styles.footer}>
            还没有账号？
            <a onClick={this.goRegister}>立即注册</a>
            {' · '}
            <a onClick={this.goForgotPassword}>忘记密码？</a>
          </div>
        </div>
      </div>
    );
  },
});
