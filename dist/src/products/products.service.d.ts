import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../common/services/file-upload.service';
export declare class ProductsService {
    private prisma;
    private fileUploadService;
    constructor(prisma: PrismaService, fileUploadService: FileUploadService);
    findAll(filters?: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        featured?: boolean;
        page?: number;
        limit?: number;
    }): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
    uploadImages(productId: string, files: Express.Multer.File[]): Promise<any>;
    uploadProductImages(files: Express.Multer.File[]): Promise<string[]>;
    findBySlug(slug: string): Promise<any>;
    findAllAdmin(filters?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<any>;
    findDeletedProducts(): Promise<any[]>;
    restoreProduct(id: string): Promise<any>;
    forceDeleteProduct(id: string): Promise<{
        message: string;
    }>;
}
