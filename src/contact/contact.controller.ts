import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async submitContactForm(
    @Body()
    data: {
      name: string;
      email: string;
      subject?: string;
      message: string;
    },
  ): Promise<any> {
    return await this.contactService.handleContactSubmission(data);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getAllContacts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isRead') isRead?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;

    return await this.contactService.getAllContacts(
      pageNum,
      limitNum,
      isReadBool,
    );
  }

  @Get('admin/:id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getContactById(@Param('id') id: string) {
    return await this.contactService.getContactById(id);
  }

  @Patch('admin/:id/read')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async markAsRead(@Param('id') id: string) {
    return await this.contactService.markAsRead(id);
  }

  @Patch('admin/:id/unread')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async markAsUnread(@Param('id') id: string) {
    return await this.contactService.markAsUnread(id);
  }

  @Delete('admin/:id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async deleteContact(@Param('id') id: string) {
    return await this.contactService.deleteContact(id);
  }

  @Post('admin/:id/reply')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async replyToContact(
    @Param('id') id: string,
    @Body() data: { message: string; adminId: string },
  ) {
    return await this.contactService.replyToContact(
      id,
      data.adminId,
      data.message,
    );
  }
}
