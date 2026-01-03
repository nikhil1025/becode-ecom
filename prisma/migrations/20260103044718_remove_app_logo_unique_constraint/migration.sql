-- DropIndex
DROP INDEX "app_logos_type_mode_isActive_key";

-- CreateIndex
CREATE INDEX "app_logos_type_mode_isActive_idx" ON "app_logos"("type", "mode", "isActive");
