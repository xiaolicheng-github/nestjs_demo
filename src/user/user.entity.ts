import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
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
}
