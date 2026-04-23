import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Message, CreateMessageDto } from '../../../core/models/message.model';
import { MessageType } from '../../../core/models/enums';
import {
  TherapistService,
  ParentContact,
  BroadcastType,
} from '../../services/therapist.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-broadcast-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-wrapper">
      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <a class="tab-item" routerLink="/therapist/sessions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {{ 'add_session' | translate }}
        </a>
        <a class="tab-item active" routerLink="/therapist/broadcast">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
          {{ 'broadcast_center' | translate }}
        </a>
      </nav>

      <div class="broadcast-layout">
        <!-- Parent List Sidebar (Right in RTL) -->
        <aside class="parent-sidebar" [class.mobile-hidden]="!!selectedParent() && isMobile">
          <div class="sidebar-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ 'parents_list' | translate }}
            </h3>
          </div>

          @if (loadingParents()) {
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="parent-skeleton"></div>
            }
          } @else {
            <div class="parent-list">
              @for (parent of parents(); track parent.id) {
                <button
                  class="parent-item"
                  [class.selected]="selectedParent()?.id === parent.id"
                  (click)="selectParent(parent)"
                >
                  <div class="parent-avatar">{{ parent.name.charAt(0) }}</div>
                  <div class="parent-info">
                    <span class="parent-name">{{ parent.name }}</span>
                    <span class="parent-student">{{ 'parent_prefix' | translate }} {{ parent.studentName }}</span>
                  </div>
                  @if (parent.unreadCount > 0) {
                    <span class="unread-badge">{{ parent.unreadCount }}</span>
                  }
                </button>
              }
            </div>
          }
        </aside>

        <!-- Message Area -->
        <div class="message-area" [class.mobile-hidden]="!selectedParent() && isMobile">
          @if (!selectedParent()) {
            <div class="no-selection">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #6B8068)" stroke-width="1.5" opacity="0.4">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
              <h3>{{ 'broadcast_center' | translate }}</h3>
              <p>{{ 'select_parent_to_send' | translate }}</p>
            </div>
          } @else {
            <!-- Mobile Back Button -->
            <button class="mobile-back" (click)="clearSelection()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {{ 'back_to_list' | translate }}
            </button>

            <!-- Selected Parent Header -->
            <div class="selected-parent-header">
              <div class="parent-avatar large">{{ selectedParent()!.name.charAt(0) }}</div>
              <div>
                <h3>{{ selectedParent()!.name }}</h3>
                <span class="parent-student-label">{{ selectedParent()!.studentName }}</span>
              </div>
            </div>

            <!-- Quick Templates -->
            <div class="quick-templates">
              <h4>{{ 'quick_send' | translate }}</h4>
              <div class="template-buttons">
                <button
                  class="template-btn arrived"
                  (click)="sendQuickMessage(BroadcastType.ArrivedSafely, selectedParent()!.studentName + ' ' + ts.t('arrived_at_center_msg'))"
                  [disabled]="sending()"
                >
                  <span class="template-icon">\u{1F7E2}</span>
                  {{ 'arrived_safely' | translate }}
                </button>
                <button
                  class="template-btn completed"
                  (click)="sendQuickMessage(BroadcastType.SessionCompleted, selectedParent()!.studentName + ' - ' + ts.t('session_completed_msg'))"
                  [disabled]="sending()"
                >
                  <span class="template-icon">\u2705</span>
                  {{ 'session_completed' | translate }}
                </button>
                <button
                  class="template-btn supplies"
                  (click)="sendQuickMessage(BroadcastType.NeedsSupplies, ts.t('needs_supplies_msg') + ' ' + selectedParent()!.studentName)"
                  [disabled]="sending()"
                >
                  <span class="template-icon">\u{1F4E6}</span>
                  {{ 'needs_supplies' | translate }}
                </button>
              </div>
            </div>

            <!-- Custom Message -->
            <div class="custom-message">
              <h4>{{ 'custom_message' | translate }}</h4>
              <div class="message-input-row">
                <textarea
                  [(ngModel)]="customMessage"
                  [placeholder]="ts.t('write_message_placeholder')"
                  rows="2"
                ></textarea>
                <button
                  class="btn-send"
                  (click)="sendCustomMessage()"
                  [disabled]="sending() || !customMessage.trim()"
                >
                  @if (sending()) {
                    <span class="spinner"></span>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Message Timeline -->
            <div class="timeline-section">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ 'sent_messages_log' | translate }}
              </h4>

              @if (loadingMessages()) {
                @for (i of [1, 2, 3]; track i) {
                  <div class="timeline-skeleton"></div>
                }
              } @else if (messages().length === 0) {
                <div class="empty-timeline">
                  <p>{{ 'no_sent_messages' | translate }}</p>
                </div>
              } @else {
                <div class="timeline">
                  @for (msg of messages(); track msg.id) {
                    <div class="timeline-item">
                      <div class="timeline-dot" [attr.data-type]="msg.messageType">
                        {{ getMessageIcon(msg.messageType) }}
                      </div>
                      <div class="timeline-content">
                        <p class="timeline-text">{{ msg.content }}</p>
                        <div class="timeline-meta">
                          <span class="timeline-time">{{ formatTime(msg.createdAt) }}</span>
                          <span class="read-status" [class.read]="msg.isRead" [class.unread]="!msg.isRead">
                            @if (msg.isRead) {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              {{ 'read' | translate }}
                            } @else {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                              {{ 'unread' | translate }}
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Toast -->
      @if (toast()) {
        <div class="toast" [class.success]="toast()!.type === 'success'" [class.error]="toast()!.type === 'error'">
          @if (toast()!.type === 'success') {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          }
          {{ toast()!.message }}
        </div>
      }
    </div>
  `,
  styles: `
    .page-wrapper {
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tab Navigation */
    .tab-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: white;
      padding: 0.5rem;
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
    }

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 0.9rem 1.5rem;
      border-radius: var(--radius-sm, 8px);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-muted, #6B7B68);
      transition: var(--transition, all 0.3s ease);
      text-decoration: none;
    }

    .tab-item:hover {
      background: var(--light-green, #E8EDE7);
      color: var(--primary-dark, #2D3E28);
    }

    .tab-item.active {
      background: var(--primary, #6B8068);
      color: white;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    /* Broadcast Layout */
    .broadcast-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
      min-height: 600px;
    }

    /* Parent Sidebar */
    .parent-sidebar {
      background: white;
      border-radius: var(--radius-lg, 16px);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1.2rem 1.5rem;
      border-bottom: 2px solid var(--light-green, #E8EDE7);
    }

    .sidebar-header h3 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
    }

    .parent-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .parent-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.9rem 1rem;
      border-radius: var(--radius-sm, 8px);
      background: none;
      border: none;
      cursor: pointer;
      transition: var(--transition, all 0.3s ease);
      text-align: right;
    }

    .parent-item:hover {
      background: var(--light-green, #E8EDE7);
    }

    .parent-item.selected {
      background: var(--primary, #6B8068);
      color: white;
    }

    .parent-item.selected .parent-student {
      color: rgba(255, 255, 255, 0.8);
    }

    .parent-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--light-green, #E8EDE7);
      color: var(--primary-dark, #2D3E28);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .parent-item.selected .parent-avatar {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .parent-avatar.large {
      width: 48px;
      height: 48px;
      font-size: 1.2rem;
    }

    .parent-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .parent-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .parent-student {
      font-size: 0.75rem;
      color: var(--text-muted, #6B7B68);
    }

    .parent-student-label {
      font-size: 0.8rem;
      color: var(--text-muted, #6B7B68);
    }

    .unread-badge {
      background: var(--error, #C0392B);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
      min-width: 22px;
      text-align: center;
    }

    .parent-skeleton {
      height: 56px;
      margin: 0.5rem;
      background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-sm, 8px);
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Message Area */
    .message-area {
      background: white;
      border-radius: var(--radius-lg, 16px);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted, #6B7B68);
    }

    .no-selection h3 {
      font-size: 1.2rem;
      color: var(--primary-dark, #2D3E28);
    }

    .no-selection p {
      font-size: 0.95rem;
    }

    .mobile-back {
      display: none;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      color: var(--primary, #6B8068);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0;
    }

    .selected-parent-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--light-green, #E8EDE7);
    }

    .selected-parent-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
    }

    /* Quick Templates */
    .quick-templates h4,
    .custom-message h4,
    .timeline-section h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .template-buttons {
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
    }

    .template-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.2rem;
      border-radius: var(--radius-sm, 8px);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition, all 0.3s ease);
      border: 2px solid transparent;
    }

    .template-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .template-btn.arrived {
      background: #E8F5E9;
      color: #2E7D32;
      border-color: #A5D6A7;
    }

    .template-btn.arrived:hover:not(:disabled) {
      background: #C8E6C9;
      transform: translateY(-1px);
    }

    .template-btn.completed {
      background: #E3F2FD;
      color: #1565C0;
      border-color: #90CAF9;
    }

    .template-btn.completed:hover:not(:disabled) {
      background: #BBDEFB;
      transform: translateY(-1px);
    }

    .template-btn.supplies {
      background: #FFF3E0;
      color: #E65100;
      border-color: #FFCC80;
    }

    .template-btn.supplies:hover:not(:disabled) {
      background: #FFE0B2;
      transform: translateY(-1px);
    }

    .template-icon {
      font-size: 1.1rem;
    }

    /* Custom Message */
    .message-input-row {
      display: flex;
      gap: 0.8rem;
      align-items: flex-end;
    }

    .message-input-row textarea {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid var(--light-green, #E8EDE7);
      border-radius: var(--radius-sm, 8px);
      font-size: 0.95rem;
      resize: vertical;
      min-height: 48px;
      background: var(--off-white, #F4F6F3);
      transition: var(--transition, all 0.3s ease);
      color: var(--text-dark, #1A2A17);
    }

    .message-input-row textarea:focus {
      border-color: var(--primary, #6B8068);
      background: white;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
      outline: none;
    }

    .btn-send {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm, 8px);
      background: linear-gradient(135deg, var(--primary, #6B8068), var(--primary-dark, #2D3E28));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition, all 0.3s ease);
      border: none;
      flex-shrink: 0;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .btn-send:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--primary) 40%, transparent);
    }

    .btn-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Timeline */
    .timeline-section {
      border-top: 2px solid var(--light-green, #E8EDE7);
      padding-top: 1.5rem;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .timeline-dot {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .timeline-dot[data-type="General"] { background: #E8F5E9; }
    .timeline-dot[data-type="Report"] { background: #E3F2FD; }
    .timeline-dot[data-type="Alert"] { background: #FFF3E0; }
    .timeline-dot[data-type="Broadcast"] { background: var(--light-green, #E8EDE7); }

    .timeline-content {
      flex: 1;
      background: var(--off-white, #F4F6F3);
      padding: 1rem 1.2rem;
      border-radius: var(--radius-sm, 8px);
      border-right: 3px solid var(--primary, #6B8068);
    }

    .timeline-text {
      font-size: 0.9rem;
      color: var(--text-dark, #1A2A17);
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .timeline-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .timeline-time {
      font-size: 0.75rem;
      color: var(--text-muted, #6B7B68);
    }

    .read-status {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .read-status.read {
      color: #2E7D32;
    }

    .read-status.unread {
      color: #999;
    }

    .timeline-skeleton {
      height: 72px;
      background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-sm, 8px);
      animation: shimmer 1.5s infinite;
      margin-bottom: 0.8rem;
    }

    .empty-timeline {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-muted, #6B7B68);
      font-size: 0.9rem;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-sm, 8px);
      font-weight: 600;
      font-size: 0.95rem;
      z-index: 1000;
      animation: toastIn 0.4s ease;
      box-shadow: var(--shadow-lg, 0 8px 40px rgba(0, 0, 0, 0.16));
    }

    .toast.success {
      background: #E8F5E9;
      color: #2E7D32;
      border: 1px solid #A5D6A7;
    }

    .toast.error {
      background: #FFEBEE;
      color: #C62828;
      border: 1px solid #EF9A9A;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @media (max-width: 768px) {
      .broadcast-layout {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .parent-sidebar {
        max-height: 400px;
      }

      .mobile-hidden {
        display: none !important;
      }

      .mobile-back {
        display: flex;
      }

      .message-area {
        padding: 1.5rem;
      }

      .template-buttons {
        flex-direction: column;
      }

      .template-btn {
        justify-content: center;
      }

      .tab-nav {
        flex-direction: column;
      }

      .tab-item {
        padding: 0.75rem 1rem;
      }
    }
  `,
})
export class BroadcastPage implements OnInit {
  readonly BroadcastType = BroadcastType;

  parents = signal<ParentContact[]>([]);
  loadingParents = signal(true);
  selectedParent = signal<ParentContact | null>(null);
  messages = signal<Message[]>([]);
  loadingMessages = signal(false);
  sending = signal(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  customMessage = '';
  isMobile = false;

  constructor(
    private readonly therapist: TherapistService,
    public readonly ts: TranslationService,
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
    this.loadParents();
  }

  loadParents(): void {
    this.loadingParents.set(true);
    this.therapist.getParentContacts().subscribe({
      next: (parents) => {
        this.parents.set(parents);
        this.loadingParents.set(false);
      },
      error: () => {
        this.loadingParents.set(false);
        this.showToast(this.ts.t('error_loading_parents'), 'error');
      },
    });
  }

  selectParent(parent: ParentContact): void {
    this.selectedParent.set(parent);
    this.loadMessages(parent.id);
  }

  clearSelection(): void {
    this.selectedParent.set(null);
    this.messages.set([]);
  }

  loadMessages(parentId: string): void {
    this.loadingMessages.set(true);
    this.therapist.getSentMessages(parentId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.loadingMessages.set(false);
      },
      error: () => {
        this.loadingMessages.set(false);
      },
    });
  }

  private getMessageType(broadcastType: BroadcastType): MessageType {
    switch (broadcastType) {
      case BroadcastType.ArrivedSafely: return MessageType.General;
      case BroadcastType.SessionCompleted: return MessageType.Report;
      case BroadcastType.NeedsSupplies: return MessageType.Alert;
      case BroadcastType.Custom: return MessageType.Broadcast;
    }
  }

  private getSubject(broadcastType: BroadcastType): string {
    switch (broadcastType) {
      case BroadcastType.ArrivedSafely: return this.ts.t('arrived_safely');
      case BroadcastType.SessionCompleted: return this.ts.t('session_completed');
      case BroadcastType.NeedsSupplies: return this.ts.t('needs_supplies');
      case BroadcastType.Custom: return this.ts.t('subject_update');
    }
  }

  sendQuickMessage(type: BroadcastType, content: string): void {
    const parent = this.selectedParent();
    if (!parent) return;

    this.sending.set(true);
    const dto: CreateMessageDto = {
      receiverId: parent.id,
      subject: this.getSubject(type),
      content,
      messageType: this.getMessageType(type),
      isBroadcast: false,
    };

    this.therapist.sendMessage(dto).subscribe({
      next: (msg) => {
        this.messages.update((msgs) => [msg, ...msgs]);
        this.sending.set(false);
        this.showToast(this.ts.t('update_sent_success'), 'success');
      },
      error: () => {
        this.sending.set(false);
        this.showToast(this.ts.t('error_sending_retry'), 'error');
      },
    });
  }

  sendCustomMessage(): void {
    if (!this.customMessage.trim()) return;
    const parent = this.selectedParent();
    if (!parent) return;

    this.sending.set(true);
    const dto: CreateMessageDto = {
      receiverId: parent.id,
      subject: this.ts.t('subject_update'),
      content: this.customMessage.trim(),
      messageType: MessageType.Broadcast,
      isBroadcast: false,
    };

    this.therapist.sendMessage(dto).subscribe({
      next: (msg) => {
        this.messages.update((msgs) => [msg, ...msgs]);
        this.customMessage = '';
        this.sending.set(false);
        this.showToast(this.ts.t('message_sent_success'), 'success');
      },
      error: () => {
        this.sending.set(false);
        this.showToast(this.ts.t('error_sending_retry'), 'error');
      },
    });
  }

  getMessageIcon(type: MessageType | string): string {
    switch (type) {
      case MessageType.General: return '\u{1F7E2}';
      case MessageType.Report: return '\u2705';
      case MessageType.Alert: return '\u{1F4E6}';
      case MessageType.Broadcast: return '\u{1F4AC}';
      default: return '\u{1F4AC}';
    }
  }

  formatTime(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      const locale = this.ts.isArabic() ? 'ar-SA' : 'en-US';
      return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) +
        ' - ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
