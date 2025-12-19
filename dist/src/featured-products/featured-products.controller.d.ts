import { CreateFeaturedProductDto } from './dto/create-featured-product.dto';
import { UpdateFeaturedProductDto } from './dto/update-featured-product.dto';
import { FeaturedProductsService } from './featured-products.service';
export declare class FeaturedProductsController {
    private readonly service;
    constructor(service: FeaturedProductsService);
    create(dto: CreateFeaturedProductDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateFeaturedProductDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        productId: string;
        priority: number;
    }>;
    reorder(items: {
        id: string;
        priority: number;
    }[]): Promise<{
        message: string;
    }>;
}
