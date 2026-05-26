---
name: nestjs-demo-guide
description: >
  This skill provides comprehensive project knowledge for the nestjs_demo project,
  a NestJS 11 + SQLite + Vue full-stack application with JWT authentication and
  email verification. Use this skill whenever working on code changes, adding features,
  debugging, or understanding the architecture of this project.
---

# NestJS Demo 项目开发指南

## 项目概览

| 属性 | 值 |
|------|-----|
| 框架 | NestJS 11 + TypeScript |
| 数据库 | SQLite (better-sqlite3), 文件: `data.db`, synchronize: true |
| ORM | TypeORM |
| 认证 | JWT (passport-jwt) + 邮箱验证码 (nodemailer/QQ SMTP) |
| 前端 | Vue + Vite (`src/frontend/`) |
| 包管理器 | pnpm |

## 全局约定

- **API 前缀**: 所有路由在 `/api/v1` 下
- **全局管道**: ValidationPipe (whitelist + transform + forbidNonWhitelisted)
- **CORS**: 已启用
- **鉴权机制**: 默认所有路由需 JWT，用 `@Public()` 装饰器标记公开路由
- **IP 限流**: CustomThrottlerGuard，基于 IP 限流

## 模块结构

### auth/ - 认证模块

**功能**: 登录、注册(邮箱验证码)、获取用户信息、修改密码、SSO 单点登录

**关键文件**:
- `auth.controller.ts` - 路由定义
- `auth.service.ts` - 业务逻辑 (JWT签发/校验, bcrypt密码处理)
- `email.service.ts` - QQ邮箱SMTP发送验证码，内存缓存5分钟有效
- `jwt.strategy.ts` - JWT策略，含SSO tokenVersion校验
- `jwt-auth.guard.ts` - JWT守卫，跳过 @Public() 路由
- `dto/index.ts` - DTO验证类: SendCodeDto, RegisterDto, LoginDto, ChangePasswordDto

**环境变量**: `JWT_SECRET`, `ENABLE_SSO` (SSO开关), `QQ_EMAIL`, `QQ_EMAIL_AUTH_CODE`

### user/ - 用户模块

**功能**: CRUD 操作

**实体字段** (user.entity.ts):
- `id` (number, 自增主键)
- `name` (string, max 50)
- `email` (string, unique)
- `password` (string, select: false - 查询时默认不返回)
- `isActive` (boolean, default true)
- `tokenVersion` (number, default 0 - SSO版本控制)

### common/ - 公共模块

- `public.decorator.ts` - `@Public()` 元数据装饰器，标记公开接口
- `throttler.guard.ts` - IP限流守卫，支持 x-forwarded-for

## 开发命令

```bash
pnpm run start:dev      # 开发模式 (watch)
pnpm run build          # 构建
pnpm run build:frontend # 仅构建前端
pnpm run build:all      # 构建前后端
pnpm run test           # 单元测试
pnpm run lint           # ESLint
```

## 参考文档

详细的 API 路由表和代码规范见 `references/api-reference.md`。
