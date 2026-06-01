/**
 * 头像压缩工具
 * 使用 browser-image-compression 库实现渐进式压缩
 *
 * 安装依赖：pnpm add browser-image-compression (在 src/frontend 目录下)
 */
import imageCompression from 'browser-image-compression';

const MAX_SIZE_BYTES = 10 * 1024; // 10KB

/** 压缩 File 对象头像至 ≤10KB，返回压缩后的 base64 DataURL */
export async function compressAvatar(base64DataUrl: string): Promise<string> {
  const base64Content = base64DataUrl.split(',')[1];
  if (!base64Content) throw new Error('无效的 base64 格式');

  // 已在限制内则直接返回
  if (getBase64Size(base64DataUrl) <= MAX_SIZE_BYTES) {
    return base64DataUrl;
  }

  // base64 → File（库需要 File/Blob 输入）
  const file = dataURLtoFile(base64DataUrl, 'avatar.jpg');

  // 配置压缩选项
  const options = {
    maxSizeMB: MAX_SIZE_BYTES / (1024 * 1024), // 10KB ≈ 0.00977 MB
    maxWidthOrHeight: 256,       // 头像不需要太大
    useWebWorker: true,          // 使用 Web Worker 避免阻塞 UI
    initialQuality: 0.8,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (error) {
    throw new Error(`图片压缩失败: ${(error as Error).message}`);
  }
}

/** 获取 base64 字符串的字节大小 */
export function getBase64Size(base64DataUrl: string): number {
  const content = base64DataUrl.split(',')[1];
  if (!content) return 0;
  // 浏览器端使用 atob 计算字节长度（兼容性好于 Buffer）
  try {
    return new TextEncoder().encode(atob(content)).byteLength;
  } catch {
    return Math.ceil(content.length * 0.75);
  }
}

// ==================== 内部工具 ====================

/** 将 base64 DataURL 转为 File 对象 */
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
