# NestJS Demo 变更日志 & 问题知识库

> 每次重大变更后请在此文档追加记录，按时间倒序排列。

---

## 一、功能变更记录

### 2026-06-01 - 用户名可编辑（唯一性约束）
- **涉及文件**: `user/user.entity.ts`、`auth/dto/index.ts`、`auth/auth.service.ts`、`auth/auth.controller.ts`、`frontend/src/api/auth.ts`、`frontend/src/views/ProfileView.tsx`
- **说明**:
  - User 实体 `name` 字段新增 `unique: true` 约束
  - `UpdateProfileDto` 新增可选字段 `name`
  - AuthService.updateProfile() 新增 name 唯一性校验：若新 name 与当前不同且已被占用则抛出 BadRequestException
  - 前端 ProfileView 将用户名从"账号信息"只读区移入可编辑表单（昵称上方），提交时一并传给后端
- **注意事项**: 修改 name 列加了 unique 约束，若数据库已有数据需删除 data.db 让 TypeORM 重建表

### 2026-06-01 - 验证码发送频率限制（三层防护）
- **涉及文件**: `auth/email.service.ts`、`auth/auth.controller.ts`
- **说明**: 前端已有 60 秒倒计时限制，现补齐后端防护：
  - **邮箱级冷却**（EmailService）：同一邮箱 60 秒内不允许重复发送验证码，超限返回剩余秒数；仅在邮件成功发送后才记录时间戳
  - **接口级限流**（@Throttle）：`send-code` 和 `forgot-password` 接口各限制 3次/分钟/IP
  - **IP 级全局限流**（CustomThrottlerGuard）：已存在，100次/分钟/IP
- **注意事项**: 冷却时间常量 `SEND_COOLDOWN_MS = 60000` 在 email.service.ts 顶部定义，可统一调整

### 2026-06-01 - 图片压缩库替换
- **涉及文件**: `frontend/src/utils/image.ts`、`frontend/package.json`
- **说明**: 将手动 Canvas 压缩实现替换为成熟的 [browser-image-compression](https://github.com/nicedoc/browser-image-compression) 库：
  - 自动处理分辨率缩放 + 质量递减的渐进式压缩
  - 启用 Web Worker 避免阻塞 UI 主线程
  - base64 → File → 库压缩 → File → base64 的转换流程
  - `getBase64Size()` 改用 TextEncoder.encode(atob()) 兼容浏览器环境
- **依赖安装命令**: `cd src/frontend && pnpm add browser-image-compression`

### 2026-05-26 - 项目初始状态
- **涉及文件**: 全部现有文件
- **说明**: 项目基线版本，包含以下核心能力：
  - `auth/` 模块：JWT 认证 + QQ邮箱验证码注册 + SSO 单点登录
  - `user/` 模块：用户 CRUD
  - `common/` 模块：@Public() 装饰器 + IP 限流守卫
  - `frontend/`：Vue 前端
  - SQLite 数据库 (better-sqlite3)，synchronize: true
- **注意事项**: 密码字段 select:false，查询时需用 createQueryBuilder().addSelect()

---

## 二、架构变更记录

*(暂无)*

---

## 三、问题记录 / 踩坑经验

#### SQLite `unrecognized token: "{"` 错误 (2026-06-01)
- **现象**: 启动 NestJS 服务时报错 `SqliteError: unrecognized token: "{"`，发生在 TypeORM synchronize 建表阶段
- **原因**: User 实体的 profile 字段使用了 `type: 'json'`，但 SQLite（better-sqlite3）不原生支持 JSON 列类型。TypeORM 生成建表 SQL 时包含 `json` 类型关键字，SQLite 无法解析
- **解决方案**: 将 `type: 'json'` 改为 `type: 'simple-json'` — 这是 TypeORM 为 SQLite 提供的兼容类型，自动处理 JSON 序列化/反序列化，无需手动写 transformer
- **预防**: 使用 SQLite 数据库时，JSON 类字段统一使用 `simple-json` 而非 `json`；修改列类型后需删除旧 data.db 让表结构重建

#### "登录已过期"误报问题 (2026-05-26)
- **现象**: 刚登录不到1分钟，访问修改密码页面就显示"登录已过期"
- **原因链路**:
  1. `.env` 配置了 `ENABLE_SSO=true`，SSO 校验逻辑在 `JwtStrategy.validate()` 中
  2. `JwtAuthGuard.handleRequest()` 原代码: `throw err || new UnauthorizedException('登录已过期')`
  3. 当 `validate()` 返回 falsy（非显式抛错）时，`err` 为空，**统一包装成"登录已过期"**，掩盖了真实原因
- **修复**:
  - 后端 `jwt-auth.guard.ts`: 区分 `JsonWebTokenError`(Token无效)、`TokenExpiredError`(Token过期)、其他(登录过期)，直接透传 Strategy 层抛出的具体错误
  - 前端 `api/index.ts`: 登录/注册/修改密码等接口加入白名单，401 不触发强制跳转
- **预防**: 守卫层不要用兜底消息覆盖底层具体错误信息，应逐级透传
