-- AlterTable
ALTER TABLE "return_items" ADD COLUMN     "exchange_variant_id" TEXT;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_exchange_product_id_fkey" FOREIGN KEY ("exchange_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
