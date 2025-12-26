-- VARIANT-FIRST MIGRATION
-- This migration moves price, stock, and images from Product to ProductVariant
-- Making ProductVariant the purchasable entity and Product a container only

-- Step 1: Add new columns to ProductVariant (if not exists)
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "sale_price" DOUBLE PRECISION;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "cost_price" DOUBLE PRECISION;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "low_stock_threshold" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "dimensions" JSONB;

-- Step 2: Create indexes on ProductVariant
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants"("product_id");
CREATE INDEX IF NOT EXISTS "product_variants_is_active_idx" ON "product_variants"("is_active");
CREATE INDEX IF NOT EXISTS "product_variants_stock_quantity_idx" ON "product_variants"("stock_quantity");

-- Step 3: Update ProductImage to reference ProductVariant instead of Product
-- First, add new column
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "variant_id" TEXT;

-- Add isPrimary column
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- Step 4: Make variantId mandatory in CartItem
-- First, ensure all cart items have a variantId (will be handled by migration script)
-- Then make it non-nullable
-- ALTER TABLE "cart_items" ALTER COLUMN "variant_id" SET NOT NULL;

-- Add unique constraint for cart items (one variant per cart)
-- CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");

-- Add indexes
CREATE INDEX IF NOT EXISTS "cart_items_cart_id_idx" ON "cart_items"("cart_id");
CREATE INDEX IF NOT EXISTS "cart_items_variant_id_idx" ON "cart_items"("variant_id");

-- Step 5: Make variantId mandatory in OrderItem
-- ALTER TABLE "order_items" ALTER COLUMN "variant_id" SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_items_variant_id_idx" ON "order_items"("variant_id");

-- Step 6: Remove price/stock columns from Product (AFTER data migration)
-- These will be removed after running the data migration script
-- ALTER TABLE "products" DROP COLUMN IF EXISTS "regular_price";
-- ALTER TABLE "products" DROP COLUMN IF EXISTS "sale_price";
-- ALTER TABLE "products" DROP COLUMN IF EXISTS "cost_price";
-- ALTER TABLE "products" DROP COLUMN IF EXISTS "stock_quantity";
-- ALTER TABLE "products" DROP COLUMN IF EXISTS "low_stock_threshold";

-- Step 7: Update ProductImage foreign key (AFTER data migration)
-- Drop old foreign key and add new one
-- ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_product_id_fkey";
-- ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" 
--   FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE;
-- ALTER TABLE "product_images" DROP COLUMN IF EXISTS "product_id";
-- ALTER TABLE "product_images" DROP COLUMN IF EXISTS "is_featured";

-- Add index on variant_id
CREATE INDEX IF NOT EXISTS "product_images_variant_id_idx" ON "product_images"("variant_id");

-- Step 8: Add additional indexes for performance
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products"("status");
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products"("category_id");

-- NOTE: The commented-out operations should be executed AFTER running the data migration script
-- to ensure no data loss. The migration script will:
-- 1. Create default variants for all products
-- 2. Copy price/stock data to variants
-- 3. Move images from products to variants
-- 4. Update cart and order items to reference variants
