import type { BlogComment } from '../../../../src/blog/blog.entity';

/** 从 Markdown 内容提取标题（取第一个 # 开头的行） */
export function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : '无标题文章';
}

/** 提取预览文本（去掉 markdown 符号） */
export function extractPreview(content: string): string {
  const text = content
    .replace(/!\[.*?\]\(.*?\)/g, '[图片]')
    .replace(/[#*`>\-\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return text.length > 120 ? text.slice(0, 120) + '...' : text;
}

/** 将 Markdown 转 HTML（简单转换用于展示） */
export function getHtmlContent(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$2</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(
      /!\[.*?\]\((data:[^)]+)\)/g,
      '<img src="$1" style="max-width:100%;border-radius:8px;" />',
    )
    .replace(/\n/g, '<br />');
  return html;
}

/** 检查文章大小是否超过 5MB */
const MAX_ARTICLE_SIZE = 5 * 1024 * 1024;

export function checkSize(content: string): boolean {
  const size = new TextEncoder().encode(content).byteLength;
  if (size > MAX_ARTICLE_SIZE) {
    alert(
      `文章数据量 ${(size / 1024 / 1024).toFixed(2)}MB，超过 5MB 限制，请减少图片数量或压缩图片`,
    );
    return false;
  }
  return true;
}

/** 过滤出真实留言（排除点赞标记） */
export function filterRealComments(comments?: BlogComment[]): BlogComment[] {
  if (!comments) return [];
  return comments.filter((c) => c.id !== '__like__');
}
