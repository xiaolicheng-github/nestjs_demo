import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/** 发送验证码 DTO */
export class SendCodeDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}

/** 注册 DTO */
export class RegisterDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;
}

/** 登录 DTO */
export class LoginDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

/** 修改密码 DTO */
export class ChangePasswordDto {
  @IsNotEmpty({ message: '原密码不能为空' })
  oldPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码至少6位' })
  newPassword: string;
}
