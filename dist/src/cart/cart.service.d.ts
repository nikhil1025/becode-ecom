import { PrismaService } from '../prisma.service';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<any>;
    addItem(userId: string, productId: string, quantity: number, variantId?: string): Promise<any>;
    updateItem(userId: string, itemId: string, quantity: number): Promise<any>;
    removeItem(userId: string, itemId: string): Promise<any>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    getCartTotal(userId: string): Promise<{
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        itemCount: number;
    }>;
}
