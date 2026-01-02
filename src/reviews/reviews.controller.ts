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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { $Enums, ReviewStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { S3Service } from '../storage/s3.service';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly s3Service: S3Service,
  ) {}

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

  // Product Variant Reviews
  @Get('variant/:variantId')
  async getVariantReviews(
    @Param('variantId') variantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('rating') rating?: string,
    @Query('sortBy') sortBy?: 'recent' | 'rating',
  ) {
    return this.reviewsService.getVariantReviews(variantId, {
      page: Number(page),
      limit: Number(limit),
      rating: rating ? Number(rating) : undefined,
      sortBy,
    });
  }

  @Get('variant/:variantId/stats')
  async getVariantReviewStats(@Param('variantId') variantId: string) {
    return this.reviewsService.getVariantReviewStats(variantId);
  }

  @Post('variant')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  async createVariantReview(
    @Request() req: { user: { userId: string } },
    @Body()
    body: {
      variantId: string;
      rating: string;
      comment?: string;
    },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Upload images to S3 if provided
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const extension = file.originalname.split('.').pop() || 'jpg';
        const result = await this.s3Service.upload(
          file.buffer,
          'reviews',
          extension,
          file.mimetype,
        );
        imageUrls.push(result.url);
      }
    }

    return this.reviewsService.createVariantReview(req.user.userId, {
      variantId: body.variantId,
      rating: Number(body.rating),
      comment: body.comment,
      images: imageUrls,
    });
  }

  @Put('variant/:reviewId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  async updateVariantReview(
    @Request() req: { user: { userId: string } },
    @Param('reviewId') reviewId: string,
    @Body()
    body: {
      rating?: string;
      comment?: string;
    },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Upload new images to S3 if provided
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const extension = file.originalname.split('.').pop() || 'jpg';
        const result = await this.s3Service.upload(
          file.buffer,
          'reviews',
          extension,
          file.mimetype,
        );
        imageUrls.push(result.url);
      }
    }

    return this.reviewsService.updateVariantReview(reviewId, req.user.userId, {
      rating: body.rating ? Number(body.rating) : undefined,
      comment: body.comment,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    });
  }

  @Delete('variant/:reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteVariantReview(
    @Request() req: { user: { userId: string } },
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteVariantReview(reviewId, req.user.userId);
  }

  // Admin endpoints for variant reviews
  @Get('admin/variant-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async getAllVariantReviews(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('variantId') variantId?: string,
    @Query('rating') rating?: string,
  ) {
    return this.reviewsService.getAllVariantReviews({
      page: Number(page),
      limit: Number(limit),
      variantId,
      rating: rating ? Number(rating) : undefined,
    });
  }

  @Post('admin/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async createAdminReply(
    @Request() req: { user: { userId: string } },
    @Body() body: { reviewId: string; replyText: string },
  ) {
    return this.reviewsService.createAdminReply(
      body.reviewId,
      req.user.userId,
      body.replyText,
    );
  }

  @Put('admin/reply/:replyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async updateAdminReply(
    @Param('replyId') replyId: string,
    @Body() body: { replyText?: string; isVisible?: boolean },
  ) {
    return this.reviewsService.updateAdminReply(replyId, body);
  }

  @Delete('admin/reply/:replyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async deleteAdminReply(@Param('replyId') replyId: string) {
    return this.reviewsService.deleteAdminReply(replyId);
  }

  @Put('admin/reply/:replyId/toggle-visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async toggleReplyVisibility(
    @Param('replyId') replyId: string,
    @Body() body: { isVisible: boolean },
  ) {
    return this.reviewsService.toggleReplyVisibility(replyId, body.isVisible);
  }
}
