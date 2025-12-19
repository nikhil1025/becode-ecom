/*
  Warnings:

  - The values [TERMS_CONDITIONS,PRIVACY_POLICY] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `site_content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `site_content` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
BEGIN;
CREATE TYPE "ContentType_new" AS ENUM ('TERMS', 'PRIVACY', 'ABOUT', 'FAQS');
ALTER TABLE "site_content" ALTER COLUMN "type" TYPE "ContentType_new" USING ("type"::text::"ContentType_new");
ALTER TYPE "ContentType" RENAME TO "ContentType_old";
ALTER TYPE "ContentType_new" RENAME TO "ContentType";
DROP TYPE "public"."ContentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "site_content" ADD COLUMN     "lastUpdatedBy" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "site_content_slug_key" ON "site_content"("slug");

-- CreateIndex
CREATE INDEX "site_content_slug_idx" ON "site_content"("slug");

-- CreateIndex
CREATE INDEX "site_content_status_idx" ON "site_content"("status");
