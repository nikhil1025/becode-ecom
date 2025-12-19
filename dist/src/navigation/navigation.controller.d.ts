import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { NavigationService } from './navigation.service';
export declare class NavigationController {
    private readonly service;
    constructor(service: NavigationService);
    findAll(isActive?: string): Promise<{
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
}
export declare class NavigationAdminController {
    private readonly service;
    constructor(service: NavigationService);
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
    findAll(): Promise<{
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
