export declare class S3Service {
    private client;
    private bucket;
    constructor();
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
    uploadProductImage(productId: string, file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
}
