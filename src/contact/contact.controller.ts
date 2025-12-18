import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('api/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async submitContactForm(
    @Body() data: { name: string; email: string; message: string },
  ): Promise<any> {
    return await this.contactService.handleContactSubmission(data);
  }
}
