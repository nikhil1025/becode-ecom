import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
export declare class CategoriesService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    getSubcategories(parentId: string): Promise<any[]>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
        image?: string;
        parentId?: string;
        position?: number;
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        image?: string;
        parentId?: string;
        position?: number;
    }): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
    uploadImage(file: Express.Multer.File): Promise<string>;
}
