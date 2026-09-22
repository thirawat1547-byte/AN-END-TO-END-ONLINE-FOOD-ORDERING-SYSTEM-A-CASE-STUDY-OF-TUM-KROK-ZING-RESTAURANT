"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const swagger_1 = require("@nestjs/swagger");
const menus_service_1 = require("./menus.service");
const create_menu_dto_1 = require("./dto/create-menu.dto");
const update_menu_dto_1 = require("./dto/update-menu.dto");
let MenusController = class MenusController {
    constructor(menusService) {
        this.menusService = menusService;
    }
    uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('กรุณาเลือกไฟล์ภาพที่ต้องการอัปโหลด');
        }
        const fileUrl = `/uploads/${file.filename}`;
        return {
            success: true,
            url: fileUrl,
            filename: file.filename,
            size: file.size,
        };
    }
    create(createMenuDto) {
        return this.menusService.create(createMenuDto);
    }
    findAll(categoryId, isAvailable) {
        const parsedCatId = categoryId && !isNaN(Number(categoryId))
            ? parseInt(categoryId, 10)
            : undefined;
        const parsedAvailable = isAvailable !== undefined && isAvailable !== ''
            ? isAvailable === 'true'
            : undefined;
        return this.menusService.findAll(parsedCatId, parsedAvailable);
    }
    findOne(id) {
        return this.menusService.findOne(id);
    }
    update(id, updateMenuDto) {
        return this.menusService.update(id, updateMenuDto);
    }
    remove(id) {
        return this.menusService.remove(id);
    }
    updateIngredients(id, body) {
        return this.menusService.updateIngredients(id, body.ingredients || []);
    }
    saveIngredients(id, body) {
        return this.menusService.updateIngredients(id, body.ingredients || []);
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'อัปโหลดไฟล์ภาพเมนูอาหารตรง (Multer)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                cb(null, uploadsDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                cb(null, `menu-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new common_1.BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif, webp) เท่านั้น'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'เพิ่มเมนูอาหารใหม่' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'สร้างเมนูอาหารสำเร็จ' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'ดึงรายการอาหารทั้งหมด (กรองตามหมวดหมู่/สถานะขายได้)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'categoryId',
        required: false,
        type: Number,
        description: 'รหัสหมวดหมู่ที่ต้องการกรอง',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isAvailable',
        required: false,
        type: Boolean,
        description: 'กรองเฉพาะรายการที่พร้อมขาย (true/false)',
    }),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('isAvailable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายละเอียดเมนูอาหารตามรหัส (ID)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'พบข้อมูลเมนู' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'ไม่พบเมนูอาหาร' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'แก้ไขข้อมูลเมนูอาหาร' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_menu_dto_1.UpdateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ลบเมนูอาหารออกจากระบบ' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/ingredients'),
    (0, swagger_1.ApiOperation)({ summary: 'ผูกสูตรอาหาร / ปรับปรุงสัดส่วนวัตถุดิบ (Recipe Formulation)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "updateIngredients", null);
__decorate([
    (0, common_1.Post)(':id/ingredients'),
    (0, swagger_1.ApiOperation)({ summary: 'ผูกสูตรอาหาร / ปรับปรุงสัดส่วนวัตถุดิบ (Recipe Formulation)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "saveIngredients", null);
exports.MenusController = MenusController = __decorate([
    (0, swagger_1.ApiTags)('Menus'),
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map