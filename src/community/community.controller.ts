import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommunityService } from './community.service';
import { JoinCommunityDto } from './dto/join-community.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Post('join')
  join(@Body() dto: JoinCommunityDto) {
    return this.service.join(dto);
  }
}

@Controller('admin/community')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class CommunityAdminController {
  constructor(private readonly service: CommunityService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Patch(':id/notes')
  updateNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.service.updateNotes(id, notes);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
