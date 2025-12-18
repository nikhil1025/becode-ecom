import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums, ReviewStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviewsService.getProductReviews(
      productId,
      Number(page),
      Number(limit),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Request() req: { user: { userId: string } },
    @Body()
    body: {
      productId: string;
      rating: number;
      title: string;
      content: string;
    },
  ): Promise<any> {
    return this.reviewsService.createReview(req.user.userId, body);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(
    @Request() req: { user: { userId: string } },
  ): Promise<any[]> {
    return this.reviewsService.getUserReviews(req.user.userId);
  }

  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Request() req: { user: { userId: string } },
    @Param('reviewId') reviewId: string,
    @Body()
    body: {
      rating?: number;
      title?: string;
      content?: string;
    },
  ): Promise<any> {
    return this.reviewsService.updateReview(req.user.userId, reviewId, body);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Request() req: { user: { userId: string } },
    @Param('reviewId') reviewId: string,
  ): Promise<{ message: string }> {
    return this.reviewsService.deleteReview(req.user.userId, reviewId);
  }

  @Put(':reviewId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async updateReviewStatus(
    @Param('reviewId') reviewId: string,
    @Body() body: { status: ReviewStatus },
  ): Promise<any> {
    return this.reviewsService.updateReviewStatus(reviewId, body.status);
  }
}
