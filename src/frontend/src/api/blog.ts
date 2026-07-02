import request from './index';

/** 创建文章 */
export const createBlogApi = (data: {
  content: string;
  isPublic?: boolean;
}) => request.post('/blog', data);

/** 获取我的文章列表 */
export const getMyBlogsApi = () => request.get('/blog/my');

/** 获取公开文章列表 */
export const getPublicBlogsApi = () => request.get('/blog/public');

/** 获取单篇文章详情 */
export const getBlogDetailApi = (id: number) => request.get(`/blog/${id}`);

/** 编辑文章（新版本） */
export const updateBlogApi = (
  id: number,
  data: { content: string; isPublic?: boolean },
) => request.put(`/blog/${id}`, data);

/** 删除文章 */
export const deleteBlogApi = (id: number) =>
  request.delete(`/blog/${id}`);

/** 点赞 / 取消点赞 */
export const toggleLikeApi = (id: number) =>
  request.post(`/blog/${id}/like`);

/** 添加留言 */
export const addCommentApi = (id: number, content: string) =>
  request.post(`/blog/${id}/comments`, { content });

/** 删除留言 */
export const deleteCommentApi = (blogId: number, commentId: string) =>
  request.delete(`/blog/${blogId}/comments/${commentId}`);
