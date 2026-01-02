import { Injectable, NotFoundException } from '@nestjs/common';
import { LogoMode, LogoType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppLogoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appLogo.findMany({
      orderBy: [{ type: 'asc' }, { mode: 'asc' }],
    });
  }

  async findActive() {
    return this.prisma.appLogo.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { mode: 'asc' }],
    });
  }

  async findByTypeAndMode(type: LogoType, mode: LogoMode) {
    return this.prisma.appLogo.findFirst({
      where: { type, mode, isActive: true },
    });
  }

  async create(data: {
    type: LogoType;
    mode: LogoMode;
    imageUrl: string;
    isActive?: boolean;
  }) {
    // If creating as active, deactivate existing active logo of same type and mode
    if (data.isActive !== false) {
      await this.prisma.appLogo.updateMany({
        where: {
          type: data.type,
          mode: data.mode,
          isActive: true,
        },
        data: { isActive: false },
      });
    }

    return this.prisma.appLogo.create({
      data: {
        ...data,
        isActive: data.isActive !== false,
      },
    });
  }

  async update(
    id: string,
    data: {
      type?: LogoType;
      mode?: LogoMode;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    const logo = await this.prisma.appLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Logo not found');
    }

    // If setting as active, deactivate other logos of the same type and mode
    if (data.isActive === true) {
      const type = data.type || logo.type;
      const mode = data.mode || logo.mode;

      await this.prisma.appLogo.updateMany({
        where: {
          type,
          mode,
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    return this.prisma.appLogo.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const logo = await this.prisma.appLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Logo not found');
    }

    // Delete the image file if it exists
    if (logo.imageUrl) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(
        uploadsDir,
        logo.imageUrl.replace('/uploads/', ''),
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return this.prisma.appLogo.delete({
      where: { id },
    });
  }

  async setActive(id: string) {
    const logo = await this.prisma.appLogo.findUnique({
      where: { id },
    });

    if (!logo) {
      throw new NotFoundException('Logo not found');
    }

    // Deactivate other logos of the same type and mode
    await this.prisma.appLogo.updateMany({
      where: {
        type: logo.type,
        mode: logo.mode,
        isActive: true,
        id: { not: id },
      },
      data: { isActive: false },
    });

    return this.prisma.appLogo.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
