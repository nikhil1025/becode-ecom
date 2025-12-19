-- CreateEnum
CREATE TYPE "NavigationType" AS ENUM ('CATEGORY', 'PAGE', 'CUSTOM');

-- CreateTable
CREATE TABLE "featured_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popular_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "popular_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_categories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_tabs" (
    "id" TEXT NOT NULL,
    "type" "NavigationType" NOT NULL,
    "refId" TEXT,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interest" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sectionTitle" TEXT,
    "sectionSubtitle" TEXT,
    "sectionOrder" INTEGER NOT NULL DEFAULT 0,
    "maxItems" INTEGER NOT NULL DEFAULT 8,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "customSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "featured_products_priority_idx" ON "featured_products"("priority");

-- CreateIndex
CREATE INDEX "featured_products_isActive_idx" ON "featured_products"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "featured_products_productId_key" ON "featured_products"("productId");

-- CreateIndex
CREATE INDEX "popular_products_priority_idx" ON "popular_products"("priority");

-- CreateIndex
CREATE INDEX "popular_products_isActive_idx" ON "popular_products"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "popular_products_productId_key" ON "popular_products"("productId");

-- CreateIndex
CREATE INDEX "featured_categories_priority_idx" ON "featured_categories"("priority");

-- CreateIndex
CREATE INDEX "featured_categories_isActive_idx" ON "featured_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "featured_categories_categoryId_key" ON "featured_categories"("categoryId");

-- CreateIndex
CREATE INDEX "navigation_tabs_order_idx" ON "navigation_tabs"("order");

-- CreateIndex
CREATE INDEX "navigation_tabs_isActive_idx" ON "navigation_tabs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "community_members_email_idx" ON "community_members"("email");

-- CreateIndex
CREATE INDEX "community_members_status_idx" ON "community_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_config_key_key" ON "homepage_config"("key");

-- CreateIndex
CREATE INDEX "homepage_config_key_idx" ON "homepage_config"("key");

-- CreateIndex
CREATE INDEX "homepage_config_sectionOrder_idx" ON "homepage_config"("sectionOrder");

-- AddForeignKey
ALTER TABLE "featured_products" ADD CONSTRAINT "featured_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popular_products" ADD CONSTRAINT "popular_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_categories" ADD CONSTRAINT "featured_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
