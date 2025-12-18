import { ContactService } from './contact.service';
export declare class ContactController {
    private contactService;
    constructor(contactService: ContactService);
    submitContactForm(data: {
        name: string;
        email: string;
        message: string;
    }): Promise<any>;
}
