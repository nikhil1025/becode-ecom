import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JoinCommunityDto } from './dto/join-community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async join(dto: JoinCommunityDto) {
    return this.prisma.communityMember.create({
      data: {
        name: dto.name,
        email: dto.email,
        interest: dto.interest,
        status: 'PENDING',
      },
    });
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
    return this.prisma.communityMember.update({
      where: { id },
      data: { status },
    });
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
