import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

/** 注册验证码存储 */
const codeCache = new Map<string, { code: string; expiresAt: number }>();

/** 重置密码验证码存储（与注册分离，避免冲突） */
const resetCodeCache = new Map<string, { code: string; expiresAt: number }>();

/** 邮箱发送冷却时间（毫秒）- 同一邮箱 60 秒内不允许重复发送 */
const SEND_COOLDOWN_MS = 60 * 1000;

/** 注册验证码发送时间戳记录 */
const sendVerificationTimestamp = new Map<string, number>();

/** 重置密码验证码发送时间戳记录 */
const sendResetTimestamp = new Map<string, number>();

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('app.qqEmail'),
        pass: this.configService.get<string>('app.qqEmailAuthCode'),
      },
    });
  }

  /** 生成6位随机验证码 */
  private generateCode(): string {
    return Math.random().toString().slice(-6);
  }

  /** 发送验证码 */
  async sendVerificationCode(email: string): Promise<void> {
    // 冷却时间检查
    const lastSent = sendVerificationTimestamp.get(email);
    if (lastSent && Date.now() - lastSent < SEND_COOLDOWN_MS) {
      const remaining = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      throw new BadRequestException(`验证码发送过于频繁，请 ${remaining} 秒后重试`);
    }

    this.cleanExpiredCodes();

    const code = this.generateCode();
    codeCache.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    try {
      await this.transporter.sendMail({
        from: `"NestJS Demo" ${this.configService.get<string>('app.qqEmail')}`,
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
    // 记录发送时间戳（成功后才记录，失败不计入冷却）
    sendVerificationTimestamp.set(email, Date.now());
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
    codeCache.delete(email);
    return true;
  }

  /** 发送重置密码验证码（仅已注册用户可发送） */
  async sendResetCode(email: string): Promise<void> {
    // 冷却时间检查
    const lastSent = sendResetTimestamp.get(email);
    if (lastSent && Date.now() - lastSent < SEND_COOLDOWN_MS) {
      const remaining = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      throw new BadRequestException(`验证码发送过于频繁，请 ${remaining} 秒后重试`);
    }

    this.cleanExpiredResetCodes();

    const code = this.generateCode();
    resetCodeCache.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

    try {
      await this.transporter.sendMail({
        from: `"NestJS Demo" ${this.configService.get<string>('app.qqEmail')}`,
        to: email,
        subject: '【NestJS Demo】密码重置验证码',
        html: `
          <div style="padding:20px;background:#f5f5f5;border-radius:8px;">
            <h2 style="color:#333;">您好！</h2>
            <p style="color:#666;font-size:16px;">您的密码重置验证码是：</p>
            <div style="background:#fff;padding:15px 30px;border-radius:6px;display:inline-block;margin:10px 0;">
              <span style="font-size:28px;font-weight:bold;color:#e74c3c;letter-spacing:8px;">${code}</span>
            </div>
            <p style="color:#999;font-size:14px;">验证码5分钟内有效，请勿泄露给他人。</p>
          </div>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('邮件发送失败，请稍后重试');
    }
    // 记录发送时间戳（成功后才记录，失败不计入冷却）
    sendResetTimestamp.set(email, Date.now());
  }

  /** 验证重置密码验证码是否正确 */
  verifyResetCode(email: string, inputCode: string): boolean {
    const cached = resetCodeCache.get(email);
    if (!cached) return false;
    if (Date.now() > cached.expiresAt) {
      resetCodeCache.delete(email);
      return false;
    }
    if (cached.code !== inputCode) return false;
    resetCodeCache.delete(email);
    return true;
  }

  /** 清理过期注册验证码 */
  private cleanExpiredCodes(): void {
    const now = Date.now();
    for (const [key, value] of codeCache.entries()) {
      if (now > value.expiresAt) {
        codeCache.delete(key);
      }
    }
  }

  /** 清理过期重置密码验证码 */
  private cleanExpiredResetCodes(): void {
    const now = Date.now();
    for (const [key, value] of resetCodeCache.entries()) {
      if (now > value.expiresAt) {
        resetCodeCache.delete(key);
      }
    }
  }
}
