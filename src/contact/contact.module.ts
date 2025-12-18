import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [MailModule],
  controllers: [ContactController],
  providers: [ContactService, PrismaService],
})
export class ContactModule {}
