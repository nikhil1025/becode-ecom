import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(
    @Request() req: { user: { userId: string } },
  ): Promise<any[]> {
    return this.wishlistService.getUserWishlist(req.user.userId);
  }

  @Post(':productId')
  async addToWishlist(
    @Request() req: { user: { userId: string } },
    @Param('productId') productId: string,
  ): Promise<any> {
    return this.wishlistService.addToWishlist(req.user.userId, productId);
  }

  @Delete(':itemId')
  async removeFromWishlist(
    @Request() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
  ): Promise<{ message: string }> {
    return this.wishlistService.removeFromWishlist(req.user.userId, itemId);
  }

  @Delete()
  async clearWishlist(
    @Request() req: { user: { userId: string } },
  ): Promise<{ message: string }> {
    return this.wishlistService.clearWishlist(req.user.userId);
  }

  @Get('check/:productId')
  async checkWishlist(
    @Request() req: { user: { userId: string } },
    @Param('productId') productId: string,
  ): Promise<{ inWishlist: boolean }> {
    return this.wishlistService.isInWishlist(req.user.userId, productId);
  }
}
