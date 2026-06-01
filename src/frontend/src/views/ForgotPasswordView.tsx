import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgotPasswordApi, resetPasswordApi } from '@/api/auth';
import styles from './ForgotPasswordView.module.scss';

export default defineComponent({
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter();

    const form = reactive({ email: '', code: '', password: '' });
    const loading = ref(false);
    const errorMsg = ref('');
    const countdown = ref(0);

    /** 发送重置验证码 */
    function handleSendCode() {
      if (!form.email) {
        errorMsg.value = '请先输入邮箱';
        return;
      }
      errorMsg.value = '';
      forgotPasswordApi({ email: form.email })
        .then(() => {
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) clearInterval(timer);
          }, 1000);
        })
        .catch((err: Error) => {
          errorMsg.value = err.message;
        });
    }

    /** 提交重置密码 */
    function handleSubmit(e: Event) {
      e.preventDefault();
      if (!form.email || !form.code || !form.password) return;
      loading.value = true;
      errorMsg.value = '';
      resetPasswordApi({
        email: form.email,
        code: form.code,
        password: form.password,
      })
        .then(() => {
          alert('密码重置成功，请使用新密码登录');
          router.push('/login');
        })
        .catch((err: Error) => {
          errorMsg.value = err.message;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    /** 返回登录 */
    function goLogin() {
      router.push('/login');
    }

    return {
      form,
      loading,
      errorMsg,
      countdown,
      handleSendCode,
      handleSubmit,
      goLogin,
    };
  },
  render() {
    return (
      <div class={styles.forgotPage}>
        <div class={styles.forgotContainer}>
          <h1 class={styles.title}>重置密码</h1>
          <form onSubmit={this.handleSubmit} class={styles.form}>
            <div class={styles.formItem}>
              <label>邮箱</label>
              <input
                value={this.form.email}
                onInput={(e: Event) => {
                  this.form.email = (e.target as HTMLInputElement).value;
                }}
                type="email"
                placeholder="请输入已注册的邮箱"
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
              <label>新密码</label>
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
              {this.loading ? '重置中...' : '确认重置'}
            </button>
            {this.errorMsg && (
              <p class={styles.errorMsg}>{this.errorMsg}</p>
            )}
          </form>
          <div class={styles.footer}>
            已想起密码？
            <a onClick={this.goLogin}>返回登录</a>
          </div>
        </div>
      </div>
    );
  },
});
