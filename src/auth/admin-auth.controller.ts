import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('register')
  async adminRegister(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ) {
    return this.authService.adminRegister(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
    );
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: unknown }) {
    return req.user;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(req.user.id, file);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: { user: User },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
