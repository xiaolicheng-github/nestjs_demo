import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { changePasswordApi } from '@/api/auth';
import styles from './ChangePasswordView.module.scss';

export default defineComponent({
  name: 'ChangePasswordView',
  setup() {
    const router = useRouter();

    /** 表单数据 */
    const form = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const loading = ref(false);
    const errorMsg = ref('');
    const successMsg = ref('');

    /** 提交修改密码 */
    async function handleSubmit(e: Event) {
      e.preventDefault();
      errorMsg.value = '';
      successMsg.value = '';

      // 前端校验：新密码一致性
      if (form.newPassword !== form.confirmPassword) {
        errorMsg.value = '两次输入的新密码不一致';
        return;
      }
      // 新旧密码不能相同
      if (form.oldPassword === form.newPassword) {
        errorMsg.value = '新密码不能与原密码相同';
        return;
      }

      loading.value = true;
      try {
        await changePasswordApi({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        });
        successMsg.value = '密码修改成功，即将跳转到登录页...';

        // 清空表单
        form.oldPassword = '';
        form.newPassword = '';
        form.confirmPassword = '';

        // SSO 模式下修改密码后需要重新登录
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err: any) {
        errorMsg.value = err.message || '修改失败，请重试';
      } finally {
        loading.value = false;
      }
      // 阻止表单默认提交刷新页面
      return false;
    }

    /** 返回首页 */
    function goBack() {
      router.push('/');
    }

    return {
      form,
      loading,
      errorMsg,
      successMsg,
      handleSubmit,
      goBack,
    };
  },
  render() {
    return (
      <div class={styles.page}>
        <div class={styles.container}>
          <h1 class={styles.title}>修改密码</h1>
          <form onSubmit={this.handleSubmit} class={styles.form}>
            <div class={styles.formItem}>
              <label>原密码</label>
              <input
                value={this.form.oldPassword}
                onInput={(e: Event) => {
                  this.form.oldPassword = (e.target as HTMLInputElement).value;
                }}
                type="password"
                placeholder="请输入原密码"
                required
                autocomplete="current-password"
              />
            </div>
            <div class={styles.formItem}>
              <label>新密码</label>
              <input
                value={this.form.newPassword}
                onInput={(e: Event) => {
                  this.form.newPassword = (e.target as HTMLInputElement).value;
                }}
                type="password"
                placeholder="至少6位新密码"
                required
                minlength={6}
                autocomplete="new-password"
              />
            </div>
            <div class={styles.formItem}>
              <label>确认新密码</label>
              <input
                value={this.form.confirmPassword}
                onInput={(e: Event) => {
                  this.form.confirmPassword = (
                    e.target as HTMLInputElement
                  ).value;
                }}
                type="password"
                placeholder="请再次输入新密码"
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
              {this.loading ? '修改中...' : '确认修改'}
            </button>
            {this.errorMsg && (
              <p class={styles.errorMsg}>{this.errorMsg}</p>
            )}
            {this.successMsg && (
              <p class={styles.successMsg}>{this.successMsg}</p>
            )}
          </form>
          <div class={styles.footer}>
            <a onClick={this.goBack}>返回首页</a>
          </div>
        </div>
      </div>
    );
  },
});
