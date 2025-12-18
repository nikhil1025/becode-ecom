export declare class LocalStorageService {
    private uploadDir;
    private baseUrl;
    constructor();
    private ensureUploadDir;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    uploadProductImage(productId: string, file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
}
