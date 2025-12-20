export declare class S3Service {
    private client;
    private bucket;
    constructor();
    upload(buffer: Buffer, pathPrefix: string, extension: string, mimetype: string): Promise<{
        url: string;
        key: string;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        key: string;
    }>;
}
