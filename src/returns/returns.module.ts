import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  controllers: [ReturnsController],
  providers: [ReturnsService, PrismaService],
})
export class ReturnsModule {}
