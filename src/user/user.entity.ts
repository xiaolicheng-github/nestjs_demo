import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/** Profile JSON 结构（存入 profile 字段） */
export interface UserProfile {
  nickname?: string;  // 昵称
  bio?: string;       // 简介
  avatar?: string;    // 头像 base64 (≤10KB)
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // 查询时默认不返回密码
  password: string;

  @Column({ default: true })
  isActive: boolean;

  /** Token版本号，用于单点登录控制 - 登录时递增使旧token失效 */
  @Column({ default: 0 })
  tokenVersion: number;

  /** 个人资料 JSON 字段：昵称、简介、头像等非关键可扩展信息 */
  @Column({
    type: 'simple-json',
    default: {},
  })
  profile: UserProfile;
}
