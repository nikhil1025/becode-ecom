"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../common/common.module");
const mail_module_1 = require("../mail/mail.module");
const prisma_service_1 = require("../prisma.service");
const storage_module_1 = require("../storage/storage.module");
const wallet_module_1 = require("../wallet/wallet.module");
const returns_controller_1 = require("./returns.controller");
const returns_service_1 = require("./returns.service");
let ReturnsModule = class ReturnsModule {
};
exports.ReturnsModule = ReturnsModule;
exports.ReturnsModule = ReturnsModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, storage_module_1.StorageModule, wallet_module_1.WalletModule, mail_module_1.MailModule],
        controllers: [returns_controller_1.ReturnsController, returns_controller_1.UserReturnsController],
        providers: [returns_service_1.ReturnsService, prisma_service_1.PrismaService],
    })
], ReturnsModule);
//# sourceMappingURL=returns.module.js.map