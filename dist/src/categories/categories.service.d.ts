import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../common/services/file-upload.service';
export declare class CategoriesService {
    private prisma;
    private fileUploadService;
    constructor(prisma: PrismaService, fileUploadService: FileUploadService);
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
