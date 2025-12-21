import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, ContentType } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SiteContentService {
  constructor(private prisma: PrismaService) {}

  // Sanitize HTML content to prevent XSS
  private sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'blockquote',
        'code',
        'pre',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
  }

  // Generate slug from content type
  private generateSlug(type: ContentType): string {
    const slugMap = {
      TERMS: 'terms',
      PRIVACY: 'privacy',
      ABOUT: 'about',
      FAQS: 'faqs',
      SHIPPING: 'shipping-info',
      RETURNS: 'returns-exchanges',
    };
    return slugMap[type] || type.toLowerCase();
  }

  // Get published content by slug (user-facing)
  async findBySlug(slug: string) {
    try {
      const content = await this.prisma.siteContent.findFirst({
        where: {
          slug,
          status: ContentStatus.PUBLISHED,
        },
      });

      if (!content) {
        throw new NotFoundException(`Content with slug '${slug}' not found`);
      }

      return content;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve content: ' + error.message,
      );
    }
  }

  // Get content by type (admin-facing, includes drafts)
  async findOne(type: ContentType) {
    try {
      const content = await this.prisma.siteContent.findUnique({
        where: { type },
      });

      if (!content) {
        // Auto-create if doesn't exist
        return await this.create(type, '', '', ContentStatus.DRAFT, null);
      }

      return content;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve content: ' + error.message,
      );
    }
  }

  // Get all content (admin-facing)
  async findAll() {
    try {
      return await this.prisma.siteContent.findMany({
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve content: ' + error.message,
      );
    }
  }

  // Create new content
  async create(
    type: ContentType,
    title: string,
    content: string,
    status: ContentStatus,
    lastUpdatedBy: string | null,
    metadata?: any,
  ) {
    try {
      const slug = this.generateSlug(type);
      const sanitizedContent = this.sanitizeHtml(content);

      return await this.prisma.siteContent.create({
        data: {
          type,
          slug,
          title: title || `${type} Page`,
          content: sanitizedContent,
          status,
          lastUpdatedBy,
          metadata: metadata || null,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create content: ' + error.message,
      );
    }
  }

  // Update existing content
  async update(
    type: ContentType,
    data: {
      title?: string;
      content?: string;
      status?: ContentStatus;
      lastUpdatedBy?: string;
      metadata?: any;
    },
  ) {
    try {
      // Only update fields that are provided
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined)
        updateData.content = this.sanitizeHtml(data.content);
      if (data.status !== undefined) updateData.status = data.status;
      if (data.lastUpdatedBy !== undefined)
        updateData.lastUpdatedBy = data.lastUpdatedBy;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      return await this.prisma.siteContent.update({
        where: { type },
        data: updateData,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update content: ' + error.message,
      );
    }
  }

  // Upsert (create or update) - backward compatibility
  async upsert(
    type: ContentType,
    title: string,
    content: string,
    status?: ContentStatus,
    lastUpdatedBy?: string,
    metadata?: any,
  ) {
    try {
      if (!title || !content) {
        throw new BadRequestException('Title and content are required');
      }

      const slug = this.generateSlug(type);
      const sanitizedContent = this.sanitizeHtml(content);

      return await this.prisma.siteContent.upsert({
        where: { type },
        create: {
          type,
          slug,
          title,
          content: sanitizedContent,
          status: status || ContentStatus.DRAFT,
          lastUpdatedBy,
          metadata: metadata || null,
        },
        update: {
          title,
          content: sanitizedContent,
          status: status || ContentStatus.DRAFT,
          lastUpdatedBy,
          metadata: metadata || null,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update content: ' + error.message,
      );
    }
  }

  // Publish content
  async publish(type: ContentType, lastUpdatedBy?: string) {
    try {
      return await this.prisma.siteContent.update({
        where: { type },
        data: {
          status: ContentStatus.PUBLISHED,
          lastUpdatedBy,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to publish content: ' + error.message,
      );
    }
  }

  // Unpublish content
  async unpublish(type: ContentType, lastUpdatedBy?: string) {
    try {
      return await this.prisma.siteContent.update({
        where: { type },
        data: {
          status: ContentStatus.DRAFT,
          lastUpdatedBy,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to unpublish content: ' + error.message,
      );
    }
  }

  // Soft delete (change to draft)
  async delete(type: ContentType) {
    try {
      return await this.prisma.siteContent.update({
        where: { type },
        data: {
          status: ContentStatus.DRAFT,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete content: ' + error.message,
      );
    }
  }
}
