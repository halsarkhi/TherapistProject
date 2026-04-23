import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalMessageBusService, SenderRole, BusMessage } from '../../core/services/local-message-bus.service';
import { UserRole } from '../../core/models/enums';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

const ROLE_LABEL_KEYS: Record<UserRole | 'External', string> = {
  [UserRole.Admin]: 'role_admin_label',
  [UserRole.Therapist]: 'role_therapist_label',
  [UserRole.Parent]: 'role_parent_label',
  External: 'role_external_label',
};

@Component({
  selector: 'app-unified-messages-page',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="msg-page">
      <header class="msg-header">
        <div>
          <h1>{{ 'messages' | translate }}</h1>
          <span class="role-label">{{ roleLabel }}</span>
        </div>
        <div class="stats">
          <span class="chip chip-unread">{{ unreadCount() }} {{ 'filter_unread' | translate }}</span>
          <span class="chip chip-total">{{ inbox().length }} {{ 'total_label' | translate }}</span>
          <span class="live">● {{ 'chip_live' | translate }}</span>
        </div>
      </header>

      <div class="grid">
        <!-- Compose -->
        <section class="card compose">
          <h2>{{ 'send_new_message' | translate }}</h2>
          <label>{{ 'to_field' | translate }}</label>
          <select [(ngModel)]="targetRole">
            @for (r of allowedTargets; track r) {
              <option [ngValue]="r">{{ label(r) }}</option>
            }
          </select>

          <label>{{ 'subject_optional' | translate }}</label>
          <input type="text" [(ngModel)]="subject" [placeholder]="ts.t('message_title_placeholder')" />

          <label>{{ 'message_field' | translate }}</label>
          <textarea [(ngModel)]="content" rows="5" [placeholder]="ts.t('write_message_placeholder')"></textarea>

          <button class="btn-send" [disabled]="!content.trim()" (click)="send()">
            {{ 'send' | translate }}
          </button>
          @if (sentToast()) {
            <div class="sent-toast">{{ 'sent_successfully' | translate }}</div>
          }
        </section>

        <!-- Inbox -->
        <section class="card inbox">
          <div class="inbox-head">
            <h2>{{ 'inbox_label' | translate }}</h2>
            <button class="btn-mark" (click)="markAllRead()" [disabled]="unreadCount() === 0">
              {{ 'mark_all_as_read' | translate }}
            </button>
          </div>

          <div class="tabs">
            <button [class.active]="filter() === 'all'" (click)="filter.set('all')">{{ 'filter_all' | translate }}</button>
            <button [class.active]="filter() === 'unread'" (click)="filter.set('unread')">{{ 'filter_unread' | translate }}</button>
          </div>

          @if (filteredInbox().length === 0) {
            <div class="empty">{{ 'no_messages_yet' | translate }}</div>
          } @else {
            <ul class="msg-list">
              @for (m of filteredInbox(); track m.id) {
                <li class="msg-item" [class.unread]="!isRead(m)" (click)="onClick(m)">
                  <div class="avatar" [attr.data-role]="m.senderRole">{{ initial(m.senderName) }}</div>
                  <div class="body">
                    <div class="line1">
                      <span class="name">{{ m.senderName }}</span>
                      <span class="role-tag" [attr.data-role]="m.senderRole">{{ label(m.senderRole) }}</span>
                      <span class="time">{{ timeAgo(m.createdAt) }}</span>
                    </div>
                    @if (m.subject) {
                      <div class="subject">{{ m.subject }}</div>
                    }
                    <div class="content">{{ m.content }}</div>
                  </div>
                  @if (!isRead(m)) {
                    <span class="dot"></span>
                  }
                </li>
              }
            </ul>
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .msg-page { max-width: 1200px; margin: 0 auto; }

    .msg-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }
    .msg-header h1 { font-size: 26px; font-weight: 700; color: var(--heading-color); margin: 0; }
    .role-label { font-size: 13px; color: var(--text-muted); }

    .stats { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .chip { padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .chip-unread { background: rgba(239,68,68,0.1); color: #EF4444; }
    .chip-total { background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary); }
    .live {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: #2E7D32; font-weight: 700;
      padding: 4px 10px; background: #E8F5E9; border-radius: 20px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .grid {
      display: grid; grid-template-columns: 1fr 1.4fr; gap: 20px;
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }

    .card {
      background: var(--white, #fff); border-radius: var(--radius-md);
      padding: 20px; box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
    }
    .card h2 { font-size: 16px; font-weight: 700; color: var(--heading-color); margin: 0 0 14px; }

    .compose label {
      display: block; margin: 10px 0 6px;
      font-size: 13px; font-weight: 600; color: var(--text-primary);
    }
    .compose select, .compose input, .compose textarea {
      width: 100%; padding: 10px 12px;
      border: 1.5px solid var(--border); border-radius: var(--radius-sm);
      background: var(--off-white); color: var(--text-primary);
      font-size: 14px; font-family: inherit; transition: var(--transition);
    }
    .compose select:focus, .compose input:focus, .compose textarea:focus {
      border-color: var(--primary); background: var(--white);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
      outline: none;
    }
    .compose textarea { resize: vertical; min-height: 100px; }

    .btn-send {
      margin-top: 14px; width: 100%;
      padding: 12px; background: var(--primary); color: #fff;
      border: none; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: var(--transition);
    }
    .btn-send:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

    .sent-toast {
      margin-top: 10px; padding: 10px; background: #E8F5E9; color: #2E7D32;
      border-radius: var(--radius-sm); text-align: center; font-weight: 600; font-size: 13px;
    }

    .inbox-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }
    .btn-mark {
      padding: 6px 14px; background: transparent;
      border: 1px solid var(--primary); color: var(--primary);
      border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .btn-mark:disabled { opacity: 0.4; cursor: not-allowed; }

    .tabs {
      display: flex; gap: 6px; margin-bottom: 14px;
      border-bottom: 1px solid var(--border-light); padding-bottom: 8px;
    }
    .tabs button {
      padding: 6px 14px; background: transparent; border: none;
      font-size: 13px; font-weight: 600; color: var(--text-muted);
      cursor: pointer; border-radius: 6px;
    }
    .tabs button.active { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }

    .empty {
      text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 14px;
    }

    .msg-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; max-height: 560px; overflow-y: auto; }
    .msg-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px; background: var(--off-white);
      border-radius: var(--radius-sm); cursor: pointer;
      transition: var(--transition); position: relative;
      border: 1px solid transparent;
    }
    .msg-item:hover { background: var(--white); border-color: var(--border-light); box-shadow: var(--shadow-sm); }
    .msg-item.unread { background: color-mix(in srgb, var(--primary) 5%, transparent); border-right: 3px solid var(--primary); }

    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 15px; flex-shrink: 0;
    }
    .avatar[data-role="Admin"] { background: #6B8068; }
    .avatar[data-role="Therapist"] { background: #3B82F6; }
    .avatar[data-role="Parent"] { background: #F59E0B; }
    .avatar[data-role="External"] { background: #8B5CF6; }

    .body { flex: 1; min-width: 0; }
    .line1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .name { font-weight: 700; font-size: 14px; color: var(--heading-color); }
    .role-tag {
      font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 600;
    }
    .role-tag[data-role="Admin"] { background: #E8F0E6; color: #2D5A27; }
    .role-tag[data-role="Therapist"] { background: #DBEAFE; color: #1E40AF; }
    .role-tag[data-role="Parent"] { background: #FEF3C7; color: #92400E; }
    .role-tag[data-role="External"] { background: #EDE9FE; color: #5B21B6; }
    .time { font-size: 11px; color: var(--text-muted); margin-inline-start: auto; }
    .subject { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .content { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--primary); flex-shrink: 0; margin-top: 14px;
    }
  `,
})
export class UnifiedMessagesPage implements OnInit {
  @Input() role!: UserRole;

  private readonly bus = inject(LocalMessageBusService);
  private readonly auth = inject(AuthService);
  readonly ts = inject(TranslationService);

  readonly filter = signal<'all' | 'unread'>('all');
  readonly sentToast = signal(false);

  targetRole: UserRole = UserRole.Admin;
  subject = '';
  content = '';

  inbox = computed(() => this.bus.messages().filter((m) => m.recipientRole === this.role));
  unreadCount = computed(() => this.inbox().filter((m) => !this.isRead(m)).length);
  filteredInbox = computed(() => {
    const list = this.inbox();
    return this.filter() === 'unread' ? list.filter((m) => !this.isRead(m)) : list;
  });

  get roleLabel(): string { return this.ts.t(ROLE_LABEL_KEYS[this.role]); }
  get allowedTargets(): UserRole[] {
    const all = [UserRole.Admin, UserRole.Therapist, UserRole.Parent];
    return all.filter((r) => r !== this.role);
  }

  ngOnInit(): void {
    this.targetRole = this.allowedTargets[0];
  }

  label(role: SenderRole): string {
    const key = ROLE_LABEL_KEYS[role];
    return key ? this.ts.t(key) : String(role);
  }

  initial(name: string): string {
    return (name || '?').trim().charAt(0) || '?';
  }

  isRead(m: BusMessage): boolean {
    return m.readBy.includes(this.myId());
  }

  onClick(m: BusMessage): void {
    if (!this.isRead(m)) this.bus.markRead(m.id, this.myId());
  }

  markAllRead(): void {
    this.bus.markAllReadFor(this.role, this.myId());
  }

  send(): void {
    const text = this.content.trim();
    if (!text) return;
    this.bus.send({
      senderId: this.myId(),
      senderName: this.myName(),
      senderRole: this.role,
      recipientRole: this.targetRole,
      content: text,
      subject: this.subject.trim() || undefined,
    });
    this.content = '';
    this.subject = '';
    this.sentToast.set(true);
    setTimeout(() => this.sentToast.set(false), 2500);
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return this.ts.t('now');
    if (m < 60) return `${m} ${this.ts.t('time_minutes_short')}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ${this.ts.t('time_hours_short')}`;
    const d = Math.floor(h / 24);
    return `${d} ${this.ts.t('time_days_short')}`;
  }

  private myId(): string {
    return this.auth.user()?.id ?? `local-${this.role}`;
  }

  private myName(): string {
    return this.auth.user()?.name ?? this.ts.t(ROLE_LABEL_KEYS[this.role]);
  }
}
