/**
 * 图片压缩工具（博客场景）
 * 文章内嵌图片使用 base64，过大时自动降低分辨率
 * 复用 browser-image-compression 库
 */
import imageCompression from 'browser-image-compression';

/** 博客内单张图片最大 500KB（多张累积 ≤5MB） */
const BLOG_IMAGE_MAX_BYTES = 500 * 1024;

/**
 * 压缩博客文章内的 base64 图片
 * @returns 压缩后的 base64 DataURL，如已在限制内则原样返回
 */
export async function compressBlogImage(
  base64DataUrl: string,
): Promise<string> {
  if (!base64DataUrl || !base64DataUrl.includes(',')) return base64DataUrl;

  // 已在限制内则跳过
  if (getBase64Size(base64DataUrl) <= BLOG_IMAGE_MAX_BYTES) {
    return base64DataUrl;
  }

  // base64 → File → 压缩
  const file = dataURLtoFile(base64DataUrl, `img_${Date.now()}.jpg`);
  const options = {
    maxSizeMB: BLOG_IMAGE_MAX_BYTES / (1024 * 1024),
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (error) {
    console.warn('博客图片压缩失败，使用原图:', error);
    return base64DataUrl;
  }
}

/** 获取 base64 字符串的字节大小 */
export function getBase64Size(base64DataUrl: string): number {
  const content = base64DataUrl.split(',')[1];
  if (!content) return 0;
  try {
    return new TextEncoder().encode(atob(content)).byteLength;
  } catch {
    return Math.ceil(content.length * 0.75);
  }
}

// ==================== 内部工具 ====================

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
