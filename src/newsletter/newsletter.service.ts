import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email is already subscribed');

    return this.prisma.newsletterSubscriber.create({
      data: { email: dto.email, name: dto.name, isActive: true },
    });
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
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { isActive: !subscriber.isActive },
    });
  }
}
