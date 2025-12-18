import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getUserAddresses(
    @Request() req: { user: { userId: string } },
  ): Promise<any[]> {
    return this.addressesService.getUserAddresses(req.user.userId);
  }

  @Get(':id')
  async getAddressById(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ): Promise<any> {
    return this.addressesService.getAddressById(req.user.userId, id);
  }

  @Post()
  async createAddress(
    @Request() req: { user: { userId: string } },
    @Body()
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
    return this.addressesService.createAddress(req.user.userId, data);
  }

  @Put(':id')
  async updateAddress(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body()
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
    return this.addressesService.updateAddress(req.user.userId, id, data);
  }

  @Delete(':id')
  async deleteAddress(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.addressesService.deleteAddress(req.user.userId, id);
  }

  @Put(':id/default')
  async setDefaultAddress(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ): Promise<any> {
    return this.addressesService.setDefaultAddress(req.user.userId, id);
  }
}
