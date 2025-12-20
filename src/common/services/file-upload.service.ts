
import { Injectable } from '@nestjs/common';
import { ImageService } from './image.service';
import { S3Service } from '../../storage/s3.service';

interface ResizeOptions {
  width: number;
  height: number;
}

@Injectable()
export class FileUploadService {
  constructor(
    private readonly imageService: ImageService,
    private readonly storageService: S3Service,
  ) {}

  /**
   * Processes and uploads an image file.
   * @param file The raw file from the request.
   * @param pathPrefix The subdirectory for storage (e.g., 'products').
   * @param resizeOptions Optional dimensions for resizing.
   * @returns The public URL of the uploaded WebP image.
   */
  async uploadImage(
    file: Express.Multer.File,
    pathPrefix: string,
    resizeOptions?: ResizeOptions,
  ): Promise<{ url: string; key: string }> {
    // 1. Process image to WebP and optionally resize
    const webpBuffer = await this.imageService.processToWebp(
      file.buffer,
      resizeOptions,
    );

    // 2. Upload the processed buffer
    const { url, key } = await this.storageService.upload(
      webpBuffer,
      pathPrefix,
      'webp',
      'image/webp',
    );

    return { url, key };
  }

  /**
   * Processes and uploads multiple image files.
   * @param files An array of raw files from the request.
   * @param pathPrefix The subdirectory for storage.
   * @param resizeOptions Optional dimensions for resizing.
   * @returns An array of public URLs of the uploaded WebP images.
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    pathPrefix: string,
    resizeOptions?: ResizeOptions,
  ): Promise<{ url: string; key: string }[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, pathPrefix, resizeOptions),
    );
    return Promise.all(uploadPromises);
  }
}
