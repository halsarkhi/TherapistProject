import { Component } from '@angular/core';
import { UnifiedMessagesPage } from '../../../shared/components/unified-messages-page';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-parent-messages-page',
  standalone: true,
  imports: [UnifiedMessagesPage],
  template: `<app-unified-messages-page [role]="role" />`,
})
export class ParentMessagesPage {
  readonly role = UserRole.Parent;
}
