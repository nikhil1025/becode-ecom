"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(userId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!data.productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            if (!data.rating || data.rating < 1 || data.rating > 5) {
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            }
            if (!data.title || data.title.trim().length === 0) {
                throw new common_1.BadRequestException('Review title is required');
            }
            if (!data.content || data.content.trim().length === 0) {
                throw new common_1.BadRequestException('Review content is required');
            }
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
                throw new common_1.BadRequestException('You must purchase this product before reviewing it');
            }
            const existingReview = await this.prisma.review.findFirst({
                where: {
                    userId,
                    productId: data.productId,
                },
            });
            if (existingReview) {
                throw new common_1.ConflictException('You have already reviewed this product');
            }
            const review = await this.prisma.review.create({
                data: {
                    userId,
                    productId: data.productId,
                    rating: data.rating,
                    title: data.title,
                    content: data.content,
                    status: client_1.ReviewStatus.PENDING,
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
            await this.updateProductRating(data.productId);
            return review;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create review: ' + error.message);
        }
    }
    async getProductReviews(productId, page = 1, limit = 10) {
        try {
            if (!productId) {
                throw new common_1.BadRequestException('Product ID is required');
            }
            if (page < 1) {
                throw new common_1.BadRequestException('Page must be at least 1');
            }
            if (limit < 1 || limit > 100) {
                throw new common_1.BadRequestException('Limit must be between 1 and 100');
            }
            const skip = (page - 1) * limit;
            const [reviews, total] = await Promise.all([
                this.prisma.review.findMany({
                    where: {
                        productId,
                        status: client_1.ReviewStatus.APPROVED,
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
                        status: client_1.ReviewStatus.APPROVED,
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve product reviews: ' + error.message);
        }
    }
    async getUserReviews(userId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve user reviews: ' + error.message);
        }
    }
    async updateReview(userId, reviewId, data) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!reviewId) {
                throw new common_1.BadRequestException('Review ID is required');
            }
            if (!data || Object.keys(data).length === 0) {
                throw new common_1.BadRequestException('Update data is required');
            }
            if (data.rating && (data.rating < 1 || data.rating > 5)) {
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            }
            const review = await this.prisma.review.findFirst({
                where: {
                    id: reviewId,
                    userId,
                },
            });
            if (!review) {
                throw new common_1.NotFoundException('Review not found');
            }
            const updatedReview = await this.prisma.review.update({
                where: { id: reviewId },
                data: {
                    ...data,
                    status: client_1.ReviewStatus.PENDING,
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update review: ' + error.message);
        }
    }
    async deleteReview(userId, reviewId) {
        try {
            if (!userId) {
                throw new common_1.BadRequestException('User ID is required');
            }
            if (!reviewId) {
                throw new common_1.BadRequestException('Review ID is required');
            }
            const review = await this.prisma.review.findFirst({
                where: {
                    id: reviewId,
                    userId,
                },
            });
            if (!review) {
                throw new common_1.NotFoundException('Review not found');
            }
            await this.prisma.review.delete({
                where: { id: reviewId },
            });
            await this.updateProductRating(review.productId);
            return { message: 'Review deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete review: ' + error.message);
        }
    }
    async updateReviewStatus(reviewId, status) {
        try {
            if (!reviewId) {
                throw new common_1.BadRequestException('Review ID is required');
            }
            if (!status) {
                throw new common_1.BadRequestException('Review status is required');
            }
            const existingReview = await this.prisma.review.findUnique({
                where: { id: reviewId },
            });
            if (!existingReview) {
                throw new common_1.NotFoundException('Review not found');
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update review status: ' + error.message);
        }
    }
    async updateProductRating(productId) {
        try {
            const reviews = await this.prisma.review.findMany({
                where: {
                    productId,
                    status: client_1.ReviewStatus.APPROVED,
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
            const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await this.prisma.product.update({
                where: { id: productId },
                data: {
                    averageRating: Math.round(averageRating * 10) / 10,
                    reviewCount: reviews.length,
                },
            });
        }
        catch (error) {
            console.error('Failed to update product rating:', error);
        }
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map