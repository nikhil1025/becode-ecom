import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
export declare class ContactService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    handleContactSubmission(data: {
        name: string;
        email: string;
        message: string;
    }): Promise<any>;
}
