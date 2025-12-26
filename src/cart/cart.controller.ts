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
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: { user: { userId: string } }): Promise<any> {
    return this.cartService.getCart(req.user.userId);
  }

  @Get('total')
  async getCartTotal(@Request() req: { user: { userId: string } }): Promise<{
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  }> {
    return this.cartService.getCartTotal(req.user.userId);
  }

  @Post('items')
  async addItem(
    @Request() req: { user: { userId: string } },
    @Body() body: { productId: string; quantity: number; variantId: string },
  ): Promise<any> {
    return this.cartService.addItem(
      req.user.userId,
      body.productId,
      body.quantity,
      body.variantId,
    );
  }

  @Put('items/:itemId')
  async updateItem(
    @Request() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ): Promise<any> {
    return this.cartService.updateItem(req.user.userId, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  async removeItem(
    @Request() req: { user: { userId: string } },
    @Param('itemId') itemId: string,
  ): Promise<any> {
    return this.cartService.removeItem(req.user.userId, itemId);
  }

  @Delete()
  async clearCart(
    @Request() req: { user: { userId: string } },
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(req.user.userId);
  }
}
