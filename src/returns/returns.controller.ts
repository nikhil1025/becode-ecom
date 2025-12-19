import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums, ReturnStatus, ReturnType, User } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: User },
    @Body()
    body: {
      orderId: string;
      type: ReturnType;
      reason: string;
      items: Array<{
        orderItemId: string;
        quantity: number;
        exchangeProductId?: string;
      }>;
      comments?: string;
    },
  ) {
    return this.returnsService.create(
      req.user.id,
      body.orderId,
      body.type,
      body.reason,
      body.items,
      body.comments,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findByUser(@Request() req: { user: User }) {
    return this.returnsService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  findAll() {
    return this.returnsService.findAll();
  }

  @Put(':id/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ReturnStatus },
  ) {
    return this.returnsService.updateStatus(id, body.status);
  }
}
