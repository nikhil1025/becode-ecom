import { PrismaService } from '../prisma.service';
export declare class HomeService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomePageData(): Promise<any>;
    private getFeaturedProducts;
    private getPopularProducts;
    private getFeaturedCategories;
    private getNavigationTabs;
    private getHomepageConfigs;
}
