import { PrismaService } from '../prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserWishlist(userId: string): Promise<any[]>;
    addToWishlist(userId: string, productId: string): Promise<any>;
    removeFromWishlist(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    clearWishlist(userId: string): Promise<{
        message: string;
    }>;
    isInWishlist(userId: string, productId: string): Promise<{
        inWishlist: boolean;
    }>;
}
