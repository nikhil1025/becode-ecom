import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async getUserAddresses(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      return await this.prisma.address.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' as const },
          { createdAt: 'desc' as const },
        ],
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve addresses: ' + error.message,
      );
    }
  }

  async getAddressById(userId: string, addressId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!addressId) {
        throw new BadRequestException('Address ID is required');
      }

      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return address;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve address: ' + error.message,
      );
    }
  }

  async createAddress(
    userId: string,
    data: {
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
    },
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!data.firstName || data.firstName.trim().length === 0) {
        throw new BadRequestException('First name is required');
      }
      if (!data.lastName || data.lastName.trim().length === 0) {
        throw new BadRequestException('Last name is required');
      }
      if (!data.addressLine1 || data.addressLine1.trim().length === 0) {
        throw new BadRequestException('Address line 1 is required');
      }
      if (!data.city || data.city.trim().length === 0) {
        throw new BadRequestException('City is required');
      }
      if (!data.state || data.state.trim().length === 0) {
        throw new BadRequestException('State is required');
      }
      if (!data.postalCode || data.postalCode.trim().length === 0) {
        throw new BadRequestException('Postal code is required');
      }
      if (!data.country || data.country.trim().length === 0) {
        throw new BadRequestException('Country is required');
      }

      // If this is the default address, unset other defaults
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create address: ' + error.message,
      );
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: {
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
    },
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!addressId) {
        throw new BadRequestException('Address ID is required');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Update data is required');
      }

      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // If this is being set as default, unset other defaults
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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update address: ' + error.message,
      );
    }
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!addressId) {
        throw new BadRequestException('Address ID is required');
      }

      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      await this.prisma.address.delete({
        where: { id: addressId },
      });

      return { message: 'Address deleted successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete address: ' + error.message,
      );
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!addressId) {
        throw new BadRequestException('Address ID is required');
      }

      const address = await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // Unset all defaults
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Set this as default
      const updatedAddress = await this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return updatedAddress;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to set default address: ' + error.message,
      );
    }
  }
}
