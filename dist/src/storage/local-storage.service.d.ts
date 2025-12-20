export declare class LocalStorageService {
    private uploadDir;
    private baseUrl;
    constructor();
    private ensureUploadDir;
    upload(buffer: Buffer, pathPrefix: string, extension?: string): Promise<{
        url: string;
        key: string;
    }>;
}
