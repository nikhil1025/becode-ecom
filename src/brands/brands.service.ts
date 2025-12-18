import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async findAll(): Promise<any[]> {
    try {
      return await this.prisma.brand.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve brands: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Brand ID is required');
      }

      const brand = await this.prisma.brand.findUnique({
        where: { id },
        include: {
          products: {
            take: 10,
            include: {
              images: {
                where: { isFeatured: true },
                take: 1,
              },
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      return brand;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve brand: ' + error.message,
      );
    }
  }

  async create(data: {
    name: string;
    slug: string;
    logo?: string;
  }): Promise<any> {
    try {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Brand name is required');
      }
      if (!data.slug || data.slug.trim().length === 0) {
        throw new BadRequestException('Brand slug is required');
      }

      // Check if slug already exists
      const existing = await this.prisma.brand.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException('Brand with this slug already exists');
      }

      return await this.prisma.brand.create({
        data,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create brand: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    data: { name?: string; slug?: string; logo?: string },
  ): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Brand ID is required');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Update data is required');
      }

      const brand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      return await this.prisma.brand.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update brand: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new BadRequestException('Brand ID is required');
      }

      const brand = await this.prisma.brand.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      if (brand.products.length > 0) {
        throw new ConflictException(
          'Cannot delete brand with associated products',
        );
      }

      await this.prisma.brand.delete({
        where: { id },
      });

      return { message: 'Brand deleted successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete brand: ' + error.message,
      );
    }
  }

  async uploadLogo(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Uploading logo:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'present' : 'missing',
      });
      const { url } = await this.s3.uploadProductImage('brands', file);
      console.log('Logo uploaded successfully:', url);
      return url;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw new InternalServerErrorException(
        'Failed to upload brand logo: ' + error.message,
      );
    }
  }
}
