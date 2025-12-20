import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET || '';
  }

  /**
   * Uploads a file to a specified path prefix in the S3 bucket.
   * @param buffer The file buffer to save.
   * @param pathPrefix The subdirectory within the bucket (e.g., 'products', 'avatars').
   * @param extension The file extension (e.g., 'webp').
   * @param mimetype The MIME type of the file.
   * @returns The public URL and key of the uploaded file.
   */
  async upload(
    buffer: Buffer,
    pathPrefix: string,
    extension: string,
    mimetype: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `${pathPrefix}/${randomUUID()}.${extension}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }) as any,
      );

      const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
      const url = baseUrl
        ? `${baseUrl}/${key}`
        : `https://${this.bucket}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error) {
      console.error('S3 Upload error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${error.message}`,
      );
    }
  }

  /**
   * Uploads an avatar image to S3.
   * @param userId The user ID for organizing avatars.
   * @param file The uploaded file from multer.
   * @returns The public URL and key of the uploaded avatar.
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    return this.upload(file.buffer, `avatars/${userId}`, 'jpg', file.mimetype);
  }
}
