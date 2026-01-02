-- CreateEnum
CREATE TYPE "LogoType" AS ENUM ('HORIZONTAL', 'SQUARE', 'HEADER', 'FOOTER', 'CARD');

-- CreateEnum
CREATE TYPE "LogoMode" AS ENUM ('DARK', 'LIGHT');

-- CreateTable
CREATE TABLE "app_logos" (
    "id" TEXT NOT NULL,
    "type" "LogoType" NOT NULL,
    "mode" "LogoMode" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_logos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_logos_type_mode_isActive_key" ON "app_logos"("type", "mode", "isActive");
