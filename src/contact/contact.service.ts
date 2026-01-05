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
    subject?: string;
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

      // Save contact submission to database
      const contact = await this.prisma.contact.create({
        data: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          subject: data.subject?.trim(),
          message: data.message.trim(),
        },
      });

      console.log('Contact submission saved:', contact.id);

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

  /**
   * Get all contact submissions (Admin only)
   */
  async getAllContacts(page: number = 1, limit: number = 20, isRead?: boolean) {
    const skip = (page - 1) * limit;

    const where = isRead !== undefined ? { isRead } : {};

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          replies: {
            include: {
              admin: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { sentAt: 'desc' },
            take: 1, // Only get the latest reply for the list view
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single contact by ID with replies (Admin only)
   */
  async getContactById(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { sentAt: 'asc' },
          include: {
            admin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    return contact;
  }

  /**
   * Mark contact as read (Admin only)
   */
  async markAsRead(id: string) {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isRead: true },
    });

    return contact;
  }

  /**
   * Mark contact as unread (Admin only)
   */
  async markAsUnread(id: string) {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isRead: false },
    });

    return contact;
  }

  /**
   * Delete a contact (Admin only)
   */
  async deleteContact(id: string) {
    await this.prisma.contact.delete({
      where: { id },
    });

    return { message: 'Contact deleted successfully' };
  }

  /**
   * Reply to a contact (Admin only)
   */
  async replyToContact(
    contactId: string,
    adminId: string,
    replyMessage: string,
  ) {
    // Get contact details
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    // Get admin details
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    // Create reply record
    const reply = await this.prisma.contactReply.create({
      data: {
        contactId,
        adminId,
        message: replyMessage,
        emailSentAt: new Date(),
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email to user
    try {
      const adminName = admin.firstName
        ? `${admin.firstName}${admin.lastName ? ' ' + admin.lastName : ''}`
        : 'Our Team';

      await this.mailService.sendContactReply(contact.email, {
        userName: contact.name,
        originalSubject: contact.subject,
        originalMessage: contact.message,
        replyMessage: replyMessage,
        adminName: adminName,
      });

      console.log(`Reply email sent to ${contact.email}`);
    } catch (error) {
      console.error('Failed to send reply email:', error);
      // Don't throw error - reply is saved even if email fails
    }

    // Mark contact as read
    await this.prisma.contact.update({
      where: { id: contactId },
      data: { isRead: true },
    });

    return reply;
  }
}
