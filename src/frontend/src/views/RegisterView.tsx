import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { sendCodeApi, registerApi } from '@/api/auth';
import styles from './RegisterView.module.scss';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const router = useRouter();

    /** 表单数据 */
    const form = reactive({ name: '', email: '', code: '', password: '' });
    const loading = ref(false);
    const errorMsg = ref('');
    const countdown = ref(0);

    /** 发送验证码 */
    async function handleSendCode() {
      if (!form.email) {
        errorMsg.value = '请先输入邮箱';
        return;
      }
      errorMsg.value = '';
      try {
        await sendCodeApi(form.email);
        // 开始倒计时
        countdown.value = 60;
        const timer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0) clearInterval(timer);
        }, 1000);
      } catch (err: any) {
        errorMsg.value = err.message || '发送失败';
      }
    }

    /** 注册提交 */
    async function handleRegister(e: Event) {
      e.preventDefault();
      if (!form.name || !form.email || !form.code || !form.password) return;
      loading.value = true;
      errorMsg.value = '';
      try {
        await registerApi(form);
        alert('注册成功！即将跳转到登录页');
        router.push('/login');
      } catch (err: any) {
        errorMsg.value = err.message || '注册失败';
      } finally {
        loading.value = false;
      }
    }

    /** 跳转登录 */
    function goLogin() {
      router.push('/login');
    }

    return {
      form,
      loading,
      errorMsg,
      countdown,
      handleSendCode,
      handleRegister,
      goLogin,
    };
  },
  render() {
    return (
      <div class={styles.registerPage}>
        <div class={styles.registerContainer}>
          <h1 class={styles.title}>注册</h1>
          <form onSubmit={this.handleRegister} class={styles.form}>
            <div class={styles.formItem}>
              <label>用户名</label>
              <input
                value={this.form.name}
                onInput={(e: Event) => {
                  this.form.name = (e.target as HTMLInputElement).value;
                }}
                type="text"
                placeholder="请输入用户名"
                required
              />
            </div>
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
              <label>验证码</label>
              <div class={styles.codeRow}>
                <input
                  value={this.form.code}
                  onInput={(e: Event) => {
                    this.form.code = (e.target as HTMLInputElement).value;
                  }}
                  type="text"
                  placeholder="请输入验证码"
                  required
                />
                <button
                  type="button"
                  class={styles.btnCode}
                  disabled={this.countdown > 0}
                  onClick={this.handleSendCode}
                >
                  {this.countdown > 0 ? `${this.countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
            <div class={styles.formItem}>
              <label>密码</label>
              <input
                value={this.form.password}
                onInput={(e: Event) => {
                  this.form.password = (e.target as HTMLInputElement).value;
                }}
                type="password"
                placeholder="至少6位密码"
                required
                minlength={6}
                autocomplete="new-password"
              />
            </div>
            <button
              type="submit"
              class={styles.btnPrimary}
              disabled={this.loading}
            >
              {this.loading ? '注册中...' : '注 册'}
            </button>
            {this.errorMsg && (
              <p class={styles.errorMsg}>{this.errorMsg}</p>
            )}
          </form>
          <div class={styles.footer}>
            已有账号？
            <a onClick={this.goLogin}>立即登录</a>
          </div>
        </div>
      </div>
    );
  },
});
