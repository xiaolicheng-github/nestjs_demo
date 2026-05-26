# NestJS Demo 变更日志 & 问题知识库

> 每次重大变更后请在此文档追加记录，按时间倒序排列。

---

## 一、功能变更记录

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
