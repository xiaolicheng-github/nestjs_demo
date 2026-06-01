import { Controller, Post, Body, UseGuards, Req, Get, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SendCodeDto, RegisterDto, LoginDto, ChangePasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 发送验证码 */
  @Post('send-code')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Public()
  sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto.email);
  }

  /** 注册 */
  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.code,
      dto.name,
      dto.password,
    );
  }

  /** 登录 */
  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  /** 获取当前用户完整信息（含 profile） */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.getFullProfile(req.user.id);
  }

  /** 更新个人资料（昵称/简介/头像） */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  /** 修改密码 */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  /** 发送重置密码验证码 */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Public()
  forgotPassword(@Body() dto: SendCodeDto) {
    return this.authService.sendResetCode(dto.email);
  }

  /** 验证验证码并重置密码 */
  @Post('reset-password')
  @Public()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.password);
  }
}
