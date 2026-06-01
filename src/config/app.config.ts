import { registerAs } from '@nestjs/config';

/**
 * 集中管理所有环境变量配置
 * 所有模块统一从此文件获取配置，避免 process.env / configService.get 分散在各处
 *
 * 使用方式：
 * - 动态模块: inject: [ConfigService], 然后注入后调用 appConfig()
 * - 装饰器内: ConfigModule.forFeature(appConfig) 或直接 import 使用
 */
export const AppConfig = registerAs('app', () => ({
  // ==================== 服务基础配置 ====================
  port: +(process.env.PORT ?? 3000),

  // ==================== JWT 配置 ====================
  jwtSecret: process.env.JWT_SECRET || 'nestjs-demo-secret-key-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // ==================== QQ 邮箱 SMTP 配置 ====================
  qqEmail: process.env.QQ_EMAIL || '',
  qqEmailAuthCode: process.env.QQ_EMAIL_AUTH_CODE || '',

  // ==================== 单点登录配置 ====================
  enableSso: process.env.ENABLE_SSO === 'true',

  // ==================== IP 限流配置 ====================
  throttleTtl: +(process.env.THROTTLE_TTL || 60000),
  throttleLimit: +(process.env.THROTTLE_LIMIT || 100),
  strictThrottleTtl: +(process.env.STRICT_THROTTLE_TTL || 60000),
  strictThrottleLimit: +(process.env.STRICT_THROTTLE_LIMIT || 10),
}));

/** 配置项的 TypeScript 类型（供各模块使用） */
export type AppConfiguration = ReturnType<typeof AppConfig>;
