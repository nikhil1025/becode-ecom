
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getUserWallet(@Request() req: { user: User }) {
    return this.walletService.getUserWalletDetails(req.user.id);
  }
}
