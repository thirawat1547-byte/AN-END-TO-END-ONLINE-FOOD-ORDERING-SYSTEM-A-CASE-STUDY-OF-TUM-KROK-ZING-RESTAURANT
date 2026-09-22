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
exports.IngredientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ingredients_service_1 = require("./ingredients.service");
const create_ingredient_dto_1 = require("./dto/create-ingredient.dto");
const update_ingredient_dto_1 = require("./dto/update-ingredient.dto");
let IngredientsController = class IngredientsController {
    constructor(ingredientsService) {
        this.ingredientsService = ingredientsService;
    }
    findAll() {
        return this.ingredientsService.findAll();
    }
    translateAllToThai() {
        return this.ingredientsService.translateAllToThai();
    }
    findOne(id) {
        return this.ingredientsService.findOne(id);
    }
    create(createDto) {
        return this.ingredientsService.create(createDto);
    }
    update(id, updateDto) {
        return this.ingredientsService.update(id, updateDto);
    }
    remove(id) {
        return this.ingredientsService.remove(id);
    }
};
exports.IngredientsController = IngredientsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายการวัตถุดิบและจำนวนคงเหลือทั้งหมด' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('translate-thai'),
    (0, swagger_1.ApiOperation)({ summary: 'แปลงชื่อและหน่วยวัตถุดิบทั้งหมดในฐานข้อมูลเป็นภาษาไทย' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "translateAllToThai", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ดูรายละเอียดวัตถุดิบตาม ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'เพิ่มวัตถุดิบใหม่เข้าสต็อก' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ingredient_dto_1.CreateIngredientDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'อัปเดตจำนวนสต็อกหรือข้อมูลวัตถุดิบ' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_ingredient_dto_1.UpdateIngredientDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'ลบวัตถุดิบออกจากระบบ' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "remove", null);
exports.IngredientsController = IngredientsController = __decorate([
    (0, swagger_1.ApiTags)('Ingredients'),
    (0, common_1.Controller)('ingredients'),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
//# sourceMappingURL=ingredients.controller.js.map