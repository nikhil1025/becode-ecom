import { PrismaService } from '../prisma.service';
import { AuditLogService } from '../common/audit-log.service';
export declare class HomepageConfigController {
    private prisma;
    private auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    getAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        metaTitle: string | null;
        metaDescription: string | null;
        isEnabled: boolean;
        sectionTitle: string | null;
        sectionSubtitle: string | null;
        sectionOrder: number;
        maxItems: number;
        customSettings: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    getByKey(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        metaTitle: string | null;
        metaDescription: string | null;
        isEnabled: boolean;
        sectionTitle: string | null;
        sectionSubtitle: string | null;
        sectionOrder: number;
        maxItems: number;
        customSettings: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    update(key: string, data: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        metaTitle: string | null;
        metaDescription: string | null;
        isEnabled: boolean;
        sectionTitle: string | null;
        sectionSubtitle: string | null;
        sectionOrder: number;
        maxItems: number;
        customSettings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    toggleVisibility(key: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        metaTitle: string | null;
        metaDescription: string | null;
        isEnabled: boolean;
        sectionTitle: string | null;
        sectionSubtitle: string | null;
        sectionOrder: number;
        maxItems: number;
        customSettings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    reorder(items: {
        id: string;
        order: number;
    }[], req: any): Promise<{
        success: boolean;
    }>;
}
