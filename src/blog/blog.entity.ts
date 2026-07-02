import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

/** 留言/评论 */
export interface BlogComment {
  id: string; // 客户端生成的唯一 ID
  userId: number; // 评论者用户 ID
  userName: string; // 评论者名称
  content: string; // 评论内容
  createdAt: string; // ISO 时间戳
}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  /** 作者用户 ID */
  @Column()
  userId: number;

  /** 关联作者 */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /** 文章内容（Markdown / HTML，含内嵌 base64 图片） */
  @Column({ type: 'text' })
  content: string;

  /** 是否公开 */
  @Column({ default: false })
  isPublic: boolean;

  /** 浏览量 */
  @Column({ default: 0 })
  viewCount: number;

  /** 点赞量 */
  @Column({ default: 0 })
  likeCount: number;

  /** 留言板（JSON 数组） */
  @Column({
    type: 'simple-json',
    default: [],
  })
  comments: BlogComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
