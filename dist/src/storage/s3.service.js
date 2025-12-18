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
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let S3Service = class S3Service {
    client;
    bucket;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: process.env.AWS_S3_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
        this.bucket = process.env.AWS_S3_BUCKET || '';
    }
    async uploadAvatar(userId, file) {
        try {
            const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
            const key = `avatars/${userId}/${(0, crypto_1.randomUUID)()}.${ext}`;
            await this.client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype || 'image/png',
            }));
            const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
            const url = baseUrl
                ? `${baseUrl}/${key}`
                : `https://${this.bucket}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
            return { url, key };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload avatar');
        }
    }
    async uploadProductImage(productId, file) {
        try {
            console.log('S3 Upload attempt:', {
                bucket: this.bucket,
                region: process.env.AWS_S3_REGION,
                productId,
                fileSize: file.size,
                hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
            });
            const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
            const key = `products/${productId}/${(0, crypto_1.randomUUID)()}.${ext}`;
            await this.client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype || 'image/png',
            }));
            const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
            const url = baseUrl
                ? `${baseUrl}/${key}`
                : `https://${this.bucket}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
            return { url, key };
        }
        catch (error) {
            console.error('S3 Upload error details:', {
                message: error.message,
                code: error.code,
                statusCode: error.$metadata?.httpStatusCode,
                requestId: error.$metadata?.requestId,
            });
            throw new common_1.InternalServerErrorException('Failed to upload product image: ' + error.message);
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map