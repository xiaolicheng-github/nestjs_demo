import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 跳过标记了 @Public() 的路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 优先透传 Strategy 层显式抛出的错误
    if (err) {
      throw err;
    }
    if (!user) {
      const message =
        info?.name === 'JsonWebTokenError'
          ? `Token 无效 (${info.message})`
          : info?.name === 'TokenExpiredError'
            ? 'Token 已过期，请重新登录'
            : `登录已过期 (${info?.name ?? 'unknown'})`;
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
