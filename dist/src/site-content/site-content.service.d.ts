import { ContentType } from '@prisma/client';
import { PrismaService } from '../prisma.service';
export declare class SiteContentService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(type: ContentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContentType;
        title: string;
        content: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContentType;
        title: string;
        content: string;
    }[]>;
    upsert(type: ContentType, title: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContentType;
        title: string;
        content: string;
    }>;
}
