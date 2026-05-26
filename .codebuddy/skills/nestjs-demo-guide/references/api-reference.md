# API 路由参考

> 基础路径: `/api/v1`

## 认证模块 (auth)

| 方法 | 路径 | 鉴权 | 功能 | 请求体 |
|------|------|------|------|--------|
| POST | /auth/send-code | @Public | 发送注册验证码 | `{ email }` |
| POST | /auth/register | @Public | 注册(需验证码) | `{ email, code, name, password }` |
| POST | /auth/login | @Public | 登录 | `{ email, password }` |
| GET | /auth/profile | JWT | 获取当前用户信息 | - |
| POST | /auth/change-password | JWT | 修改密码 | `{ oldPassword, newPassword }` |

**登录响应格式**:
```json
{
  "access_token": "jwt_string",
  "user": { "id": 1, "email": "...", "name": "..." }
}
```

## 用户模块 (users)

| 方法 | 路径 | 功能 | 请求体 |
|------|------|------|--------|
| GET | /users | 查询所有用户 | - |
| GET | /users/:id | 查询单个用户 | - |
| POST | /users | 创建用户 | `{ name, email }` |
| PUT | /users/:id | 更新用户 | `{ name, email }` |
| DELETE | /users/:id | 删除用户 | - |

## 代码规范

### 新增 DTO
- 文件位置: `src/auth/dto/index.ts`
- 使用 class-validator 装饰器: `@IsEmail`, `@IsNotEmpty`, `@IsString`, `@MinLength`
- 自定义中文错误 message

### 新增公开路由
- 在 Controller 方法上添加 `@Public()` 装饰器（从 `src/common/public.decorator` 导入）

### 数据库操作
- 实体文件: `src/user/` 或新建模块的 `*.entity.ts`
- Repository 注入: `@InjectRepository(Entity) private repo: Repository<Entity>`
- 密码字段: 始终标记 `select: false`，查询时用 `createQueryBuilder().addSelect()`

### 环境变量配置
- 配置文件: `demo.env` (.gitignore 保护)
- ConfigModule 已全局注册，直接使用 `process.env.XXX` 或注入 `ConfigService`

### SSO 单点登录机制
1. 设置环境变量 `ENABLE_SSO=true`
2. 登录时: `tokenVersion++` 并写入 JWT payload (`tv` 字段)
3. 校验时: JwtStrategy 对比 payload.tv 与数据库 tokenVersion，不一致则拒绝
4. 改密时: 同步递增 tokenVersion 强制重新登录
