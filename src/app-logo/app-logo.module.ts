import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageModule } from '../storage/storage.module';
import { AppLogoController } from './app-logo.controller';
import { AppLogoService } from './app-logo.service';

@Module({
  imports: [StorageModule],
  controllers: [AppLogoController],
  providers: [AppLogoService, PrismaService],
  exports: [AppLogoService],
})
export class AppLogoModule {}
