import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'nestjs-demo-secret-key-2024',
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    name: string;
    tv?: number;
  }) {
    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 单点登录校验：token中的tv与数据库不一致说明已被新登录挤下线
    if (
      process.env.ENABLE_SSO === 'true' &&
      payload.tv !== undefined &&
      payload.tv !== user.tokenVersion
    ) {
      throw new UnauthorizedException('账号已在其他设备登录，请重新登录');
    }

    return user;
  }
}
