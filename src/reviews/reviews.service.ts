import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    userId: string,
    data: {
      productId: string;
      rating: number;
      title: string;
      content: string;
    },
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!data.productId) {
        throw new BadRequestException('Product ID is required');
      }
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
      if (!data.title || data.title.trim().length === 0) {
        throw new BadRequestException('Review title is required');
      }
      if (!data.content || data.content.trim().length === 0) {
        throw new BadRequestException('Review content is required');
      }

      // Check if user has purchased the product
      const purchase = await this.prisma.order.findFirst({
        where: {
          userId,
          items: {
            some: {
              productId: data.productId,
            },
          },
          status: 'DELIVERED',
        },
      });

      if (!purchase) {
        throw new BadRequestException(
          'You must purchase this product before reviewing it',
        );
      }

      // Check if user has already reviewed this product
      const existingReview = await this.prisma.review.findFirst({
        where: {
          userId,
          productId: data.productId,
        },
      });

      if (existingReview) {
        throw new ConflictException('You have already reviewed this product');
      }

      const review = await this.prisma.review.create({
        data: {
          userId,
          productId: data.productId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          status: ReviewStatus.PENDING,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update product average rating
      await this.updateProductRating(data.productId);

      return review;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create review: ' + error.message,
      );
    }
  }

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: any[]; pagination: any }> {
    try {
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }
      if (page < 1) {
        throw new BadRequestException('Page must be at least 1');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        this.prisma.review.findMany({
          where: {
            productId,
            status: ReviewStatus.APPROVED,
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.review.count({
          where: {
            productId,
            status: ReviewStatus.APPROVED,
          },
        }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve product reviews: ' + error.message,
      );
    }
  }

  async getUserReviews(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      return await this.prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve user reviews: ' + error.message,
      );
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      content?: string;
    },
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!reviewId) {
        throw new BadRequestException('Review ID is required');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Update data is required');
      }
      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const review = await this.prisma.review.findFirst({
        where: {
          id: reviewId,
          userId,
        },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      const updatedReview = await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          ...data,
          status: ReviewStatus.PENDING, // Reset to pending after edit
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await this.updateProductRating(review.productId);

      return updatedReview;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update review: ' + error.message,
      );
    }
  }

  async deleteReview(
    userId: string,
    reviewId: string,
  ): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!reviewId) {
        throw new BadRequestException('Review ID is required');
      }

      const review = await this.prisma.review.findFirst({
        where: {
          id: reviewId,
          userId,
        },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      await this.prisma.review.delete({
        where: { id: reviewId },
      });

      await this.updateProductRating(review.productId);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete review: ' + error.message,
      );
    }
  }

  async updateReviewStatus(
    reviewId: string,
    status: ReviewStatus,
  ): Promise<any> {
    try {
      if (!reviewId) {
        throw new BadRequestException('Review ID is required');
      }
      if (!status) {
        throw new BadRequestException('Review status is required');
      }

      const existingReview = await this.prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        throw new NotFoundException('Review not found');
      }

      const review = await this.prisma.review.update({
        where: { id: reviewId },
        data: { status },
        include: {
          product: true,
        },
      });

      await this.updateProductRating(review.productId);

      return review;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update review status: ' + error.message,
      );
    }
  }

  private async updateProductRating(productId: string): Promise<void> {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          productId,
          status: ReviewStatus.APPROVED,
        },
        select: {
          rating: true,
        },
      });

      if (reviews.length === 0) {
        await this.prisma.product.update({
          where: { id: productId },
          data: {
            averageRating: 0,
            reviewCount: 0,
          },
        });
        return;
      }

      const averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await this.prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length,
        },
      });
    } catch (error) {
      console.error('Failed to update product rating:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }
}
