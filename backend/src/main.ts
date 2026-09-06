// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. ตั้งค่า CORS เพื่อรองรับ Frontend (Vue.js)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Global Prefix (เรียก API ด้วย /api/v1/...)
  app.setGlobalPrefix('api/v1');

  // 3. Validation Pipe ตรวจสอบ Request Body อัตโนมัติ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Swagger OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Tum Krok Zing Restaurant API')
    .setDescription('เอกสาร OpenAPI และจุดทดสอบระบบสั่งอาหารออนไลน์ร้านตำครกซิ่ง')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'กรอก JWT Token สำหรับยืนยันตัวตน',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'ระบบยืนยันตัวตนและการเข้าสู่ระบบ')
    .addTag('Users', 'การจัดการข้อมูลผู้ใช้')
    .addTag('Menus', 'ระบบจัดการเมนูและหมวดหมู่อาหาร')
    .addTag('Orders', 'ระบบสั่งอาหารและการจัดการสถานะออร์เดอร์')
    .addTag('Tables', 'ระบบจัดการโต๊ะภายในร้าน')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 เซิร์ฟเวอร์ทำงานที่: http://localhost:${port}/api/v1`);
  logger.log(`📑 เข้าชม Swagger UI ได้ที่: http://localhost:${port}/api/docs`);
}

bootstrap();