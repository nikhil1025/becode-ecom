import { CreatePopularProductDto } from './dto/create-popular-product.dto';
import { UpdatePopularProductDto } from './dto/update-popular-product.dto';
import { PopularProductsService } from './popular-products.service';
export declare class PopularProductsController {
    private readonly service;
    constructor(service: PopularProductsService);
    create(dto: CreatePopularProductDto): Promise<{
        product: {
            name: string;
            id: string;
            slug: string;
            regularPrice: number;
            salePrice: number | null;
            images: {
                url: string;
                id: string;
                createdAt: Date;
                isFeatured: boolean;
                productId: string;
                position: number;
                altText: string | null;
            }[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
        score: number;
    }>;
    findAll(isActive?: string): Promise<({
        product: {
            category: {
                name: string;
            };
            brand: {
                name: string;
            } | null;
            name: string;
            id: string;
            slug: string;
            regularPrice: number;
            salePrice: number | null;
            status: import("@prisma/client").$Enums.ProductStatus;
            images: {
                url: string;
                id: string;
                createdAt: Date;
                isFeatured: boolean;
                productId: string;
                position: number;
                altText: string | null;
            }[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
        score: number;
    })[]>;
    findOne(id: string): Promise<{
        product: {
            name: string;
            id: string;
            slug: string;
            regularPrice: number;
            salePrice: number | null;
            status: import("@prisma/client").$Enums.ProductStatus;
            images: {
                url: string;
                id: string;
                createdAt: Date;
                isFeatured: boolean;
                productId: string;
                position: number;
                altText: string | null;
            }[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
        score: number;
    }>;
    update(id: string, dto: UpdatePopularProductDto): Promise<{
        product: {
            name: string;
            id: string;
            slug: string;
            regularPrice: number;
            salePrice: number | null;
            images: {
                url: string;
                id: string;
                createdAt: Date;
                isFeatured: boolean;
                productId: string;
                position: number;
                altText: string | null;
            }[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
        score: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
        score: number;
    }>;
    reorder(items: {
        id: string;
        priority: number;
    }[]): Promise<{
        message: string;
    }>;
}
