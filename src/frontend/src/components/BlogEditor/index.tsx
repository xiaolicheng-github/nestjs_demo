import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { createBlogApi, updateBlogApi, getBlogDetailApi } from '@/api/blog';
import { checkSize } from '@/utils/blog';
import styles from './index.module.scss';

export default defineComponent({
  name: 'BlogEditor',
  setup() {
    const router = useRouter();
    const route = useRoute();
    let editorInstance: Editor | null = null;
    const editorEl = ref<HTMLDivElement | null>(null);

    // 编辑状态
    const isPublic = ref(false);
    const saving = ref(false);
    const editingId = ref<number | null>(null);

    /** 初始化编辑器 */
    async function initEditor() {
      await nextTick();
      if (!editorEl.value) return;

      if (editorInstance) {
        editorInstance.destroy();
      }

      editorInstance = new Editor({
        el: editorEl.value,
        previewStyle: 'vertical',
        height: '520px',
        initialEditType: 'markdown',
        placeholder:
          '在这里开始写作...\n\n支持 Markdown 语法，图片会以 base64 内嵌到文章中。',
        hooks: {
          addImageBlobHook: async (blob, callback) => {
            try {
              const reader = new FileReader();
              reader.onload = () => {
                compressAndCallback(reader.result as string, callback);
              };
              reader.readAsDataURL(blob);
            } catch {
              callback('图片处理失败', '');
            }
            return false;
          },
        },
      });
    }

    /** 压缩图片后回调 */
    async function compressAndCallback(
      dataUrl: string,
      callback: (url: string, alt?: string) => void,
    ) {
      const { compressBlogImage } = await import('@/utils/image');
      const compressed = await compressBlogImage(dataUrl);
      callback(compressed, '');
    }

    /** 返回列表 */
    function goBack() {
      void router.push('/blog');
    }

    /** 保存/发布文章 */
    function handleSave() {
      if (!editorInstance) return;
      const content = editorInstance.getMarkdown();
      if (!content.trim()) {
        alert('请输入文章内容');
        return;
      }
      if (!checkSize(content)) return;

      saving.value = true;
      const promise = editingId.value
        ? updateBlogApi(editingId.value, { content, isPublic: isPublic.value })
        : createBlogApi({ content, isPublic: isPublic.value });

      promise
        .then(() => {
          alert(editingId.value ? '更新成功！' : '发布成功！');
          goBack();
        })
        .catch((err: Error) => {
          alert(err.message || '保存失败');
        })
        .finally(() => {
          saving.value = false;
        });
    }

    onMounted(async () => {
      // 如果有 id 参数则为编辑模式
      const idStr = route.query.id as string | undefined;
      if (idStr) {
        editingId.value = Number(idStr);
        try {
          const res: any = await getBlogDetailApi(editingId.value!);
          isPublic.value = res.isPublic;
          await initEditor();
          editorInstance?.setMarkdown(res.content || '');
          return;
        } catch {
          // 加载失败，按新建处理
          editingId.value = null;
        }
      }
      await initEditor();
    });

    onBeforeUnmount(() => {
      if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
      }
    });

    return {
      editorEl,
      isPublic,
      saving,
      editingId,
      goBack,
      handleSave,
      styles,
    };
  },
  render() {
    return (
      <div class={styles.editorPage}>
        <div class={styles.editorToolbar}>
          <button class={styles.btnBack} onClick={this.goBack}>
            ← 返回列表
          </button>
          <label class={styles.publicToggle}>
            <input
              type="checkbox"
              checked={this.isPublic}
              onChange={(e) =>
                (this.isPublic = (e.target as HTMLInputElement).checked)
              }
            />
            公开发布
          </label>
          <button
            class={[styles.btnSave, this.saving ? styles.btnSaving : ''].join(
              ' ',
            )}
            disabled={this.saving}
            onClick={this.handleSave}
          >
            {this.saving
              ? '保存中...'
              : this.editingId
                ? '更新文章'
                : '发布文章'}
          </button>
        </div>
        <div class={styles.editorWrapper}>
          <div ref="editorEl" class={styles.editorBox}></div>
        </div>
      </div>
    );
  },
});
