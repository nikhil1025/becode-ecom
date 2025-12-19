import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';
import { DeliveryModule } from './delivery/delivery.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './products/products.module';
import { ReturnsModule } from './returns/returns.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SiteContentModule } from './site-content/site-content.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { HomeModule } from './home/home.module';
import { FeaturedProductsModule } from './featured-products/featured-products.module';
import { PopularProductsModule } from './popular-products/popular-products.module';
import { FeaturedCategoriesModule } from './featured-categories/featured-categories.module';
import { NavigationModule } from './navigation/navigation.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    AddressesModule,
    CategoriesModule,
    BrandsModule,
    MailModule,
    ContactModule,
    PaymentsModule,
    SiteContentModule,
    ReturnsModule,
    DeliveryModule,
    HomeModule,
    FeaturedProductsModule,
    PopularProductsModule,
    FeaturedCategoriesModule,
    NavigationModule,
    NewsletterModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
