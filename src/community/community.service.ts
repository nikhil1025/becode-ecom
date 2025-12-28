import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { JoinCommunityDto } from './dto/join-community.dto';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async join(dto: JoinCommunityDto) {
    const member = await this.prisma.communityMember.create({
      data: {
        name: dto.name,
        email: dto.email,
        interest: dto.interest,
        status: 'PENDING',
      },
    });

    // Send community joined email
    if (member.email) {
      this.mailService
        .sendCommunityJoinedEmail(member.email, {
          firstName: member.name.split(' ')[0],
          communityName: 'Theming Cart Community',
          benefits: [
            'Exclusive member-only discounts',
            'Early access to new products',
            'Priority customer support',
            'Special community events and workshops',
          ],
        })
        .catch((err) =>
          console.error('Failed to send community joined email:', err),
        );
    }

    return member;
  }

  async findAll(status?: string) {
    return this.prisma.communityMember.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { id },
    });
    if (!member) throw new NotFoundException('Community member not found');
    return member;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    const member = await this.prisma.communityMember.update({
      where: { id },
      data: { status },
    });

    // Send community status email
    if (member.email) {
      this.mailService
        .sendCommunityStatusEmail(member.email, {
          firstName: member.name.split(' ')[0],
          communityName: 'Theming Cart Community',
          status: status as 'APPROVED' | 'REJECTED' | 'REMOVED',
          reason:
            status === 'APPROVED'
              ? 'Your application has been reviewed and accepted'
              : 'Status updated by admin',
        })
        .catch((err) =>
          console.error('Failed to send community status email:', err),
        );
    }

    return member;
  }

  async updateNotes(id: string, notes: string) {
    await this.findOne(id);
    return this.prisma.communityMember.update({
      where: { id },
      data: { notes },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.communityMember.delete({ where: { id } });
  }
}
