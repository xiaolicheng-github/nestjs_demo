import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';

/**
 * 自定义限流守卫 - 继承 @nestjs/throttler 基类
 * 使用 IP 作为限流标识，防止恶意攻击（短时间同一IP请求过多）
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    readonly options: ThrottlerOptions[],
    storageService: ThrottlerStorageService,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  async getTracker(req: Record<string, any>): Promise<string> {
    // 使用 IP 作为限流标识（支持反向代理场景）
    const ip =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      'unknown';
    return ip;
  }
}
