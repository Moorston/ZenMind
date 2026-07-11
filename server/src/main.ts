import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatusInterceptor } from './interceptors/http-status.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthService } from '@/modules/auth/auth.service';

function parsePort(): number {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  return 3000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : true,
    credentials: true,
  });

  // Swagger API 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZenMind API')
    .setDescription('尘间静冥想应用 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 开发环境: 本地提供媒体文件 (http://localhost:3000/media/*)
  // 生产环境: 通过 TOS CDN 分发，设置 TOS_PUBLIC_URL 后自动切换
  const mediaDir = resolve(__dirname, '..', 'media');
  if (existsSync(mediaDir)) {
    app.use('/media', express.static(mediaDir, { maxAge: '1d' }));
    console.log(`📁 Serving local media from: ${mediaDir}`);
  } else {
    console.log(`ℹ️  No media directory found at ${mediaDir}. Create it and add course audio/cover files.`);
  }

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  // 启动时清理过期 session
  try {
    const authService = app.get(AuthService);
    authService.cleanupSessions();
  } catch (e) {
    console.warn('[Auth] Session cleanup skipped:', e);
  }

  const port = parsePort();
  try {
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 被占用! 请运行 'npx kill-port ${port}' 然后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

bootstrap();
