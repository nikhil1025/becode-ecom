import { PrismaService } from '../prisma.service';
export declare class AddressesService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserAddresses(userId: string): Promise<any[]>;
    getAddressById(userId: string, addressId: string): Promise<any>;
    createAddress(userId: string, data: {
        firstName: string;
        lastName: string;
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
        isDefault?: boolean;
    }): Promise<any>;
    updateAddress(userId: string, addressId: string, data: {
        firstName?: string;
        lastName?: string;
        company?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        phone?: string;
        isDefault?: boolean;
    }): Promise<any>;
    deleteAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
    setDefaultAddress(userId: string, addressId: string): Promise<any>;
}
