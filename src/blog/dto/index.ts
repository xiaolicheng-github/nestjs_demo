import { IsBoolean, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 创建文章 DTO */
export class CreateBlogDto {
  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  @MaxLength(5 * 1024 * 1024, { message: '文章数据量不得超过 5MB' })
  content: string;

  @ApiPropertyOptional({ description: '是否公开', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

/** 更新文章 DTO — 修改文章视为新版本，清空留言和点赞 */
export class UpdateBlogDto extends CreateBlogDto {}
