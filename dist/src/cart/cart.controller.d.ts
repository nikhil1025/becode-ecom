import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: {
        user: {
            userId: string;
        };
    }): Promise<any>;
    getCartTotal(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        itemCount: number;
    }>;
    addItem(req: {
        user: {
            userId: string;
        };
    }, body: {
        productId: string;
        quantity: number;
        variantId?: string;
    }): Promise<any>;
    updateItem(req: {
        user: {
            userId: string;
        };
    }, itemId: string, body: {
        quantity: number;
    }): Promise<any>;
    removeItem(req: {
        user: {
            userId: string;
        };
    }, itemId: string): Promise<any>;
    clearCart(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        message: string;
    }>;
}
