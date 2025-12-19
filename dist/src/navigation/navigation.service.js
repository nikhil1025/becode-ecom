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
exports.NavigationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let NavigationService = class NavigationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.navigationTab.create({
            data: { ...dto, order: dto.order ?? 0, isActive: dto.isActive ?? true },
        });
    }
    async findAll(isActive) {
        return this.prisma.navigationTab.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            orderBy: { order: 'asc' },
        });
    }
    async findOne(id) {
        const nav = await this.prisma.navigationTab.findUnique({ where: { id } });
        if (!nav)
            throw new common_1.NotFoundException('Navigation tab not found');
        return nav;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.navigationTab.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.navigationTab.delete({ where: { id } });
    }
    async reorder(items) {
        const updates = items.map((item) => this.prisma.navigationTab.update({
            where: { id: item.id },
            data: { order: item.order },
        }));
        await this.prisma.$transaction(updates);
        return { message: 'Reordered successfully' };
    }
};
exports.NavigationService = NavigationService;
exports.NavigationService = NavigationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NavigationService);
//# sourceMappingURL=navigation.service.js.map