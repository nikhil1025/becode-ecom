import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BASE_URL } from '../types/config';

@Injectable()
export class LocalStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.BASE_URL || BASE_URL;
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      const dirs = ['avatars', 'products', 'brands', 'categories', 'returns'];
      for (const dir of dirs) {
        await fs.mkdir(path.join(this.uploadDir, dir), { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  /**
   * Uploads a file to a specified path prefix.
   * @param buffer The file buffer to save.
   * @param pathPrefix The subdirectory within the uploads folder (e.g., 'products', 'avatars').
   * @param extension The file extension (defaults to 'webp').
   * @returns The public URL and key of the uploaded file.
   */
  async upload(
    buffer: Buffer,
    pathPrefix: string,
    extension = 'webp',
  ): Promise<{ url: string; key: string }> {
    try {
      const filename = `${randomUUID()}.${extension}`;
      const key = `${pathPrefix}/${filename}`;
      const filePath = path.join(this.uploadDir, key);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      const url = `${this.baseUrl}/uploads/${key}`;
      return { url, key };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file to ${pathPrefix}: ${error.message}`,
      );
    }
  }
}
