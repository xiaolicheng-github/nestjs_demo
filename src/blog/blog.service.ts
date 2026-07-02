import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  /** 创建新文章 */
  async create(userId: number, content: string, isPublic = false): Promise<Blog> {
    const blog = this.blogRepo.create({
      userId,
      content,
      isPublic,
      viewCount: 0,
      likeCount: 0,
      comments: [],
    });
    return this.blogRepo.save(blog);
  }

  /** 更新文章 — 视为新版本，留言板、点赞等清空重计 */
  async update(id: number, userId: number, content: string, isPublic = false): Promise<Blog> {
    const blog = await this.findOneByIdAndUser(id, userId);
    // 更新核心字段，其余归零
    blog.content = content;
    blog.isPublic = isPublic;
    blog.comments = [];
    blog.likeCount = 0;
    // viewCount 不清零，保留累计浏览
    return this.blogRepo.save(blog);
  }

  /** 删除文章 */
  async remove(id: number, userId: number): Promise<void> {
    const blog = await this.findOneByIdAndUser(id, userId);
    await this.blogRepo.remove(blog);
  }

  /** 根据 ID 查询（自动增加浏览量） */
  async findById(id: number): Promise<Blog> {
    const blog = await this.blogRepo.findOneBy({ id });
    if (!blog) throw new NotFoundException('文章不存在');
    // 浏览量 +1
    blog.viewCount += 1;
    await this.blogRepo.save(blog);
    return blog;
  }

  /** 获取当前用户的文章列表 */
  async findByUser(userId: number): Promise<Blog[]> {
    return this.blogRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /** 获取公开文章列表 */
  async findPublic(): Promise<Blog[]> {
    return this.blogRepo.find({
      where: { isPublic: true },
      order: { updatedAt: 'DESC' },
    });
  }

  /** 点赞 / 取消点赞 */
  async toggleLike(id: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const blog = await this.findOneById(id);
    const comment = blog.comments.find(
      (c) => c.userId === userId && c.id === '__like__',
    );
    if (comment) {
      // 已点赞 → 取消
      blog.comments = blog.comments.filter((c) => c !== comment);
      blog.likeCount = Math.max(0, blog.likeCount - 1);
    } else {
      // 未点赞 → 点赞
      blog.comments.push({
        id: '__like__',
        userId,
        userName: '',
        content: '',
        createdAt: new Date().toISOString(),
      });
      blog.likeCount += 1;
    }
    await this.blogRepo.save(blog);
    return { liked: !comment, likeCount: blog.likeCount };
  }

  /** 添加留言 */
  async addComment(
    id: number,
    userId: number,
    userName: string,
    content: string,
  ): Promise<Blog> {
    const blog = await this.findOneById(id);
    blog.comments.push({
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    });
    return this.blogRepo.save(blog);
  }

  /** 删除留言 */
  async removeComment(
    blogId: number,
    commentId: string,
    userId: number,
  ): Promise<Blog> {
    const blog = await this.findOneById(blogId);
    const idx = blog.comments.findIndex((c) => c.id === commentId && c.userId === userId);
    if (idx === -1) throw new NotFoundException('留言不存在');
    blog.comments.splice(idx, 1);
    return this.blogRepo.save(blog);
  }

  // ==================== 内部工具 ====================

  /** 校验文章归属 */
  private async findOneByIdAndUser(id: number, userId: number): Promise<Blog> {
    const blog = await this.blogRepo.findOneBy({ id, userId });
    if (!blog) throw new NotFoundException('文章不存在或无权操作');
    return blog;
  }

  /** 按 ID 查找 */
  private async findOneById(id: number): Promise<Blog> {
    const blog = await this.blogRepo.findOneBy({ id });
    if (!blog) throw new NotFoundException('文章不存在');
    return blog;
  }
}
