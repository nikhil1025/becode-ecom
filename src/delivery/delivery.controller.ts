import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { $Enums, TrackingStatus } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Delivery Agent Management (Admin only)
  @Post('agents')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  createAgent(
    @Body() body: { name: string; phone: string; vehicleInfo?: string },
  ) {
    return this.deliveryService.createAgent(
      body.name,
      body.phone,
      body.vehicleInfo,
    );
  }

  @Get('agents')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  findAllAgents() {
    return this.deliveryService.findAllAgents();
  }

  @Put('agents/:id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  updateAgent(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      vehicleInfo?: string;
      isActive?: boolean;
    },
  ) {
    return this.deliveryService.updateAgent(id, body);
  }

  // Order Tracking (Admin)
  @Post('orders/:orderId/assign')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  assignAgent(
    @Param('orderId') orderId: string,
    @Body() body: { agentId: string },
  ) {
    return this.deliveryService.assignAgent(orderId, body.agentId);
  }

  @Put('orders/:orderId/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  updateTrackingStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: TrackingStatus },
  ) {
    return this.deliveryService.updateTrackingStatus(orderId, body.status);
  }

  // Order Tracking (User)
  @Get('orders/:orderId/track')
  @UseGuards(JwtAuthGuard)
  getOrderTracking(@Param('orderId') orderId: string) {
    return this.deliveryService.getOrderTracking(orderId);
  }
}
