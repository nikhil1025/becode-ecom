import { AddressesService } from './addresses.service';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    getUserAddresses(req: {
        user: {
            userId: string;
        };
    }): Promise<any[]>;
    getAddressById(req: {
        user: {
            userId: string;
        };
    }, id: string): Promise<any>;
    createAddress(req: {
        user: {
            userId: string;
        };
    }, data: {
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
    updateAddress(req: {
        user: {
            userId: string;
        };
    }, id: string, data: {
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
    deleteAddress(req: {
        user: {
            userId: string;
        };
    }, id: string): Promise<{
        message: string;
    }>;
    setDefaultAddress(req: {
        user: {
            userId: string;
        };
    }, id: string): Promise<any>;
}
