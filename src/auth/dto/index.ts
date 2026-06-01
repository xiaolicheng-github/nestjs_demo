import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

/** 重置密码 DTO */
export class ResetPasswordDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码至少6位' })
  password: string;
}

/** 更新个人资料 DTO */
export class UpdateProfileDto {
  /** 用户名（唯一） */
  @IsOptional()
  @IsString({ message: '用户名格式不正确' })
  name?: string;

  @IsOptional()
  @IsString({ message: '昵称格式不正确' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '简介格式不正确' })
  bio?: string;

  /** 头像 base64 字符串（data:image/...;base64,...） */
  @IsOptional()
  @IsString({ message: '头像格式不正确' })
  avatar?: string;
}
