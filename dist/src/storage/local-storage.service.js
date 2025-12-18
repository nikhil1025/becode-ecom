"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let LocalStorageService = class LocalStorageService {
    uploadDir;
    baseUrl;
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'products'), {
                recursive: true,
            });
            await fs.mkdir(path.join(this.uploadDir, 'brands'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'categories'), {
                recursive: true,
            });
        }
        catch (error) {
            console.error('Failed to create upload directories:', error);
        }
    }
    async uploadAvatar(userId, file) {
        try {
            const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
            const filename = `${userId}-${(0, crypto_1.randomUUID)()}.${ext}`;
            const key = `avatars/${filename}`;
            const filePath = path.join(this.uploadDir, key);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file.buffer);
            const url = `${this.baseUrl}/uploads/${key}`;
            return { url, key };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload avatar: ' + error.message);
        }
    }
    async uploadProductImage(productId, file) {
        try {
            const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
            const filename = `${(0, crypto_1.randomUUID)()}.${ext}`;
            const key = `products/${productId}/${filename}`;
            const filePath = path.join(this.uploadDir, key);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file.buffer);
            const url = `${this.baseUrl}/uploads/${key}`;
            return { url, key };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload product image: ' + error.message);
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map