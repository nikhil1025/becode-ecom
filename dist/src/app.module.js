"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const addresses_module_1 = require("./addresses/addresses.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const brands_module_1 = require("./brands/brands.module");
const cart_module_1 = require("./cart/cart.module");
const categories_module_1 = require("./categories/categories.module");
const contact_module_1 = require("./contact/contact.module");
const delivery_module_1 = require("./delivery/delivery.module");
const mail_module_1 = require("./mail/mail.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const prisma_service_1 = require("./prisma.service");
const products_module_1 = require("./products/products.module");
const returns_module_1 = require("./returns/returns.module");
const reviews_module_1 = require("./reviews/reviews.module");
const site_content_module_1 = require("./site-content/site-content.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const home_module_1 = require("./home/home.module");
const featured_products_module_1 = require("./featured-products/featured-products.module");
const popular_products_module_1 = require("./popular-products/popular-products.module");
const featured_categories_module_1 = require("./featured-categories/featured-categories.module");
const navigation_module_1 = require("./navigation/navigation.module");
const newsletter_module_1 = require("./newsletter/newsletter.module");
const community_module_1 = require("./community/community.module");
const wallet_module_1 = require("./wallet/wallet.module");
const refunds_module_1 = require("./refunds/refunds.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            reviews_module_1.ReviewsModule,
            wishlist_module_1.WishlistModule,
            addresses_module_1.AddressesModule,
            categories_module_1.CategoriesModule,
            brands_module_1.BrandsModule,
            mail_module_1.MailModule,
            contact_module_1.ContactModule,
            payments_module_1.PaymentsModule,
            site_content_module_1.SiteContentModule,
            returns_module_1.ReturnsModule,
            delivery_module_1.DeliveryModule,
            home_module_1.HomeModule,
            featured_products_module_1.FeaturedProductsModule,
            popular_products_module_1.PopularProductsModule,
            featured_categories_module_1.FeaturedCategoriesModule,
            navigation_module_1.NavigationModule,
            newsletter_module_1.NewsletterModule,
            community_module_1.CommunityModule,
            wallet_module_1.WalletModule,
            refunds_module_1.RefundsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map