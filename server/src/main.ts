import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatusInterceptor } from './interceptors/http-status.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';

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

  const port = parsePort();
  try {
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
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
