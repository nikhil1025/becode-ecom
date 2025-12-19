import { PrismaService } from '../prisma.service';
import { JoinCommunityDto } from './dto/join-community.dto';
export declare class CommunityService {
    private prisma;
    constructor(prisma: PrismaService);
    join(dto: JoinCommunityDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }>;
    findAll(status?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }>;
    updateStatus(id: string, status: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }>;
    updateNotes(id: string, notes: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: string;
        notes: string | null;
        interest: string | null;
    }>;
}
