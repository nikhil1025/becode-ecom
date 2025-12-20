
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

interface ResizeOptions {
  width: number;
  height: number;
}

@Injectable()
export class ImageService {
  /**
   * Converts an image buffer to WebP format, with optional resizing.
   * @param buffer The original image buffer.
   * @param resizeOptions Optional width and height to resize the image.
   * @returns A buffer containing the image in WebP format.
   */
  async processToWebp(
    buffer: Buffer,
    resizeOptions?: ResizeOptions,
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    if (resizeOptions) {
      sharpInstance = sharpInstance.resize(
        resizeOptions.width,
        resizeOptions.height,
      );
    }

    return sharpInstance.webp({ quality: 80 }).toBuffer();
  }
}
