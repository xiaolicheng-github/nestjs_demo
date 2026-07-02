import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  toggleLikeApi,
  addCommentApi,
  deleteCommentApi,
  getBlogDetailApi,
} from '@/api/blog';
import { getHtmlContent, filterRealComments } from '@/utils/blog';
import type { BlogComment } from '../../../../src/blog/blog.entity';
import styles from './index.module.scss';

export default defineComponent({
  name: 'BlogDetail',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const currentBlog = ref<any>(null);
    const commentText = ref('');

    /** 返回列表 */
    function goBack() {
      void router.push('/blog');
    }

    /** 加载文章详情 */
    function loadDetail(id: number) {
      getBlogDetailApi(id)
        .then((res: any) => {
          currentBlog.value = res;
        })
        .catch(() => {});
    }

    /** 点赞 */
    function handleLike() {
      if (!currentBlog.value) return;
      toggleLikeApi(currentBlog.value.id)
        .then((res: any) => {
          currentBlog.value.likeCount = res.likeCount;
        })
        .catch(() => {});
    }

    /** 提交留言 */
    function handleSubmitComment() {
      if (!currentBlog.value || !commentText.value.trim()) return;
      const text = commentText.value.trim();
      commentText.value = '';
      addCommentApi(currentBlog.value.id, text)
        .then((res: any) => {
          currentBlog.value = res;
        })
        .catch(() => {});
    }

    /** 删除留言 */
    function handleDeleteComment(commentId: string) {
      if (!currentBlog.value) return;
      deleteCommentApi(currentBlog.value.id, commentId)
        .then((res: any) => {
          currentBlog.value = res;
        })
        .catch(() => {});
    }

    onMounted(() => {
      const idStr = route.query.id as string | undefined;
      if (idStr) {
        loadDetail(Number(idStr));
      }
    });

    return {
      currentBlog,
      commentText,
      goBack,
      handleLike,
      handleSubmitComment,
      handleDeleteComment,
      getHtmlContent,
      filterRealComments,
      styles,
    };
  },
  render() {
    if (!this.currentBlog) {
      return (
        <div class={styles.detailPage}>
          <div class={styles.loading}>加载中...</div>
        </div>
      );
    }

    const realComments = this.filterRealComments(this.currentBlog.comments);

    return (
      <div class={styles.detailPage}>
        <button class={styles.btnBack} onClick={this.goBack}>
          ← 返回列表
        </button>

        <article class={styles.detailContent}>
          <header class={styles.detailHeader}>
            <span
              class={[
                styles.badge,
                this.currentBlog.isPublic ? styles.badgePublic : '',
              ].join(' ')}
            >
              {this.currentBlog.isPublic ? '公开' : '草稿'}
            </span>
            <time>{new Date(this.currentBlog.updatedAt).toLocaleString()}</time>
          </header>

          {/* 使用 toast-ui viewer 渲染 HTML */}
          <div
            class={styles.viewerHtml}
            innerHTML={this.getHtmlContent(this.currentBlog.content)}
          />
        </article>

        {/* 互动区 */}
        <div class={styles.interactionBar}>
          <span>👁 浏览 {this.currentBlog.viewCount}</span>
          <button class={styles.btnLike} onClick={this.handleLike}>
            ❤️ 点赞 {this.currentBlog.likeCount}
          </button>
        </div>

        {/* 留言板 */}
        <section class={styles.commentSection}>
          <h3 class={styles.commentTitle}>💬 留言板</h3>
          <div class={styles.commentInput}>
            <input
              type="text"
              value={this.commentText}
              onInput={(e) =>
                (this.commentText = (e.target as HTMLInputElement).value)
              }
              placeholder="写点什么..."
              maxLength={500}
              onKeyDown={(e) => e.key === 'Enter' && this.handleSubmitComment()}
            />
            <button onClick={this.handleSubmitComment}>发送</button>
          </div>
          <ul class={styles.commentList}>
            {realComments.map((c: BlogComment) => (
              <li key={c.id} class={styles.commentItem}>
                <strong class={styles.commentUser}>
                  {c.userName || `用户${c.userId}`}
                </strong>
                <span class={styles.commentTime}>
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                <p class={styles.commentBody}>{c.content}</p>
              </li>
            ))}
            {!realComments.length && (
              <li class={styles.noComments}>暂无留言，来抢沙发~</li>
            )}
          </ul>
        </section>
      </div>
    );
  },
});
