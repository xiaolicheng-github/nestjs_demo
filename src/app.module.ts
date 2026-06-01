import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CustomThrottlerGuard } from './common/throttler.guard';

@Module({
  imports: [
    // 加载 .env 文件 + 注册集中配置
    ConfigModule.forRoot({ isGlobal: true, load: [AppConfig] }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  // 注册自定义限流守卫，供 main.ts 全局使用
  providers: [AppService, CustomThrottlerGuard],
})
export class AppModule {}
