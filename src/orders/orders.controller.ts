import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums, OrderStatus, PaymentStatus } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Request() req: { user: { userId: string } },
    @Body()
    body: {
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
        variantId?: string;
      }>;
      shippingAddress: any;
      billingAddress?: any;
    },
  ): Promise<any> {
    return this.ordersService.createOrder(req.user.userId, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Request() req: { user: { userId: string } },
  ): Promise<any[]> {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async getAllOrders(@Query('page') page = '1', @Query('limit') limit = '20') {
    console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);

    return this.ordersService.getAllOrders(Number(page), Number(limit));
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Request() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.ordersService.getOrderById(req.user.userId, orderId);
  }

  @Put(':orderId/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: OrderStatus },
  ): Promise<any> {
    return this.ordersService.updateOrderStatus(orderId, body.status);
  }

  @Put(':orderId/payment-status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() body: { paymentStatus: PaymentStatus },
  ): Promise<any> {
    return this.ordersService.updatePaymentStatus(orderId, body.paymentStatus);
  }

  @Put(':orderId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Request() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.ordersService.cancelOrder(req.user.userId, orderId);
  }

  @Get(':orderId/tracking')
  @UseGuards(JwtAuthGuard)
  async getOrderTracking(
    @Request() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.ordersService.getOrderTracking(req.user.userId, orderId);
  }

  @Post(':orderId/return')
  @UseGuards(JwtAuthGuard)
  async requestReturn(
    @Request() req: { user: { userId: string } },
    @Param('orderId') orderId: string,
    @Body() body: { reason: string; items?: string[] },
  ): Promise<any> {
    return this.ordersService.requestReturn(
      req.user.userId,
      orderId,
      body.reason,
      body.items,
    );
  }

  @Get('admin/returns')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async getAllReturns(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.ordersService.getAllReturns(Number(page), Number(limit));
  }

  @Put('admin/returns/:returnId/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async updateReturnStatus(
    @Param('returnId') returnId: string,
    @Body() body: { status: string },
  ): Promise<any> {
    return this.ordersService.updateReturnStatus(returnId, body.status);
  }
}
