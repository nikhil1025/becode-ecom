import { AuditLogService } from '../common/audit-log.service';
export declare class AuditLogController {
    private auditLog;
    constructor(auditLog: AuditLogService);
    getLogs(userId?: string, entityType?: string, entityId?: string, page?: string, limit?: string): Promise<{
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
