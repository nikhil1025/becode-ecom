/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId,variantId]` on the table `wishlist_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "wishlist_items_userId_productId_key";

-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "variantId" TEXT;

-- CreateIndex
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

-- CreateIndex
CREATE INDEX "wishlist_items_variantId_idx" ON "wishlist_items"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_productId_variantId_key" ON "wishlist_items"("userId", "productId", "variantId");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
