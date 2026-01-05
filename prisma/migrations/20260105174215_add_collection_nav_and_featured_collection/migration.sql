-- AlterEnum
ALTER TYPE "NavigationType" ADD VALUE 'COLLECTION';

-- AlterTable
ALTER TABLE "homepage_config" ADD COLUMN     "featuredCollectionId" TEXT;
