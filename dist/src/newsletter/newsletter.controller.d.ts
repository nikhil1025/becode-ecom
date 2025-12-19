import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly service;
    constructor(service: NewsletterService);
    subscribe(dto: SubscribeNewsletterDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
}
export declare class NewsletterAdminController {
    private readonly service;
    constructor(service: NewsletterService);
    findAll(isActive?: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }[]>;
    remove(id: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
    toggleActive(id: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
}
