-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bannerImage" TEXT,
    "offerText" TEXT,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION DEFAULT 0,
    "status" "CollectionStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_products" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_slug_idx" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE INDEX "collections_priority_idx" ON "collections"("priority");

-- CreateIndex
CREATE INDEX "collections_isDeleted_idx" ON "collections"("isDeleted");

-- CreateIndex
CREATE INDEX "collections_startDate_idx" ON "collections"("startDate");

-- CreateIndex
CREATE INDEX "collections_endDate_idx" ON "collections"("endDate");

-- CreateIndex
CREATE INDEX "collection_products_collectionId_idx" ON "collection_products"("collectionId");

-- CreateIndex
CREATE INDEX "collection_products_productId_idx" ON "collection_products"("productId");

-- CreateIndex
CREATE INDEX "collection_products_variantId_idx" ON "collection_products"("variantId");

-- CreateIndex
CREATE INDEX "collection_products_position_idx" ON "collection_products"("position");

-- CreateIndex
CREATE UNIQUE INDEX "collection_products_collectionId_productId_variantId_key" ON "collection_products"("collectionId", "productId", "variantId");

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
