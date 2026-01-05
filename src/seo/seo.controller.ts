import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import {
  CreateSearchAnalyticsDto,
  CreateSEOConfigDto,
  CreateSEORedirectDto,
  CreateURLMonitorDto,
  UpdateSEOConfigDto,
  UpdateSEOFieldsDto,
  UpdateSEORedirectDto,
  UpdateURLMonitorDto,
} from './dto/seo.dto';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  // ============================================
  // SEO CONFIG ENDPOINTS
  // ============================================

  @Post('config')
  @UseGuards(AdminJwtAuthGuard)
  async createSEOConfig(@Body() createSEOConfigDto: CreateSEOConfigDto) {
    return this.seoService.createSEOConfig(createSEOConfigDto);
  }

  @Get('config')
  async getSEOConfig() {
    return this.seoService.getSEOConfig();
  }

  @Put('config')
  @UseGuards(AdminJwtAuthGuard)
  async updateSEOConfig(@Body() updateSEOConfigDto: UpdateSEOConfigDto) {
    return this.seoService.updateSEOConfig(updateSEOConfigDto);
  }

  @Delete('config')
  @UseGuards(AdminJwtAuthGuard)
  async deleteSEOConfig() {
    return this.seoService.deleteSEOConfig();
  }

  // ============================================
  // SEO REDIRECT ENDPOINTS
  // ============================================

  @Post('redirects')
  @UseGuards(AdminJwtAuthGuard)
  async createRedirect(@Body() createRedirectDto: CreateSEORedirectDto) {
    return this.seoService.createRedirect(createRedirectDto);
  }

  @Get('redirects')
  async getAllRedirects() {
    return this.seoService.getAllRedirects();
  }

  @Get('redirects/:id')
  async getRedirectById(@Param('id') id: string) {
    return this.seoService.getRedirectById(id);
  }

  @Get('redirects/path/:fromPath')
  async getRedirectByPath(@Param('fromPath') fromPath: string) {
    return this.seoService.getRedirectByPath(decodeURIComponent(fromPath));
  }

  @Put('redirects/:id')
  @UseGuards(AdminJwtAuthGuard)
  async updateRedirect(
    @Param('id') id: string,
    @Body() updateRedirectDto: UpdateSEORedirectDto,
  ) {
    return this.seoService.updateRedirect(id, updateRedirectDto);
  }

  @Delete('redirects/:id')
  @UseGuards(AdminJwtAuthGuard)
  async deleteRedirect(@Param('id') id: string) {
    return this.seoService.deleteRedirect(id);
  }

  @Post('redirects/hit/:fromPath')
  async incrementRedirectHit(@Param('fromPath') fromPath: string) {
    return this.seoService.incrementRedirectHit(decodeURIComponent(fromPath));
  }

  // ============================================
  // URL MONITOR ENDPOINTS
  // ============================================

  @Post('url-monitors')
  @UseGuards(AdminJwtAuthGuard)
  async createURLMonitor(@Body() createURLMonitorDto: CreateURLMonitorDto) {
    return this.seoService.createURLMonitor(createURLMonitorDto);
  }

  @Get('url-monitors')
  @UseGuards(AdminJwtAuthGuard)
  async getAllURLMonitors() {
    return this.seoService.getAllURLMonitors();
  }

  @Get('url-monitors/:id')
  @UseGuards(AdminJwtAuthGuard)
  async getURLMonitorById(@Param('id') id: string) {
    return this.seoService.getURLMonitorById(id);
  }

  @Put('url-monitors/:id')
  @UseGuards(AdminJwtAuthGuard)
  async updateURLMonitor(
    @Param('id') id: string,
    @Body() updateURLMonitorDto: UpdateURLMonitorDto,
  ) {
    return this.seoService.updateURLMonitor(id, updateURLMonitorDto);
  }

  @Delete('url-monitors/:id')
  @UseGuards(AdminJwtAuthGuard)
  async deleteURLMonitor(@Param('id') id: string) {
    return this.seoService.deleteURLMonitor(id);
  }

  @Post('url-monitors/check')
  @UseGuards(AdminJwtAuthGuard)
  async checkURL(@Body('url') url: string) {
    return this.seoService.checkURL(url);
  }

  // ============================================
  // SEARCH ANALYTICS ENDPOINTS
  // ============================================

  @Post('search-analytics')
  @UseGuards(AdminJwtAuthGuard)
  async createSearchAnalytics(
    @Body() createSearchAnalyticsDto: CreateSearchAnalyticsDto,
  ) {
    return this.seoService.createSearchAnalytics(createSearchAnalyticsDto);
  }

  @Get('search-analytics')
  @UseGuards(AdminJwtAuthGuard)
  async getAllSearchAnalytics(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.seoService.getAllSearchAnalytics(limit, offset);
  }

  @Get('search-analytics/query/:query')
  @UseGuards(AdminJwtAuthGuard)
  async getSearchAnalyticsByQuery(@Param('query') query: string) {
    return this.seoService.getSearchAnalyticsByQuery(decodeURIComponent(query));
  }

  @Get('search-analytics/url/:url')
  @UseGuards(AdminJwtAuthGuard)
  async getSearchAnalyticsByURL(@Param('url') url: string) {
    return this.seoService.getSearchAnalyticsByURL(decodeURIComponent(url));
  }

  @Get('search-analytics/top/queries')
  @UseGuards(AdminJwtAuthGuard)
  async getTopQueries(@Query('limit') limit?: number) {
    return this.seoService.getTopQueries(limit);
  }

  @Get('search-analytics/top/pages')
  @UseGuards(AdminJwtAuthGuard)
  async getTopPages(@Query('limit') limit?: number) {
    return this.seoService.getTopPages(limit);
  }

  // ============================================
  // SEO AUDIT LOG ENDPOINTS
  // ============================================

  @Get('audit-logs')
  @UseGuards(AdminJwtAuthGuard)
  async getAllAuditLogs(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.seoService.getAllAuditLogs(limit, offset);
  }

  @Get('audit-logs/:entityType/:entityId')
  @UseGuards(AdminJwtAuthGuard)
  async getAuditLogsByEntity(
    @Param('entityType')
    entityType:
      | 'PRODUCT'
      | 'CATEGORY'
      | 'BRAND'
      | 'COLLECTION'
      | 'SITE_CONTENT'
      | 'SEO_CONFIG'
      | 'SEO_REDIRECT',
    @Param('entityId') entityId: string,
  ) {
    return this.seoService.getAuditLogsByEntity(entityType, entityId);
  }

  // ============================================
  // ENTITY SEO UPDATE ENDPOINTS
  // ============================================

  @Put('products/:id/seo')
  @UseGuards(AdminJwtAuthGuard)
  async updateProductSEO(
    @Param('id') id: string,
    @Body() updateSEOFieldsDto: UpdateSEOFieldsDto,
  ) {
    return this.seoService.updateProductSEO(id, updateSEOFieldsDto);
  }

  @Put('categories/:id/seo')
  @UseGuards(AdminJwtAuthGuard)
  async updateCategorySEO(
    @Param('id') id: string,
    @Body() updateSEOFieldsDto: UpdateSEOFieldsDto,
  ) {
    return this.seoService.updateCategorySEO(id, updateSEOFieldsDto);
  }

  @Put('brands/:id/seo')
  @UseGuards(AdminJwtAuthGuard)
  async updateBrandSEO(
    @Param('id') id: string,
    @Body() updateSEOFieldsDto: UpdateSEOFieldsDto,
  ) {
    return this.seoService.updateBrandSEO(id, updateSEOFieldsDto);
  }

  @Put('collections/:id/seo')
  @UseGuards(AdminJwtAuthGuard)
  async updateCollectionSEO(
    @Param('id') id: string,
    @Body() updateSEOFieldsDto: UpdateSEOFieldsDto,
  ) {
    return this.seoService.updateCollectionSEO(id, updateSEOFieldsDto);
  }

  @Put('site-content/:id/seo')
  @UseGuards(AdminJwtAuthGuard)
  async updateSiteContentSEO(
    @Param('id') id: string,
    @Body() updateSEOFieldsDto: UpdateSEOFieldsDto,
  ) {
    return this.seoService.updateSiteContentSEO(id, updateSEOFieldsDto);
  }
}
