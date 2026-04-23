import { Component } from '@angular/core';
import { UnifiedMessagesPage } from '../../../shared/components/unified-messages-page';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-therapist-messages-page',
  standalone: true,
  imports: [UnifiedMessagesPage],
  template: `<app-unified-messages-page [role]="role" />`,
})
export class TherapistMessagesPage {
  readonly role = UserRole.Therapist;
}
