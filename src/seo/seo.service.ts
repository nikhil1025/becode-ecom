import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SEO CONFIG METHODS
  // ============================================

  async createSEOConfig(data: CreateSEOConfigDto) {
    const existing = await this.prisma.sEOConfig.findFirst();
    if (existing) {
      throw new ConflictException(
        'SEO Config already exists. Use update instead.',
      );
    }
    return this.prisma.sEOConfig.create({ data });
  }

  async getSEOConfig() {
    const config = await this.prisma.sEOConfig.findFirst();
    if (!config) {
      throw new NotFoundException('SEO Config not found');
    }
    return config;
  }

  async updateSEOConfig(data: UpdateSEOConfigDto) {
    const config = await this.prisma.sEOConfig.findFirst();
    if (!config) {
      throw new NotFoundException('SEO Config not found');
    }
    return this.prisma.sEOConfig.update({
      where: { id: config.id },
      data,
    });
  }

  async deleteSEOConfig() {
    const config = await this.prisma.sEOConfig.findFirst();
    if (!config) {
      throw new NotFoundException('SEO Config not found');
    }
    return this.prisma.sEOConfig.delete({ where: { id: config.id } });
  }

  // ============================================
  // SEO REDIRECT METHODS
  // ============================================

  async createRedirect(data: CreateSEORedirectDto) {
    const existing = await this.prisma.sEORedirect.findUnique({
      where: { fromPath: data.fromPath },
    });
    if (existing) {
      throw new ConflictException(
        `Redirect from ${data.fromPath} already exists`,
      );
    }
    return this.prisma.sEORedirect.create({ data });
  }

  async getAllRedirects() {
    return await this.prisma.sEORedirect.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRedirectById(id: string) {
    const redirect = await this.prisma.sEORedirect.findUnique({
      where: { id },
    });
    if (!redirect) {
      throw new NotFoundException(`Redirect with ID ${id} not found`);
    }
    return redirect;
  }

  async getRedirectByPath(fromPath: string) {
    return await this.prisma.sEORedirect.findUnique({ where: { fromPath } });
  }

  async updateRedirect(id: string, data: UpdateSEORedirectDto) {
    const redirect = await this.prisma.sEORedirect.findUnique({
      where: { id },
    });
    if (!redirect) {
      throw new NotFoundException(`Redirect with ID ${id} not found`);
    }
    return this.prisma.sEORedirect.update({ where: { id }, data });
  }

  async deleteRedirect(id: string) {
    const redirect = await this.prisma.sEORedirect.findUnique({
      where: { id },
    });
    if (!redirect) {
      throw new NotFoundException(`Redirect with ID ${id} not found`);
    }
    return this.prisma.sEORedirect.delete({ where: { id } });
  }

  async incrementRedirectHit(fromPath: string) {
    const redirect = await this.prisma.sEORedirect.findUnique({
      where: { fromPath },
    });
    if (redirect) {
      return this.prisma.sEORedirect.update({
        where: { fromPath },
        data: { hitCount: { increment: 1 } },
      });
    }
    return null;
  }

  // ============================================
  // URL MONITOR METHODS
  // ============================================

  async createURLMonitor(data: CreateURLMonitorDto) {
    const existing = await this.prisma.uRLMonitor.findUnique({
      where: { url: data.url },
    });
    if (existing) {
      throw new ConflictException(`URL Monitor for ${data.url} already exists`);
    }
    return this.prisma.uRLMonitor.create({ data });
  }

  async getAllURLMonitors() {
    return await this.prisma.uRLMonitor.findMany({
      orderBy: { lastChecked: 'desc' },
    });
  }

  async getURLMonitorById(id: string) {
    const monitor = await this.prisma.uRLMonitor.findUnique({ where: { id } });
    if (!monitor) {
      throw new NotFoundException(`URL Monitor with ID ${id} not found`);
    }
    return monitor;
  }

  async updateURLMonitor(id: string, data: UpdateURLMonitorDto) {
    const monitor = await this.prisma.uRLMonitor.findUnique({ where: { id } });
    if (!monitor) {
      throw new NotFoundException(`URL Monitor with ID ${id} not found`);
    }
    return this.prisma.uRLMonitor.update({ where: { id }, data });
  }

  async deleteURLMonitor(id: string) {
    const monitor = await this.prisma.uRLMonitor.findUnique({ where: { id } });
    if (!monitor) {
      throw new NotFoundException(`URL Monitor with ID ${id} not found`);
    }
    return this.prisma.uRLMonitor.delete({ where: { id } });
  }

  async checkURL(url: string) {
    const startTime = Date.now();
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      const isAccessible = statusCode >= 200 && statusCode < 400;

      const monitor = await this.prisma.uRLMonitor.findUnique({
        where: { url },
      });
      if (monitor) {
        await this.prisma.uRLMonitor.update({
          where: { url },
          data: {
            lastChecked: new Date(),
            statusCode,
            responseTime,
            isAccessible,
            errorMessage: isAccessible ? null : `Status code: ${statusCode}`,
            checkCount: { increment: 1 },
            lastSuccessDate: isAccessible
              ? new Date()
              : monitor.lastSuccessDate,
            lastFailureDate: !isAccessible
              ? new Date()
              : monitor.lastFailureDate,
          },
        });
      }

      return { url, statusCode, responseTime, isAccessible };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const monitor = await this.prisma.uRLMonitor.findUnique({
        where: { url },
      });
      if (monitor) {
        await this.prisma.uRLMonitor.update({
          where: { url },
          data: {
            lastChecked: new Date(),
            statusCode: null,
            responseTime,
            isAccessible: false,
            errorMessage: error.message,
            checkCount: { increment: 1 },
            lastFailureDate: new Date(),
          },
        });
      }
      return {
        url,
        statusCode: null,
        responseTime,
        isAccessible: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // SEARCH ANALYTICS METHODS
  // ============================================

  async createSearchAnalytics(data: CreateSearchAnalyticsDto) {
    return await this.prisma.searchAnalytics.create({ data });
  }

  async getAllSearchAnalytics(limit = 100, offset = 0) {
    return await this.prisma.searchAnalytics.findMany({
      take: limit,
      skip: offset,
      orderBy: { date: 'desc' },
    });
  }

  async getSearchAnalyticsByQuery(query: string) {
    return await this.prisma.searchAnalytics.findMany({
      where: { query: { contains: query, mode: 'insensitive' } },
      orderBy: { date: 'desc' },
    });
  }

  async getSearchAnalyticsByURL(url: string) {
    return await this.prisma.searchAnalytics.findMany({
      where: { url: { contains: url, mode: 'insensitive' } },
      orderBy: { date: 'desc' },
    });
  }

  async getTopQueries(limit = 20) {
    return await this.prisma.searchAnalytics.groupBy({
      by: ['query'],
      _sum: {
        clicks: true,
        impressions: true,
      },
      _avg: {
        position: true,
        ctr: true,
      },
      orderBy: {
        _sum: {
          clicks: 'desc',
        },
      },
      take: limit,
    });
  }

  async getTopPages(limit = 20) {
    return await this.prisma.searchAnalytics.groupBy({
      by: ['url'],
      _sum: {
        clicks: true,
        impressions: true,
      },
      _avg: {
        position: true,
        ctr: true,
      },
      orderBy: {
        _sum: {
          clicks: 'desc',
        },
      },
      take: limit,
    });
  }

  // ============================================
  // SEO AUDIT LOG METHODS
  // ============================================

  async createAuditLog(data: {
    entityType:
      | 'PRODUCT'
      | 'CATEGORY'
      | 'BRAND'
      | 'COLLECTION'
      | 'SITE_CONTENT'
      | 'SEO_CONFIG'
      | 'SEO_REDIRECT';
    entityId: string;
    actionType:
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'PUBLISH'
      | 'UNPUBLISH'
      | 'BULK_UPDATE';
    changedBy?: string;
    oldValues?: any;
    newValues?: any;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await this.prisma.sEOAuditLog.create({ data });
  }

  async getAllAuditLogs(limit = 100, offset = 0) {
    return await this.prisma.sEOAuditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogsByEntity(
    entityType:
      | 'PRODUCT'
      | 'CATEGORY'
      | 'BRAND'
      | 'COLLECTION'
      | 'SITE_CONTENT'
      | 'SEO_CONFIG'
      | 'SEO_REDIRECT',
    entityId: string,
  ) {
    return await this.prisma.sEOAuditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // ENTITY SEO FIELD UPDATES
  // ============================================

  async updateProductSEO(productId: string, data: UpdateSEOFieldsDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return this.prisma.product.update({ where: { id: productId }, data });
  }

  async updateCategorySEO(categoryId: string, data: UpdateSEOFieldsDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return this.prisma.category.update({ where: { id: categoryId }, data });
  }

  async updateBrandSEO(brandId: string, data: UpdateSEOFieldsDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }
    return this.prisma.brand.update({ where: { id: brandId }, data });
  }

  async updateCollectionSEO(collectionId: string, data: UpdateSEOFieldsDto) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }
    return this.prisma.collection.update({ where: { id: collectionId }, data });
  }

  async updateSiteContentSEO(contentId: string, data: UpdateSEOFieldsDto) {
    const content = await this.prisma.siteContent.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException(
        `Site Content with ID ${contentId} not found`,
      );
    }
    return this.prisma.siteContent.update({ where: { id: contentId }, data });
  }
}
