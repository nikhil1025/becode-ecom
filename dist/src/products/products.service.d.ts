import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
export declare class ProductsService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    findAll(filters?: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        featured?: boolean;
    }): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<any>;
    uploadImages(productId: string, files: Express.Multer.File[]): Promise<any>;
    uploadProductImages(files: Express.Multer.File[]): Promise<string[]>;
}
