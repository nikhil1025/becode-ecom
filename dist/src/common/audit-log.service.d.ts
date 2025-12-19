import { PrismaService } from '../prisma.service';
interface AuditLogData {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    createLog(data: AuditLogData): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        changes: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    } | undefined>;
    getLogs(filters?: {
        userId?: string;
        entityType?: string;
        entityId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: {
            id: string;
            userId: string;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            changes: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export {};
