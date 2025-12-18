import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(userId: string, data: {
        productId: string;
        rating: number;
        title: string;
        content: string;
    }): Promise<any>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        reviews: any[];
        pagination: any;
    }>;
    getUserReviews(userId: string): Promise<any[]>;
    updateReview(userId: string, reviewId: string, data: {
        rating?: number;
        title?: string;
        content?: string;
    }): Promise<any>;
    deleteReview(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
    updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<any>;
    private updateProductRating;
}
