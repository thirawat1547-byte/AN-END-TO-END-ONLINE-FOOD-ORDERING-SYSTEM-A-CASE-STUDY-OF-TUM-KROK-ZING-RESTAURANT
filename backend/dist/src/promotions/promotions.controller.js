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
exports.PromotionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const promotions_service_1 = require("./promotions.service");
const create_promotion_dto_1 = require("./dto/create-promotion.dto");
const update_promotion_dto_1 = require("./dto/update-promotion.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PromotionsController = class PromotionsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    findAll() {
        return this.promotionsService.findAll();
    }
    findActive() {
        return this.promotionsService.findActive();
    }
    getMyPromotions(user) {
        const userId = user.userId || user.sub || user.user_id;
        return this.promotionsService.getMyPromotions(Number(userId));
    }
    claimPromotion(id, user) {
        const userId = user.userId || user.sub || user.user_id;
        return this.promotionsService.claimPromotion(Number(userId), id);
    }
    findByCode(code) {
        return this.promotionsService.findByCode(code);
    }
    findOne(id) {
        return this.promotionsService.findOne(id);
    }
    create(createDto) {
        return this.promotionsService.create(createDto);
    }
    update(id, updateDto) {
        return this.promotionsService.update(id, updateDto);
    }
    remove(id) {
        return this.promotionsService.remove(id);
    }
};
exports.PromotionsController = PromotionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายการโปรโมชันทั้งหมด (Admin/Staff)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายการโปรโมชันที่กำลังเปิดใช้งานอยู่ (สำหรับลูกค้า)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('my/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายการคูปองโปรโมชันที่ User คนนี้กดเก็บไว้' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "getMyPromotions", null);
__decorate([
    (0, common_1.Post)('claim/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'กดเก็บโค้ดส่วนลดเข้ากระเป๋าของ User ปัจจุบัน' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "claimPromotion", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'ตรวจสอบและดึงรายละเอียดโปรโมชันตามรหัสโค้ดส่วนลด' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายละเอียดโปรโมชันตาม ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'สร้างโปรโมชัน/โค้ดส่วนลดใหม่' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promotion_dto_1.CreatePromotionDto]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'แก้ไขข้อมูลโปรโมชัน หรือเปิด/ปิดการใช้งาน' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_promotion_dto_1.UpdatePromotionDto]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ลบโปรโมชันออกจากระบบ' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "remove", null);
exports.PromotionsController = PromotionsController = __decorate([
    (0, swagger_1.ApiTags)('Promotions'),
    (0, common_1.Controller)('promotions'),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsController);
//# sourceMappingURL=promotions.controller.js.map