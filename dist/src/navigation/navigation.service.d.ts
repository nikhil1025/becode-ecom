import { PrismaService } from '../prisma.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
export declare class NavigationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNavigationDto): Promise<{
        url: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import("@prisma/client").$Enums.NavigationType;
        description: string | null;
        refId: string | null;
        label: string;
    }>;
    findAll(isActive?: boolean): Promise<{
        url: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import("@prisma/client").$Enums.NavigationType;
        description: string | null;
        refId: string | null;
        label: string;
    }[]>;
    findOne(id: string): Promise<{
        url: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import("@prisma/client").$Enums.NavigationType;
        description: string | null;
        refId: string | null;
        label: string;
    }>;
    update(id: string, dto: UpdateNavigationDto): Promise<{
        url: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import("@prisma/client").$Enums.NavigationType;
        description: string | null;
        refId: string | null;
        label: string;
    }>;
    remove(id: string): Promise<{
        url: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: import("@prisma/client").$Enums.NavigationType;
        description: string | null;
        refId: string | null;
        label: string;
    }>;
    reorder(items: {
        id: string;
        order: number;
    }[]): Promise<{
        message: string;
    }>;
}
