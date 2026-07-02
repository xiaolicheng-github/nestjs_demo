import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyBlogsApi, deleteBlogApi } from '@/api/blog';
import { extractTitle, extractPreview } from '@/utils/blog';
import type { BlogComment } from '../../../../src/blog/blog.entity';
import styles from './BlogView.module.scss';

export default defineComponent({
  name: 'BlogView',
  setup() {
    const router = useRouter();

    // 文章数据
    const blogList = ref<any[]>([]);
    const loading = ref(false);

    /** 获取文章列表 */
    function fetchBlogs() {
      loading.value = true;
      getMyBlogsApi()
        .then((res: any) => {
          blogList.value = res || [];
        })
        .catch(() => {})
        .finally(() => {
          loading.value = false;
        });
    }

    /** 新建文章 → 跳转编辑页 */
    function goNewArticle() {
      void router.push('/blog/edit');
    }

    /** 编辑文章 → 跳转编辑页带 id */
    function goEdit(blog: any) {
      void router.push({ path: '/blog/edit', query: { id: String(blog.id) } });
    }

    /** 查看详情 → 跳转详情页 */
    function goDetail(blog: any) {
      void router.push({
        path: '/blog/detail',
        query: { id: String(blog.id) },
      });
    }

    /** 删除文章 */
    function handleDelete(id: number) {
      if (!confirm('确定删除此文章？')) return;
      deleteBlogApi(id)
        .then(() => fetchBlogs())
        .catch(() => {});
    }

    onMounted(() => {
      fetchBlogs();
    });

    return {
      blogList,
      loading,
      goNewArticle,
      goEdit,
      goDetail,
      handleDelete,
      extractTitle,
      extractPreview,
      styles,
    };
  },
  render() {
    return (
      <div class={styles.blogPage}>
        <div class={styles.listHeader}>
          <h2 class={styles.pageTitle}>🌙 我的博客</h2>
          <button class={styles.btnNew} onClick={this.goNewArticle}>
            + 新建文章
          </button>
        </div>

        {this.loading ? (
          <div class={styles.loading}>加载中...</div>
        ) : this.blogList.length === 0 ? (
          <div class={styles.emptyState}>
            <p>还没有文章，快来写下第一篇吧 📝</p>
          </div>
        ) : (
          <ul class={styles.articleList}>
            {this.blogList.map((blog) => (
              <li key={blog.id} class={styles.articleItem}>
                <div class={styles.articleInfo}>
                  <span
                    class={[
                      styles.badge,
                      blog.isPublic ? styles.badgePublic : '',
                    ].join(' ')}
                  >
                    {blog.isPublic ? '公开' : '草稿'}
                  </span>
                  <span class={styles.articleDate}>
                    {new Date(blog.updatedAt).toLocaleString()}
                  </span>
                </div>
                <h3
                  class={styles.articleTitle}
                  onClick={() => this.goDetail(blog)}
                >
                  {this.extractTitle(blog.content)}
                </h3>
                <p class={styles.articlePreview}>
                  {this.extractPreview(blog.content)}
                </p>
                <div class={styles.articleMeta}>
                  <span>👁 {blog.viewCount}</span>
                  <span>❤️ {blog.likeCount}</span>
                  <span>
                    💬{' '}
                    {
                      (blog.comments || []).filter(
                        (c: BlogComment) => c.id !== '__like__',
                      ).length
                    }
                  </span>
                </div>
                <div class={styles.articleActions}>
                  <button
                    class={styles.btnEdit}
                    onClick={() => this.goEdit(blog)}
                  >
                    编辑
                  </button>
                  <button
                    class={styles.btnDelete}
                    onClick={() => this.handleDelete(blog.id)}
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
});
