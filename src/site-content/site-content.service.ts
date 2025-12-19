import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SiteContentService {
  constructor(private prisma: PrismaService) {}

  async findOne(type: ContentType) {
    try {
      const content = await this.prisma.siteContent.findUnique({
        where: { type },
      });

      if (!content) {
        throw new NotFoundException(`${type} content not found`);
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

  async upsert(type: ContentType, title: string, content: string) {
    try {
      if (!title || !content) {
        throw new BadRequestException('Title and content are required');
      }

      return await this.prisma.siteContent.upsert({
        where: { type },
        create: {
          type,
          title,
          content,
        },
        update: {
          title,
          content,
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
}
