import { BrandsService } from './brands.service';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: {
        name: string;
        slug: string;
    }, logo?: Express.Multer.File): Promise<any>;
    update(id: string, data: {
        name?: string;
        slug?: string;
    }, logo?: Express.Multer.File): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
