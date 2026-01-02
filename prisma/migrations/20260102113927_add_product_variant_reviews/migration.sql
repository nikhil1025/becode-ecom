-- CreateTable
CREATE TABLE "product_variant_reviews" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "images" TEXT[],
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_review_replies" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "replyText" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_variant_reviews_variantId_idx" ON "product_variant_reviews"("variantId");

-- CreateIndex
CREATE INDEX "product_variant_reviews_userId_idx" ON "product_variant_reviews"("userId");

-- CreateIndex
CREATE INDEX "product_variant_reviews_rating_idx" ON "product_variant_reviews"("rating");

-- CreateIndex
CREATE INDEX "product_variant_reviews_createdAt_idx" ON "product_variant_reviews"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_review_replies_reviewId_key" ON "admin_review_replies"("reviewId");

-- CreateIndex
CREATE INDEX "admin_review_replies_reviewId_idx" ON "admin_review_replies"("reviewId");

-- CreateIndex
CREATE INDEX "admin_review_replies_adminId_idx" ON "admin_review_replies"("adminId");

-- AddForeignKey
ALTER TABLE "product_variant_reviews" ADD CONSTRAINT "product_variant_reviews_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_reviews" ADD CONSTRAINT "product_variant_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_review_replies" ADD CONSTRAINT "admin_review_replies_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "product_variant_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_review_replies" ADD CONSTRAINT "admin_review_replies_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
