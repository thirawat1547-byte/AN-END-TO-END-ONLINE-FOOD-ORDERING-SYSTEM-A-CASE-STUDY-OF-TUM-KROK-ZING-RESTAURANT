"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Tum Krok Zing Restaurant API')
        .setDescription('เอกสาร OpenAPI และจุดทดสอบระบบสั่งอาหารออนไลน์ร้านตำครกซิ่ง')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'กรอก JWT Token สำหรับยืนยันตัวตน',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Auth', 'ระบบยืนยันตัวตนและการเข้าสู่ระบบ')
        .addTag('Users', 'การจัดการข้อมูลผู้ใช้')
        .addTag('Menus', 'ระบบจัดการเมนูและหมวดหมู่อาหาร')
        .addTag('Orders', 'ระบบสั่งอาหารและการจัดการสถานะออร์เดอร์')
        .addTag('Tables', 'ระบบจัดการโต๊ะภายในร้าน')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map