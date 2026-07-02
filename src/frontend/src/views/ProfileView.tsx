import { defineComponent, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFullProfileApi, updateProfileApi } from '@/api/auth';
import { compressBlogImage, getBase64Size } from '@/utils/image';
import styles from './ProfileView.module.scss';

export default defineComponent({
  name: 'ProfileView',
  setup() {
    const router = useRouter();

    // 表单数据
    const form = reactive({ name: '', nickname: '', bio: '', avatar: '' });
    const loading = ref(false);
    const errorMsg = ref('');
    const successMsg = ref('');
    const avatarFileError = ref('');

    // 基础信息（只读展示）
    const userInfo = reactive({ id: 0, email: '' });

    /** 加载当前用户信息 */
    function loadProfile() {
      getFullProfileApi()
        .then((res: any) => {
          userInfo.id = res.id;
          userInfo.email = res.email;
          form.name = res.name || '';
          form.nickname = (res as any).profile?.nickname || '';
          form.bio = (res as any).profile?.bio || '';
          form.avatar = (res as any).profile?.avatar || '';
        })
        .catch((err: Error) => {
          errorMsg.value = err.message;
        });
    }

    onMounted(() => {
      loadProfile();
    });

    /** 头像文件选择 */
    async function handleAvatarSelect(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      avatarFileError.value = '';
      errorMsg.value = '';

      // 仅允许图片
      if (!file.type.startsWith('image/')) {
        avatarFileError.value = '请上传图片文件';
        return;
      }

      // 转为 base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64DataUrl = reader.result as string;
        try {
          // 压缩到 ≤10KB
          const compressed = await compressBlogImage(base64DataUrl);
          const sizeKb = Math.round(getBase64Size(compressed) / 1024);

          if (getBase64Size(compressed) > 10 * 1024) {
            avatarFileError.value = `压缩后仍为 ${sizeKb}KB，请选择更小的图片`;
            return;
          }

          form.avatar = compressed;
          avatarFileError.value = `已压缩至 ${sizeKb}KB ✅`;
        } catch {
          avatarFileError.value = '图片处理失败';
        }
      };
      reader.readAsDataURL(file);
      // 重置 input 以支持重复选择同一文件
      (e.target as HTMLInputElement).value = '';
    }

    /** 提交更新 */
    function handleSubmit(e: Event) {
      e.preventDefault();
      loading.value = true;
      errorMsg.value = '';
      successMsg.value = '';

      updateProfileApi({
        name: form.name || undefined,
        nickname: form.nickname || undefined,
        bio: form.bio || undefined,
        avatar: form.avatar || undefined,
      })
        .then(() => {
          successMsg.value = '资料更新成功';
          // 刷新页面数据
          loadProfile();
        })
        .catch((err: Error) => {
          errorMsg.value = err.message;
        })
        .finally(() => {
          loading.value = false;
        });
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
      avatarFileError,
      userInfo,
      handleAvatarSelect,
      handleSubmit,
      goBack,
    };
  },
  render() {
    return (
      <div class={styles.profilePage}>
        <header class={styles.navbar}>
          <span class={styles.navBrand} onClick={this.goBack}>小月亮观景台</span>
          <button class={styles.btnBack} onClick={this.goBack}>返回首页</button>
        </header>

        <main class={styles.container}>
          <div class={styles.card}>
            <h2 class={styles.title}>个人中心</h2>

            {/* 头像 */}
            <div class={styles.avatarSection}>
              <div class={styles.avatarPreview}>
                {this.form.avatar ? (
                  <img src={this.form.avatar} alt="头像" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div class={styles.avatarUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={this.handleAvatarSelect}
                />
                <button type="button">更换头像</button>
              </div>
              <p class={styles.sizeHint}>建议 ≤10KB，超出将自动压缩</p>
              {this.avatarFileError && (
                <p class={[styles.errorMsg, /✅/.test(this.avatarFileError) ? styles.successMsg : ''].join(' ')}>
                  {this.avatarFileError}
                </p>
              )}
            </div>

            {/* 编辑表单 */}
            <form onSubmit={this.handleSubmit} class={styles.form}>
              <div class={styles.formItem}>
                <label>用户名</label>
                <input
                  value={this.form.name}
                  onInput={(e: Event) => {
                    this.form.name = (e.target as HTMLInputElement).value;
                  }}
                  type="text"
                  placeholder="请输入用户名（唯一）"
                />
              </div>
              <div class={styles.formItem}>
                <label>昵称</label>
                <input
                  value={this.form.nickname}
                  onInput={(e: Event) => {
                    this.form.nickname = (e.target as HTMLInputElement).value;
                  }}
                  type="text"
                  placeholder="请输入昵称"
                />
              </div>
              <div class={styles.formItem}>
                <label>简介</label>
                <textarea
                  value={this.form.bio}
                  onInput={(e: Event) => {
                    this.form.bio = (e.target as HTMLTextAreaElement).value;
                  }}
                  placeholder="介绍一下自己吧..."
                />
              </div>

              <button
                type="submit"
                class={styles.btnPrimary}
                disabled={this.loading}
              >
                {this.loading ? '保存中...' : '保存修改'}
              </button>

              {this.errorMsg && (
                <p class={styles.errorMsg}>{this.errorMsg}</p>
              )}
              {this.successMsg && (
                <p class={styles.successMsg}>{this.successMsg}</p>
              )}
            </form>

            {/* 账号基础信息（只读） */}
            <div class={styles.infoSection}>
              <h3 class={styles.infoTitle}>账号信息</h3>
              <div class={styles.infoGrid}>
                <div class={styles.infoItem}>
                  <span class={styles.label}>用户 ID</span>
                  <span class={styles.value}>{this.userInfo.id}</span>
                </div>
                <div class={styles.infoItem}>
                  <span class={styles.label}>邮箱</span>
                  <span class={styles.value}>{this.userInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  },
});
