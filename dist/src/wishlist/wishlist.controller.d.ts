import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getWishlist(req: {
        user: {
            userId: string;
        };
    }): Promise<any[]>;
    addToWishlist(req: {
        user: {
            userId: string;
        };
    }, productId: string): Promise<any>;
    removeFromWishlist(req: {
        user: {
            userId: string;
        };
    }, itemId: string): Promise<{
        message: string;
    }>;
    clearWishlist(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        message: string;
    }>;
    checkWishlist(req: {
        user: {
            userId: string;
        };
    }, productId: string): Promise<{
        inWishlist: boolean;
    }>;
}
