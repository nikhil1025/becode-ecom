import { ProductStatus } from '@prisma/client';
declare class ProductImageDto {
    url: string;
    alt?: string;
    isPrimary?: boolean;
}
declare class ProductVariantDto {
    sku: string;
    name: string;
    price: number;
    stock: number;
    attributes?: Record<string, any>;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    sku: string;
    regularPrice: number;
    salePrice?: number;
    stock: number;
    categoryId?: string;
    brandId?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    status?: ProductStatus;
    images?: ProductImageDto[];
    variants?: ProductVariantDto[];
    specifications?: Record<string, any>;
    tags?: string[];
}
export declare class UpdateProductDto {
    name?: string;
    slug?: string;
    shortDescription?: string;
    description?: string;
    sku?: string;
    regularPrice?: number;
    salePrice?: number;
    stock?: number;
    categoryId?: string;
    brandId?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    status?: ProductStatus;
    images?: ProductImageDto[];
    variants?: ProductVariantDto[];
    specifications?: Record<string, any>;
    tags?: string[];
}
export {};
