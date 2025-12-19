import { CommunityService } from './community.service';
import { JoinCommunityDto } from './dto/join-community.dto';
export declare class CommunityController {
    private readonly service;
    constructor(service: CommunityService);
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
}
export declare class CommunityAdminController {
    private readonly service;
    constructor(service: CommunityService);
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
