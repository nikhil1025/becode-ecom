-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TERMS_CONDITIONS', 'PRIVACY_POLICY');

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_content_type_key" ON "site_content"("type");
