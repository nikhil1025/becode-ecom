import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async handleContactSubmission(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<any> {
    try {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Name is required');
      }
      if (!data.email || data.email.trim().length === 0) {
        throw new BadRequestException('Email is required');
      }
      if (!data.message || data.message.trim().length === 0) {
        throw new BadRequestException('Message is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Send confirmation to user
      try {
        await this.mailService.sendContactFormResponse(data.email, {
          name: data.name,
          message: data.message,
        });
      } catch (error) {
        console.error('Failed to send contact confirmation:', error);
      }

      // Send notification to admin
      try {
        await this.mailService.sendContactNotificationToAdmin(data);
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }

      return {
        success: true,
        message: 'Thank you for contacting us. We will get back to you soon.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to process contact submission: ' + error.message,
      );
    }
  }
}
