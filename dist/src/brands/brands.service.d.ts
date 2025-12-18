import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
export declare class BrandsService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: {
        name: string;
        slug: string;
        logo?: string;
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        slug?: string;
        logo?: string;
    }): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
    uploadLogo(file: Express.Multer.File): Promise<string>;
}
