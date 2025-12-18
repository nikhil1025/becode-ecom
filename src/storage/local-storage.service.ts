import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    // Store files in backend/uploads
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Serve files from /uploads endpoint
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';

    // Create uploads directory if it doesn't exist
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'products'), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.uploadDir, 'brands'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'categories'), {
        recursive: true,
      });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    try {
      const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
      const filename = `${userId}-${randomUUID()}.${ext}`;
      const key = `avatars/${filename}`;
      const filePath = path.join(this.uploadDir, key);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, file.buffer);

      const url = `${this.baseUrl}/uploads/${key}`;
      return { url, key };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload avatar: ' + error.message,
      );
    }
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    try {
      const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
      const filename = `${randomUUID()}.${ext}`;
      const key = `products/${productId}/${filename}`;
      const filePath = path.join(this.uploadDir, key);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, file.buffer);

      const url = `${this.baseUrl}/uploads/${key}`;
      return { url, key };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload product image: ' + error.message,
      );
    }
  }
}
