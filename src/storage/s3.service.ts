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

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    try {
      const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
      const key = `avatars/${userId}/${randomUUID()}.${ext}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'image/png',
        }) as any,
      );

      const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
      const url = baseUrl
        ? `${baseUrl}/${key}`
        : `https://${this.bucket}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    try {
      console.log('S3 Upload attempt:', {
        bucket: this.bucket,
        region: process.env.AWS_S3_REGION,
        productId,
        fileSize: file.size,
        hasCredentials: !!(
          process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ),
      });

      const ext = (file.originalname.split('.').pop() || 'png').toLowerCase();
      const key = `products/${productId}/${randomUUID()}.${ext}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'image/png',
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
        'Failed to upload product image: ' + error.message,
      );
    }
  }
}
