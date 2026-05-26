import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendCodeDto, RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 发送验证码 */
  @Post('send-code')
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

  /** 获取当前用户信息 */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
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
}
