"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AddressesService = class AddressesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserAddresses(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            return await this.prisma.address.findMany({
                where: { userId },
                orderBy: [
                    { isDefault: 'desc' },
                    { createdAt: 'desc' },
                ],
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve addresses: ' + error.message);
        }
    }
    async getAddressById(userId, addressId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!addressId) {
                throw new common_1.BadRequestException('Address ID is required');
            }
            const address = await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found');
            }
            return address;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve address: ' + error.message);
        }
    }
    async createAddress(userId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!data.firstName || data.firstName.trim().length === 0) {
                throw new common_1.BadRequestException('First name is required');
            }
            if (!data.lastName || data.lastName.trim().length === 0) {
                throw new common_1.BadRequestException('Last name is required');
            }
            if (!data.addressLine1 || data.addressLine1.trim().length === 0) {
                throw new common_1.BadRequestException('Address line 1 is required');
            }
            if (!data.city || data.city.trim().length === 0) {
                throw new common_1.BadRequestException('City is required');
            }
            if (!data.state || data.state.trim().length === 0) {
                throw new common_1.BadRequestException('State is required');
            }
            if (!data.postalCode || data.postalCode.trim().length === 0) {
                throw new common_1.BadRequestException('Postal code is required');
            }
            if (!data.country || data.country.trim().length === 0) {
                throw new common_1.BadRequestException('Country is required');
            }
            if (data.isDefault) {
                await this.prisma.address.updateMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const address = await this.prisma.address.create({
                data: {
                    userId,
                    ...data,
                },
            });
            return address;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create address: ' + error.message);
        }
    }
    async updateAddress(userId, addressId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!addressId) {
                throw new common_1.BadRequestException('Address ID is required');
            }
            if (!data || Object.keys(data).length === 0) {
                throw new common_1.BadRequestException('Update data is required');
            }
            const address = await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found');
            }
            if (data.isDefault) {
                await this.prisma.address.updateMany({
                    where: { userId, isDefault: true, id: { not: addressId } },
                    data: { isDefault: false },
                });
            }
            const updatedAddress = await this.prisma.address.update({
                where: { id: addressId },
                data,
            });
            return updatedAddress;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update address: ' + error.message);
        }
    }
    async deleteAddress(userId, addressId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!addressId) {
                throw new common_1.BadRequestException('Address ID is required');
            }
            const address = await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found');
            }
            await this.prisma.address.delete({
                where: { id: addressId },
            });
            return { message: 'Address deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete address: ' + error.message);
        }
    }
    async setDefaultAddress(userId, addressId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!addressId) {
                throw new common_1.BadRequestException('Address ID is required');
            }
            const address = await this.prisma.address.findFirst({
                where: {
                    id: addressId,
                    userId,
                },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found');
            }
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            const updatedAddress = await this.prisma.address.update({
                where: { id: addressId },
                data: { isDefault: true },
            });
            return updatedAddress;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to set default address: ' + error.message);
        }
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map