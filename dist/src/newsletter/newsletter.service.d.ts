import { PrismaService } from '../prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
export declare class NewsletterService {
    private prisma;
    constructor(prisma: PrismaService);
    subscribe(dto: SubscribeNewsletterDto): Promise<{
        name: string | null;
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
    findAll(isActive?: boolean): Promise<{
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
