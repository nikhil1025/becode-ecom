import { $Enums } from '@prisma/client';
import { SiteContentService } from './site-content.service';
export declare class SiteContentController {
    private readonly siteContentService;
    constructor(siteContentService: SiteContentService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ContentType;
        title: string;
        content: string;
    }[]>;
    findOne(type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ContentType;
        title: string;
        content: string;
    }>;
    update(type: string, body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: $Enums.ContentType;
        title: string;
        content: string;
    }>;
}
