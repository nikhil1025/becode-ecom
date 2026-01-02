import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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
          product: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update product average rating
      await this.updateProductRating(data.productId);

      // Send review submitted email
      if (review.user?.email) {
        this.mailService
          .sendReviewSubmittedEmail(review.user.email, {
            firstName: review.user.firstName || 'there',
            productName: review.product.name,
            rating: review.rating,
            reviewText: review.content,
          })
          .catch((err) =>
            console.error('Failed to send review submitted email:', err),
          );
      }

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
              variants: {
                take: 1,
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
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
          user: {
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      await this.updateProductRating(review.productId);

      // Send review status email
      if (
        review.user?.email &&
        (status === ReviewStatus.APPROVED || status === ReviewStatus.REJECTED)
      ) {
        this.mailService
          .sendReviewStatusEmail(review.user.email, {
            firstName: review.user.firstName || 'there',
            productName: review.product.name,
            status: status as 'APPROVED' | 'REJECTED',
            reason:
              status === ReviewStatus.REJECTED
                ? 'Does not meet community guidelines'
                : undefined,
          })
          .catch((err) =>
            console.error('Failed to send review status email:', err),
          );
      }

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

  // Product Variant Reviews
  async createVariantReview(
    userId: string,
    data: {
      variantId: string;
      rating: number;
      comment?: string;
      images?: string[];
    },
  ) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if variant exists
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Check if user has purchased this variant
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        variantId: data.variantId,
        order: {
          userId,
          status: { in: ['DELIVERED', 'CONFIRMED'] },
        },
      },
    });

    // Check if user already reviewed this variant
    const existingReview = await this.prisma.productVariantReview.findFirst({
      where: {
        userId,
        variantId: data.variantId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this product variant',
      );
    }

    return this.prisma.productVariantReview.create({
      data: {
        userId,
        variantId: data.variantId,
        rating: data.rating,
        comment: data.comment,
        images: data.images || [],
        isVerifiedPurchase: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        adminReply: true,
      },
    });
  }

  async getVariantReviews(
    variantId: string,
    options: {
      page?: number;
      limit?: number;
      rating?: number;
      sortBy?: 'recent' | 'rating';
    } = {},
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { variantId };
    if (options.rating) {
      where.rating = options.rating;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options.sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.productVariantReview.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          adminReply: true,
        },
      }),
      this.prisma.productVariantReview.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getVariantReviewStats(variantId: string) {
    const reviews = await this.prisma.productVariantReview.findMany({
      where: { variantId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  async updateVariantReview(
    reviewId: string,
    userId: string,
    data: {
      rating?: number;
      comment?: string;
      images?: string[];
    },
  ) {
    const review = await this.prisma.productVariantReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.productVariantReview.update({
      where: { id: reviewId },
      data: {
        ...(data.rating && { rating: data.rating }),
        ...(data.comment !== undefined && { comment: data.comment }),
        ...(data.images && { images: data.images }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        adminReply: true,
      },
    });
  }

  async deleteVariantReview(reviewId: string, userId: string) {
    const review = await this.prisma.productVariantReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.prisma.productVariantReview.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  // Admin functionality for variant reviews
  async getAllVariantReviews(
    options: {
      page?: number;
      limit?: number;
      variantId?: string;
      rating?: number;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.variantId) {
      where.variantId = options.variantId;
    }
    if (options.rating) {
      where.rating = options.rating;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.productVariantReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          adminReply: {
            include: {
              admin: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.productVariantReview.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createAdminReply(reviewId: string, adminId: string, replyText: string) {
    const review = await this.prisma.productVariantReview.findUnique({
      where: { id: reviewId },
      include: { adminReply: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.adminReply) {
      throw new BadRequestException(
        'Admin reply already exists for this review',
      );
    }

    return this.prisma.adminReviewReply.create({
      data: {
        reviewId,
        adminId,
        replyText,
        isVisible: true,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateAdminReply(
    replyId: string,
    data: {
      replyText?: string;
      isVisible?: boolean;
    },
  ) {
    const reply = await this.prisma.adminReviewReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundException('Admin reply not found');
    }

    return this.prisma.adminReviewReply.update({
      where: { id: replyId },
      data,
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteAdminReply(replyId: string) {
    const reply = await this.prisma.adminReviewReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundException('Admin reply not found');
    }

    await this.prisma.adminReviewReply.delete({
      where: { id: replyId },
    });

    return { message: 'Admin reply deleted successfully' };
  }

  async toggleReplyVisibility(replyId: string, isVisible: boolean) {
    return this.updateAdminReply(replyId, { isVisible });
  }
}
