import { PrismaService } from '../prisma.service';
import { CreateFeaturedCategoryDto } from './dto/create-featured-category.dto';
import { UpdateFeaturedCategoryDto } from './dto/update-featured-category.dto';
export declare class FeaturedCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(isActive?: boolean): Promise<({
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
