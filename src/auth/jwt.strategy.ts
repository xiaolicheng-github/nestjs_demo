import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly verifySecret: string;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET', 'nestjs-demo-secret-key-2024');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.verifySecret = secret;
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
      this.configService.get<string>('ENABLE_SSO') === 'true' &&
      payload.tv !== undefined &&
      payload.tv !== user.tokenVersion
    ) {
      throw new UnauthorizedException('账号已在其他设备登录，请重新登录');
    }

    return user;
  }
}
