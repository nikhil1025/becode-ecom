import { ReviewStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getProductReviews(productId: string, page?: string, limit?: string): Promise<{
        reviews: any[];
        pagination: any;
    }>;
    createReview(req: {
        user: {
            userId: string;
        };
    }, body: {
        productId: string;
        rating: number;
        title: string;
        content: string;
    }): Promise<any>;
    getUserReviews(req: {
        user: {
            userId: string;
        };
    }): Promise<any[]>;
    updateReview(req: {
        user: {
            userId: string;
        };
    }, reviewId: string, body: {
        rating?: number;
        title?: string;
        content?: string;
    }): Promise<any>;
    deleteReview(req: {
        user: {
            userId: string;
        };
    }, reviewId: string): Promise<{
        message: string;
    }>;
    updateReviewStatus(reviewId: string, body: {
        status: ReviewStatus;
    }): Promise<any>;
}
