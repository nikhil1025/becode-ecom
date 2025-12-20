/*
  Warnings:

  - Added the required column `orderId` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderItemId` to the `refunds` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('BANK', 'WALLET', 'ORIGINAL');

-- AlterEnum
ALTER TYPE "OrderItemStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- AlterEnum - Add new enum values  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REQUESTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReturnStatus')) THEN
    ALTER TYPE "ReturnStatus" ADD VALUE 'REQUESTED';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'UNDER_REVIEW' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReturnStatus')) THEN
    ALTER TYPE "ReturnStatus" ADD VALUE 'UNDER_REVIEW';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ACCEPTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReturnStatus')) THEN
    ALTER TYPE "ReturnStatus" ADD VALUE 'ACCEPTED';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'EXCHANGE_APPROVED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReturnStatus')) THEN
    ALTER TYPE "ReturnStatus" ADD VALUE 'EXCHANGE_APPROVED';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'HOLD_FOR_INSPECTION' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReturnStatus')) THEN
    ALTER TYPE "ReturnStatus" ADD VALUE 'HOLD_FOR_INSPECTION';
  END IF;
END$$;

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_returnId_fkey";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "refunds" ADD COLUMN     "adminRemarks" TEXT,
ADD COLUMN     "method" "RefundMethod" NOT NULL DEFAULT 'WALLET',
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "orderItemId" TEXT NOT NULL,
ADD COLUMN     "refundDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "returnId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "returns" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "statusHistory" JSONB,
ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
