import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    getSubcategories(id: string): Promise<any[]>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        position?: number;
    }, image?: Express.Multer.File): Promise<any>;
    update(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        parentId?: string;
        position?: number;
    }, image?: Express.Multer.File): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
