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
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwtSecret')!,
        signOptions: { expiresIn: configService.get<string>('app.jwtExpiresIn', '7d') as any },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get<number>('app.throttleTtl', 60000),
          limit: configService.get<number>('app.throttleLimit', 100),
        },
        {
          name: 'strict',
          ttl: configService.get<number>('app.strictThrottleTtl', 60000),
          limit: configService.get<number>('app.strictThrottleLimit', 10),
        },
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy],
  exports: [AuthService, ThrottlerModule],
})
export class AuthModule {}
