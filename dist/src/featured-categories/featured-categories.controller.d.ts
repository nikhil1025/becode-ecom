import { CreateFeaturedCategoryDto } from './dto/create-featured-category.dto';
import { UpdateFeaturedCategoryDto } from './dto/update-featured-category.dto';
import { FeaturedCategoriesService } from './featured-categories.service';
export declare class FeaturedCategoriesController {
    private readonly service;
    constructor(service: FeaturedCategoriesService);
    create(dto: CreateFeaturedCategoryDto): Promise<{
        category: {
            name: string;
            id: string;
            _count: {
                products: number;
            };
            slug: string;
            description: string | null;
            image: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        categoryId: string;
        priority: number;
    }>;
    findAll(isActive?: string): Promise<({
        category: {
            name: string;
            id: string;
            _count: {
                products: number;
            };
            slug: string;
            description: string | null;
            image: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        categoryId: string;
        priority: number;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            name: string;
            id: string;
            _count: {
                products: number;
            };
            slug: string;
            description: string | null;
            image: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        categoryId: string;
        priority: number;
    }>;
    update(id: string, dto: UpdateFeaturedCategoryDto): Promise<{
        category: {
            name: string;
            id: string;
            _count: {
                products: number;
            };
            slug: string;
            description: string | null;
            image: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        categoryId: string;
        priority: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        categoryId: string;
        priority: number;
    }>;
    reorder(items: {
        id: string;
        priority: number;
    }[]): Promise<{
        message: string;
    }>;
}
