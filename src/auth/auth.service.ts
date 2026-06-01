import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User, UserProfile } from '../user/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /** 发送验证码 */
  async sendCode(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (user) {
      throw new UnauthorizedException('该邮箱已注册');
    }
    await this.emailService.sendVerificationCode(email);
    return { message: '验证码已发送' };
  }

  /** 注册 */
  async register(email: string, code: string, name: string, password: string) {
    // 验证验证码
    const isValid = this.emailService.verifyCode(email, code);
    if (!isValid) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 检查邮箱是否已存在
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) {
      throw new UnauthorizedException('该邮箱已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepo.create({
      email,
      name,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    return { message: '注册成功' };
  }

  /** 登录 */
  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码（select:false 需要手动查询密码字段）
    const userWithPwd = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    const isMatch = await bcrypt.compare(password, userWithPwd!.password);
    if (!isMatch) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 单点登录：启用时递增 tokenVersion 使旧 token 失效
    if (this.configService.get<boolean>('app.enableSso')) {
      await this.userRepo.update(user.id, {
        tokenVersion: user.tokenVersion + 1,
      });
      userWithPwd!.tokenVersion += 1;
    }

    // 生成 JWT Token（包含 tokenVersion 用于 SSO 校验）
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tv: userWithPwd!.tokenVersion,
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  /** 获取当前用户信息 */
  async getUserInfo(userId: number) {
    return this.userRepo.findOneBy({ id: userId });
  }

  /** 修改密码 */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    // 查询当前用户（含密码字段）
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('原密码错误');
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { password: hashedPassword });

    // 如果启用了单点登录，同时更新 tokenVersion 使用户需重新登录
    if (this.configService.get<boolean>('app.enableSso')) {
      await this.userRepo.update(userId, {
        tokenVersion: user.tokenVersion + 1,
      });
    }

    return { message: '密码修改成功' };
  }

  /** 发送重置密码验证码（仅已注册用户） */
  async sendResetCode(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('该邮箱未注册');
    }
    await this.emailService.sendResetCode(email);
    return { message: '验证码已发送到您的邮箱' };
  }

  /** 通过邮箱验证码重置密码 */
  async resetPassword(email: string, code: string, password: string) {
    const isValid = this.emailService.verifyResetCode(email, code);
    if (!isValid) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('该邮箱未注册');
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepo.update(user.id, { password: hashedPassword });

    // 如果启用了单点登录，同时更新 tokenVersion 使旧 token 失效
    if (this.configService.get<boolean>('app.enableSso')) {
      await this.userRepo.update(user.id, {
        tokenVersion: user.tokenVersion + 1,
      });
    }

    return { message: '密码重置成功，请使用新密码登录' };
  }

  /** 获取用户完整信息（含 profile） */
  async getFullProfile(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('用户不存在');
    const { password: _, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return result;
  }

  /** 更新个人资料（用户名/昵称/简介/头像） */
  async updateProfile(
    userId: number,
    profileData: Partial<UserProfile> & { name?: string },
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('用户不存在');

    // 用户名唯一性检查
    if (profileData.name !== undefined && profileData.name !== user.name) {
      const existing = await this.userRepo.findOneBy({ name: profileData.name });
      if (existing) {
        throw new BadRequestException('该用户名已被占用');
      }
    }

    // 处理头像大小限制（≤10KB base64 内容）
    if (profileData.avatar) {
      const base64Content = profileData.avatar.split(',')[1];
      if (!base64Content) {
        throw new BadRequestException('头像格式无效，请上传有效图片');
      }
      const sizeInBytes = Buffer.byteLength(base64Content, 'base64');
      if (sizeInBytes > 10 * 1024) {
        throw new BadRequestException(
          `头像大小 ${Math.round(sizeInBytes / 1024)}KB 超过 10KB 限制，请压缩后重试`,
        );
      }
    }

    // 更新用户名
    if (profileData.name !== undefined && profileData.name !== user.name) {
      await this.userRepo.update(userId, { name: profileData.name });
    }

    // 合并现有 profile 与更新字段
    const currentProfile: UserProfile = user.profile || {};
    const updatedProfile: UserProfile = {
      ...currentProfile,
      // 只更新传入的字段，undefined 字段不覆盖
      ...(profileData.nickname !== undefined && { nickname: profileData.nickname }),
      ...(profileData.bio !== undefined && { bio: profileData.bio }),
      ...(profileData.avatar !== undefined && { avatar: profileData.avatar }),
    };

    await this.userRepo.update(userId, { profile: updatedProfile });

    const updatedUser = await this.userRepo.findOneBy({ id: userId });
    const { password: _, profile, ...basicInfo } = updatedUser!; // eslint-disable-line
    return { message: '资料更新成功', user: { ...basicInfo, profile } };
  }
}
