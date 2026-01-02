import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogoMode, LogoType } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { LocalStorageService } from '../storage/local-storage.service';
import { AppLogoService } from './app-logo.service';

@Controller('app-logo')
export class AppLogoController {
  constructor(
    private readonly appLogoService: AppLogoService,
    private readonly storageService: LocalStorageService,
  ) {}

  @Get()
  async findAll() {
    return this.appLogoService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.appLogoService.findActive();
  }

  @Get('by-type')
  async findByTypeAndMode(
    @Query('type') type: LogoType,
    @Query('mode') mode: LogoMode,
  ) {
    if (!type || !mode) {
      throw new BadRequestException('Type and mode are required');
    }
    return this.appLogoService.findByTypeAndMode(type, mode);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: { type: LogoType; mode: LogoMode; isActive?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!body.type || !body.mode) {
      throw new BadRequestException('Type and mode are required');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WEBP are allowed',
      );
    }

    // Upload the file
    const extension = file.originalname.split('.').pop() || 'webp';
    const { url } = await this.storageService.upload(
      file.buffer,
      'logos',
      extension,
    );

    return this.appLogoService.create({
      type: body.type,
      mode: body.mode,
      imageUrl: url,
      isActive: body.isActive === 'true',
    });
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() body: { type?: LogoType; mode?: LogoMode; isActive?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and WEBP are allowed',
        );
      }

      // Upload the new file
      const extension = file.originalname.split('.').pop() || 'webp';
      const { url } = await this.storageService.upload(
        file.buffer,
        'logos',
        extension,
      );
      imageUrl = url;
    }

    return this.appLogoService.update(id, {
      type: body.type,
      mode: body.mode,
      imageUrl,
      isActive: body.isActive === 'true',
    });
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.appLogoService.delete(id);
  }

  @Put(':id/set-active')
  @UseGuards(AdminJwtAuthGuard)
  async setActive(@Param('id') id: string) {
    return this.appLogoService.setActive(id);
  }
}
