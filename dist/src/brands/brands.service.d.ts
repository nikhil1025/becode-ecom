import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../common/services/file-upload.service';
export declare class BrandsService {
    private prisma;
    private fileUploadService;
    constructor(prisma: PrismaService, fileUploadService: FileUploadService);
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
