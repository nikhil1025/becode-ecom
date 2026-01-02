import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SocialMediaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.socialMedia.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findActive() {
    return await this.prisma.socialMedia.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const socialMedia = await this.prisma.socialMedia.findUnique({
      where: { id },
    });

    if (!socialMedia) {
      throw new NotFoundException(`Social media link not found`);
    }

    return socialMedia;
  }

  async create(data: {
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
  }) {
    return await this.prisma.socialMedia.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      platform?: string;
      url?: string;
      icon?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    await this.findOne(id); // Check if exists

    return this.prisma.socialMedia.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.socialMedia.delete({
      where: { id },
    });
  }

  async reorder(items: { id: string; order: number }[]) {
    const updates = items.map((item) =>
      this.prisma.socialMedia.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await this.prisma.$transaction(updates);

    return { success: true, message: 'Order updated successfully' };
  }
}
