import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { $Enums, ReturnStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { imageFileFilter } from '../common/utils/file-filters';
import { CreateReturnDto, ReturnItemDto } from './dto';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class UserReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, { fileFilter: imageFileFilter }),
  )
  async requestReturn(
    @Request() req: { user: { userId: string } },
    @Body() createReturnDto: CreateReturnDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsedItems: ReturnItemDto[];

    try {
      parsedItems = JSON.parse(createReturnDto.items);
    } catch (error) {
      throw new BadRequestException(
        'The "items" field must be a valid JSON string.',
      );
    }

    if (!Array.isArray(parsedItems)) {
      throw new BadRequestException('The "items" field must be an array.');
    }

    const validationErrors: any[] = [];
    for (const item of parsedItems) {
      const dto = plainToInstance(ReturnItemDto, item);
      const errors = await validate(dto);
      if (errors.length > 0) {
        validationErrors.push({ item, errors });
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed for one or more items.',
        errors: validationErrors,
      });
    }

    const serviceDto = {
      ...createReturnDto,
      items: parsedItems,
    };

    return this.returnsService.requestReturn(
      req.user.userId,
      serviceDto,
      files,
    );
  }

  @Get('my-returns')
  @UseGuards(JwtAuthGuard)
  findByUser(@Request() req: { user: { userId: string } }) {
    return this.returnsService.findByUser(req.user.userId);
  }
}

@Controller('admin/returns')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll() {
    return this.returnsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnsService.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: ReturnStatus;
      rejectionReason?: string;
      adminNote?: string;
    },
  ) {
    return this.returnsService.updateStatus(
      id,
      body.status,
      body.rejectionReason,
      body.adminNote,
    );
  }
}
