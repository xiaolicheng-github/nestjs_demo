import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { EmailService } from './email.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // 使用 registerAsync 确保 secret 在运行时动态读取，避免装饰器求值时序问题
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'nestjs-demo-secret-key-2024'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    // IP限流配置
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: +(process.env.THROTTLE_TTL || 60000),
        limit: +(process.env.THROTTLE_LIMIT || 100),
      },
      {
        name: 'strict',
        ttl: +(process.env.STRICT_THROTTLE_TTL || 60000),
        limit: +(process.env.STRICT_THROTTLE_LIMIT || 10),
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy],
  exports: [AuthService, ThrottlerModule],
})
export class AuthModule {}
