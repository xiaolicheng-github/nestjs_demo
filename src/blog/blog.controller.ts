import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';

@Controller('blog')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /** 创建文章 */
  @Post()
  create(@Body() dto: CreateBlogDto, @Req() req: any) {
    return this.blogService.create(req.user.id, dto.content, dto.isPublic);
  }

  /** 获取我的文章列表 */
  @Get('my')
  findMyBlogs(@Req() req: any) {
    return this.blogService.findByUser(req.user.id);
  }

  /** 获取公开文章列表（需登录即可查看） */
  @Get('public')
  findPublicBlogs() {
    return this.blogService.findPublic();
  }

  /** 获取单篇文章（含浏览计数） */
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.blogService.findById(+id);
  }

  /** 编辑文章 — 视为新版本，清空留言/点赞 */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto, @Req() req: any) {
    return this.blogService.update(+id, req.user.id, dto.content, dto.isPublic);
  }

  /** 删除文章 */
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.blogService.remove(+id, req.user.id);
  }

  /** 点赞 / 取消点赞 */
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.blogService.toggleLike(+id, req.user.id);
  }

  /** 添加留言 */
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: any,
  ) {
    return this.blogService.addComment(+id, req.user.id, req.user.name || '', body.content);
  }

  /** 删除留言 */
  @Delete(':id/comments/:commentId')
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    return this.blogService.removeComment(+id, commentId, req.user.id);
  }
}
