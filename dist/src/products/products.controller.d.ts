import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(category?: string, minPrice?: string, maxPrice?: string, search?: string, featured?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: CreateProductDto, images?: Express.Multer.File[]): Promise<any>;
    update(id: string, data: UpdateProductDto, images?: Express.Multer.File[]): Promise<any>;
    delete(id: string): Promise<any>;
    uploadImages(id: string, files: Express.Multer.File[]): Promise<any>;
}
