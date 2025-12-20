import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RefundsService } from './refunds.service';
import { ExecuteRefundDto } from './dto/execute-refund.dto';

@Controller('refunds')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  getAllRefunds(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.refundsService.getAllRefunds(pageNum, limitNum);
  }

  @Get('pending')
  findPendingRefunds() {
    return this.refundsService.findPendingRefunds();
  }

  @Post('execute')
  executeRefund(@Body() executeRefundDto: ExecuteRefundDto, @Request() req) {
    // Extract admin userId from JWT
    const adminUserId = req.user?.userId || req.user?.id;
    return this.refundsService.executeRefund({
      ...executeRefundDto,
      adminUserId,
    });
  }
}
