import { ContentStatus, ContentType } from '@prisma/client';
import { PrismaService } from '../prisma.service';
export declare class SiteContentService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitizeHtml;
    private generateSlug;
    findBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    findOne(type: ContentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }[]>;
    create(type: ContentType, title: string, content: string, status: ContentStatus, lastUpdatedBy: string | null, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    update(type: ContentType, data: {
        title?: string;
        content?: string;
        status?: ContentStatus;
        lastUpdatedBy?: string;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    upsert(type: ContentType, title: string, content: string, status?: ContentStatus, lastUpdatedBy?: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    publish(type: ContentType, lastUpdatedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    unpublish(type: ContentType, lastUpdatedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    delete(type: ContentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.ContentType;
        slug: string;
        status: import("@prisma/client").$Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
}
