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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePromotionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePromotionDto {
}
exports.CreatePromotionDto = CreatePromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ZING50', description: 'รหัสโค้ดโปรโมชัน (ไม่ซ้ำ)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'FIXED',
        description: 'ประเภทส่วนลด (PERCENTAGE หรือ FIXED)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "discount_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'มูลค่าส่วนลด (เปอร์เซ็นต์หรือบาท)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "discount_value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300, description: 'ยอดสั่งซื้อขั้นต่ำที่ใช้ได้', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "min_order_price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-31T23:59:59Z', description: 'วันหมดอายุโปรโมชัน' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "expiry_date", void 0);
//# sourceMappingURL=create-promotion.dto.js.map