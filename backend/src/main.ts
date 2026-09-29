import 'dotenv/config';
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. ตั้งค่า Session สำหรับ OAuth State Verification (Google, Facebook, LINE)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'tumkrokzing_oauth_session_secret_2026',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // ตั้งเป็น true เมื่อรันบน HTTPS ในโหมด Production
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  // 2. ตั้งค่า CORS เพื่อรองรับ Frontend (Vue.js)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Global Prefix (เรียก API ด้วย /api/v1/...)
  app.setGlobalPrefix('api/v1');


  // 3. Validation Pipe ตรวจสอบ Request Body อัตโนมัติ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // [แนะนำเสริม] ช่วยแปลง Type ของ @Query อัตโนมัติ (เช่น string เป็น number)
      },
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
    .addTag('Menus', 'ระบบจัดการเมนูและหมวดหมู่อาหาร')
    .addTag('Orders', 'ระบบสั่งอาหารและการจัดการสถานะออร์เดอร์')
    .addTag('Tables', 'ระบบจัดการโต๊ะภายในร้าน')
    .addTag('Transactions', 'ระบบการชำระเงินและปิดบิล')
    .addTag('Ingredients', 'ระบบจัดการสต็อกวัตถุดิบห้องครัว')
    .addTag('Promotions', 'ระบบโปรโมชันและโค้ดส่วนลด')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 5000;
  // [แนะนำเสริม] ใส่ '0.0.0.0' เพื่อให้ Docker Container รับการเชื่อมต่อจากภายนอกได้อย่างสมบูรณ์
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 เซิร์ฟเวอร์ทำงานที่: http://localhost:${port}/api/v1`);
  logger.log(`📑 เข้าชม Swagger UI ได้ที่: http://localhost:${port}/api/docs`);
}

bootstrap();