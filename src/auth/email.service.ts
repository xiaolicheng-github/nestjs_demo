import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/** 验证码存储（内存缓存，生产环境应使用 Redis） */
const codeCache = new Map<string, { code: string; expiresAt: number }>();

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.QQ_EMAIL || '',
        // 授权码请在 .env 文件中配置 QQ_EMAIL_AUTH_CODE
        pass: process.env.QQ_EMAIL_AUTH_CODE || '',
      },
    });
  }

  /** 生成6位随机验证码 */
  private generateCode(): string {
    return Math.random().toString().slice(-6);
  }

  /** 发送验证码 */
  async sendVerificationCode(email: string): Promise<void> {
    // 清理过期验证码
    this.cleanExpiredCodes();

    const code = this.generateCode();
    codeCache.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟有效
    });

    try {
      await this.transporter.sendMail({
        from: `"NestJS Demo" ${process.env.QQ_EMAIL}`,
        to: email,
        subject: '【NestJS Demo】注册验证码',
        html: `
          <div style="padding:20px;background:#f5f5f5;border-radius:8px;">
            <h2 style="color:#333;">您好！</h2>
            <p style="color:#666;font-size:16px;">您的注册验证码是：</p>
            <div style="background:#fff;padding:15px 30px;border-radius:6px;display:inline-block;margin:10px 0;">
              <span style="font-size:28px;font-weight:bold;color:#1890ff;letter-spacing:8px;">${code}</span>
            </div>
            <p style="color:#999;font-size:14px;">验证码5分钟内有效，请勿泄露给他人。</p>
          </div>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('邮件发送失败，请稍后重试');
    }
  }

  /** 验证验证码是否正确 */
  verifyCode(email: string, inputCode: string): boolean {
    const cached = codeCache.get(email);
    if (!cached) return false;
    if (Date.now() > cached.expiresAt) {
      codeCache.delete(email);
      return false;
    }
    if (cached.code !== inputCode) return false;
    // 验证成功后删除
    codeCache.delete(email);
    return true;
  }

  /** 清理过期验证码 */
  private cleanExpiredCodes(): void {
    const now = Date.now();
    for (const [key, value] of codeCache.entries()) {
      if (now > value.expiresAt) {
        codeCache.delete(key);
      }
    }
  }
}
