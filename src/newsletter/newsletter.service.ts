import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already subscribed');

    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: { email: dto.email, name: dto.name, isActive: true },
    });

    // Send newsletter welcome email
    if (subscriber.email) {
      this.mailService
        .sendNewsletterWelcomeEmail(
          subscriber.email,
          subscriber.name || subscriber.email.split('@')[0],
        )
        .catch((err) =>
          console.error('Failed to send newsletter welcome email:', err),
        );
    }

    return subscriber;
  }

  async findAll(isActive?: boolean) {
    return this.prisma.newsletterSubscriber.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { subscribedAt: 'desc' },
    });
  }

  async remove(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');

    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { isActive: !subscriber.isActive },
    });

    // Send unsubscribe email if deactivating
    if (!updated.isActive && updated.email) {
      this.mailService
        .sendNewsletterUnsubscribeEmail(
          updated.email,
          updated.name || updated.email.split('@')[0],
        )
        .catch((err) =>
          console.error('Failed to send newsletter unsubscribe email:', err),
        );
    }

    return updated;
  }
}
