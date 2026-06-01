import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { CustomThrottlerGuard } from './common/throttler.guard';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局 API 前缀 /api/v1
  app.setGlobalPrefix('api/v1');

  // 全局参数验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局 IP 限流防护 - 防止恶意攻击（短时间同一IP请求过多）
  const throttlerGuard = app.get(CustomThrottlerGuard);
  app.useGlobalGuards(throttlerGuard);

  // 启用 CORS（前端开发需要）
  app.enableCors();

  // 静态文件服务 - 前端构建产物（与后端合并到同一 dist 目录）
  const publicDir = path.resolve(__dirname, 'public');
  app.useStaticAssets(publicDir);

  // SPA fallback: 非 API 路由且静态文件不存在时，回退到 index.html
  // 保证前端 Vue Router 的路由正常工作
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  const PORT = +(process.env.PORT ?? '3000');
  await app.listen(PORT);
  console.log(`Server running at http://localhost:${PORT}`);
}
bootstrap();
