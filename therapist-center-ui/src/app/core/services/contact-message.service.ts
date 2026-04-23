import { Injectable, inject } from '@angular/core';
import { LocalMessageBusService } from './local-message-bus.service';
import { UserRole } from '../models/enums';

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactMessageService {
  private readonly bus = inject(LocalMessageBusService);

  submit(data: ContactSubmission): void {
    const contactInfo = [data.email, data.phone].filter(Boolean).join(' · ') || '—';
    this.bus.send({
      senderId: `external-${data.email || data.phone || Date.now()}`,
      senderName: data.name || 'زائر',
      senderRole: 'External',
      recipientRole: UserRole.Admin,
      subject: `رسالة من نموذج التواصل (${contactInfo})`,
      content: data.message,
    });
  }
}
