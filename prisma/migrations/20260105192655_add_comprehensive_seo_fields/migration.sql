-- CreateEnum
CREATE TYPE "RedirectType" AS ENUM ('PERMANENT_301', 'TEMPORARY_302', 'SEE_OTHER_303', 'TEMPORARY_REDIRECT_307', 'PERMANENT_REDIRECT_308');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'SITE_CONTENT', 'SEO_CONFIG', 'SEO_REDIRECT');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'BULK_UPDATE');

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "site_content" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "noFollow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT;

-- CreateTable
CREATE TABLE "seo_config" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "defaultOgImage" TEXT,
    "twitterHandle" TEXT,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "facebookPixelId" TEXT,
    "facebookAppId" TEXT,
    "twitterCardType" TEXT NOT NULL DEFAULT 'summary_large_image',
    "defaultLocale" TEXT NOT NULL DEFAULT 'en_US',
    "robotsTxt" TEXT,
    "customHeadScripts" TEXT,
    "customBodyScripts" TEXT,
    "enableSitemap" BOOLEAN NOT NULL DEFAULT true,
    "sitemapChangeFreq" TEXT NOT NULL DEFAULT 'daily',
    "sitemapPriority" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_redirects" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "type" "RedirectType" NOT NULL DEFAULT 'PERMANENT_301',
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_monitors" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "isAccessible" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "checkCount" INTEGER NOT NULL DEFAULT 0,
    "lastSuccessDate" TIMESTAMP(3),
    "lastFailureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'google',
    "device" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "actionType" "AuditActionType" NOT NULL,
    "changedBy" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_redirects_fromPath_key" ON "seo_redirects"("fromPath");

-- CreateIndex
CREATE INDEX "seo_redirects_fromPath_idx" ON "seo_redirects"("fromPath");

-- CreateIndex
CREATE INDEX "seo_redirects_isActive_idx" ON "seo_redirects"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "url_monitors_url_key" ON "url_monitors"("url");

-- CreateIndex
CREATE INDEX "url_monitors_url_idx" ON "url_monitors"("url");

-- CreateIndex
CREATE INDEX "url_monitors_isAccessible_idx" ON "url_monitors"("isAccessible");

-- CreateIndex
CREATE INDEX "url_monitors_lastChecked_idx" ON "url_monitors"("lastChecked");

-- CreateIndex
CREATE INDEX "search_analytics_query_idx" ON "search_analytics"("query");

-- CreateIndex
CREATE INDEX "search_analytics_url_idx" ON "search_analytics"("url");

-- CreateIndex
CREATE INDEX "search_analytics_date_idx" ON "search_analytics"("date");

-- CreateIndex
CREATE INDEX "search_analytics_source_idx" ON "search_analytics"("source");

-- CreateIndex
CREATE INDEX "seo_audit_logs_entityType_idx" ON "seo_audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "seo_audit_logs_entityId_idx" ON "seo_audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "seo_audit_logs_actionType_idx" ON "seo_audit_logs"("actionType");

-- CreateIndex
CREATE INDEX "seo_audit_logs_createdAt_idx" ON "seo_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_noIndex_idx" ON "brands"("noIndex");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_noIndex_idx" ON "categories"("noIndex");

-- CreateIndex
CREATE INDEX "collections_noIndex_idx" ON "collections"("noIndex");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_noIndex_idx" ON "products"("noIndex");

-- CreateIndex
CREATE INDEX "site_content_noIndex_idx" ON "site_content"("noIndex");
