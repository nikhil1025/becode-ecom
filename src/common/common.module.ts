
import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { FileUploadService } from './services/file-upload.service';
import { ImageService } from './services/image.service';

@Module({
  imports: [StorageModule],
  providers: [ImageService, FileUploadService],
  exports: [ImageService, FileUploadService],
})
export class CommonModule {}
