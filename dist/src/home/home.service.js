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
exports.HomeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let HomeService = class HomeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomePageData() {
        const [featuredProductsData, popularProductsData, featuredCategoriesData, navigationTabs, homepageConfigs,] = await Promise.all([
            this.getFeaturedProducts(),
            this.getPopularProducts(),
            this.getFeaturedCategories(),
            this.getNavigationTabs(),
            this.getHomepageConfigs(),
        ]);
        const response = {};
        if (featuredProductsData.length > 0) {
            const config = homepageConfigs.find((c) => c.key === 'featured_products');
            if (!config || config.isEnabled) {
                response.featuredProducts = {
                    items: featuredProductsData,
                    config: config || { sectionTitle: 'Featured Products', maxItems: 8 },
                };
            }
        }
        if (popularProductsData.length > 0) {
            const config = homepageConfigs.find((c) => c.key === 'popular_products');
            if (!config || config.isEnabled) {
                response.popularProducts = {
                    items: popularProductsData,
                    config: config || { sectionTitle: 'Popular Products', maxItems: 8 },
                };
            }
        }
        if (featuredCategoriesData.length > 0) {
            const config = homepageConfigs.find((c) => c.key === 'featured_categories');
            if (!config || config.isEnabled) {
                response.featuredCategories = {
                    items: featuredCategoriesData,
                    config: config || { sectionTitle: 'Shop by Category', maxItems: 6 },
                };
            }
        }
        if (navigationTabs.length > 0) {
            response.navigationTabs = navigationTabs;
        }
        const newsletterConfig = homepageConfigs.find((c) => c.key === 'newsletter');
        if (!newsletterConfig || newsletterConfig.isEnabled) {
            response.newsletterConfig = {
                isEnabled: true,
                title: newsletterConfig?.sectionTitle || 'Subscribe to Our Newsletter',
                subtitle: newsletterConfig?.sectionSubtitle ||
                    'Get the latest updates and offers',
            };
        }
        const communityConfig = homepageConfigs.find((c) => c.key === 'community');
        if (!communityConfig || communityConfig.isEnabled) {
            response.communityConfig = {
                isEnabled: true,
                title: communityConfig?.sectionTitle || 'Join Our Community',
                subtitle: communityConfig?.sectionSubtitle ||
                    'Connect with like-minded individuals',
            };
        }
        return response;
    }
    async getFeaturedProducts() {
        const featured = await this.prisma.featuredProduct.findMany({
            where: { isActive: true },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        stockQuantity: true,
                        averageRating: true,
                        reviewCount: true,
                        status: true,
                        images: {
                            where: { isFeatured: true },
                            take: 1,
                            select: { url: true, altText: true },
                        },
                        category: { select: { id: true, name: true, slug: true } },
                        brand: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
            take: 8,
        });
        return featured
            .filter((f) => f.product && f.product.status === 'PUBLISHED')
            .map((f) => ({
            id: f.product.id,
            name: f.product.name,
            slug: f.product.slug,
            price: f.product.regularPrice,
            salePrice: f.product.salePrice,
            discount: f.product.salePrice
                ? Math.round(((f.product.regularPrice - f.product.salePrice) /
                    f.product.regularPrice) *
                    100)
                : 0,
            thumbnail: f.product.images[0]?.url || null,
            thumbnailAlt: f.product.images[0]?.altText || f.product.name,
            stock: f.product.stockQuantity,
            averageRating: f.product.averageRating,
            reviewCount: f.product.reviewCount,
            category: f.product.category,
            brand: f.product.brand,
        }));
    }
    async getPopularProducts() {
        const popular = await this.prisma.popularProduct.findMany({
            where: { isActive: true },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        regularPrice: true,
                        salePrice: true,
                        stockQuantity: true,
                        averageRating: true,
                        reviewCount: true,
                        status: true,
                        images: {
                            where: { isFeatured: true },
                            take: 1,
                            select: { url: true, altText: true },
                        },
                        category: { select: { id: true, name: true, slug: true } },
                        brand: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
            take: 8,
        });
        return popular
            .filter((p) => p.product && p.product.status === 'PUBLISHED')
            .map((p) => ({
            id: p.product.id,
            name: p.product.name,
            slug: p.product.slug,
            price: p.product.regularPrice,
            salePrice: p.product.salePrice,
            discount: p.product.salePrice
                ? Math.round(((p.product.regularPrice - p.product.salePrice) /
                    p.product.regularPrice) *
                    100)
                : 0,
            thumbnail: p.product.images[0]?.url || null,
            thumbnailAlt: p.product.images[0]?.altText || p.product.name,
            stock: p.product.stockQuantity,
            averageRating: p.product.averageRating,
            reviewCount: p.product.reviewCount,
            category: p.product.category,
            brand: p.product.brand,
        }));
    }
    async getFeaturedCategories() {
        const featured = await this.prisma.featuredCategory.findMany({
            where: { isActive: true },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                        _count: { select: { products: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
            take: 6,
        });
        return featured.map((f) => ({
            id: f.category.id,
            name: f.category.name,
            slug: f.category.slug,
            description: f.category.description,
            image: f.category.image,
            productCount: f.category._count.products,
        }));
    }
    async getNavigationTabs() {
        return this.prisma.navigationTab.findMany({
            where: { isActive: true },
            select: {
                id: true,
                type: true,
                refId: true,
                label: true,
                url: true,
                order: true,
                description: true,
            },
            orderBy: { order: 'asc' },
        });
    }
    async getHomepageConfigs() {
        return this.prisma.homepageConfig.findMany({
            select: {
                key: true,
                isEnabled: true,
                sectionTitle: true,
                sectionSubtitle: true,
                sectionOrder: true,
                maxItems: true,
                metaTitle: true,
                metaDescription: true,
            },
        });
    }
};
exports.HomeService = HomeService;
exports.HomeService = HomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomeService);
//# sourceMappingURL=home.service.js.map