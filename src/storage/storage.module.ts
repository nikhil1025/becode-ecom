
import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { S3Service } from './s3.service';

@Module({
  providers: [LocalStorageService, S3Service],
  exports: [LocalStorageService, S3Service],
})
export class StorageModule {}
