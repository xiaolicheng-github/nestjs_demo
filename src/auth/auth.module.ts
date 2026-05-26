import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { EmailService } from './email.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nestjs-demo-secret-key-2024',
      signOptions: { expiresIn: '7d' }, // Token 有效期 7 天
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
