"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../prisma.service");
const s3_service_1 = require("../storage/s3.service");
const admin_auth_controller_1 = require("./admin-auth.controller");
const admin_jwt_strategy_1 = require("./admin-jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const google_strategy_1 = require("./google.strategy");
const jwt_strategy_1 = require("./jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = configService.get('JWT_SECRET') ||
                        'your-super-secret-jwt-key-change-this-in-production';
                    return {
                        secret,
                        signOptions: { expiresIn: '7d' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            admin_jwt_strategy_1.AdminJwtStrategy,
            google_strategy_1.GoogleStrategy,
            prisma_service_1.PrismaService,
            s3_service_1.S3Service,
        ],
        controllers: [auth_controller_1.AuthController, admin_auth_controller_1.AdminAuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map