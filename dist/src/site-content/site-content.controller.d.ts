import { $Enums, ContentStatus } from '@prisma/client';
import { SiteContentService } from './site-content.service';
export declare class SiteContentController {
    private readonly siteContentService;
    constructor(siteContentService: SiteContentService);
    findBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }[]>;
    findOne(type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    create(req: {
        user: {
            userId: string;
            email: string;
        };
    }, body: {
        type: string;
        title: string;
        content: string;
        status?: ContentStatus;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    update(req: {
        user: {
            userId: string;
            email: string;
        };
    }, type: string, body: {
        title?: string;
        content?: string;
        status?: ContentStatus;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    publish(req: {
        user: {
            userId: string;
            email: string;
        };
    }, type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    unpublish(req: {
        user: {
            userId: string;
            email: string;
        };
    }, type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    delete(type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    findAllLegacy(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }[]>;
    findOneLegacy(type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    updateLegacy(type: string, body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: $Enums.ContentType;
        slug: string;
        status: $Enums.ContentStatus;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
}
