import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ParentService, dayOfWeekName, formatTime12h } from '../../services/parent.service';
import { Message } from '../../../core/models/message.model';
import { SessionSchedule } from '../../../core/models/schedule.model';
import { Student } from '../../../core/models/student.model';
import { DisabilityType, Gender } from '../../../core/models/enums';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AvatarComponent } from '../../../shared/components/avatar';

@Component({
  selector: 'app-parent-dashboard-page',
  imports: [RouterLink, TranslatePipe, AvatarComponent],
  template: `
    <!-- Welcome Card -->
    <div class="welcome-card">
      <div class="welcome-content">
        @if (studentInfo(); as student) {
          <div class="welcome-student-row">
            <app-avatar [name]="student.fullName" [imageUrl]="student.avatarUrl ?? ''" size="56px" />
            <div>
              <h1 class="welcome-title">{{ 'welcome_parent' | translate }}</h1>
              <p class="welcome-subtitle">{{ 'follow_progress' | translate }}</p>
            </div>
          </div>
        } @else {
          <h1 class="welcome-title">{{ 'welcome_parent' | translate }}</h1>
          <p class="welcome-subtitle">{{ 'follow_progress' | translate }}</p>
        }
      </div>
      <div class="welcome-icon">
        <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
          <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.2)"/>
          <path d="M40 24c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16-7.16-16-16-16zm0 4.8c2.64 0 4.8 2.16 4.8 4.8s-2.16 4.8-4.8 4.8-4.8-2.16-4.8-4.8 2.16-4.8 4.8-4.8zm0 22.72c-4 0-7.52-2.04-9.6-5.12.04-3.2 6.4-4.96 9.6-4.96s9.56 1.76 9.6 4.96c-2.08 3.08-5.6 5.12-9.6 5.12z" fill="rgba(255,255,255,0.9)"/>
        </svg>
      </div>
    </div>

    <!-- Student Info Card -->
    @if (studentInfo(); as student) {
      <div class="student-info-card">
        <div class="student-info-header">
          <app-avatar [name]="student.fullName" [imageUrl]="student.avatarUrl ?? ''" size="48px" />
          <div class="student-info-text">
            <h3 class="student-info-name">{{ student.fullName }}</h3>
            <span class="student-info-label">{{ getDisabilityLabel(student.disabilityType) }}</span>
          </div>
        </div>
        <div class="student-info-details">
          <div class="info-detail-item">
            <span class="info-detail-label">{{ 'date_of_birth' | translate }}</span>
            <span class="info-detail-value">{{ student.dateOfBirth }}</span>
          </div>
          <div class="info-detail-item">
            <span class="info-detail-label">{{ 'gender' | translate }}</span>
            <span class="info-detail-value">{{ getGenderLabel(student.gender) }}</span>
          </div>
          <div class="info-detail-item">
            <span class="info-detail-label">{{ 'status' | translate }}</span>
            <span class="badge" [class.badge--active]="student.isActive" [class.badge--inactive]="!student.isActive">
              {{ student.isActive ? ('active' | translate) : ('inactive' | translate) }}
            </span>
          </div>
        </div>
      </div>
    }

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3 class="stat-title">{{ 'monthly_reports' | translate }}</h3>
          <p class="stat-value">{{ 'march_report_ready' | translate }}</p>
        </div>
        <button class="stat-btn" routerLink="/parent/reports">{{ 'view_details' | translate }}</button>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3 class="stat-title">{{ 'weekly_progress' | translate }}</h3>
          <p class="stat-value">{{ 'sessions_completed_week' | translate }}</p>
        </div>
        <button class="stat-btn" routerLink="/parent/reports">{{ 'view_details' | translate }}</button>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3 class="stat-title">{{ 'new_messages' | translate }}</h3>
          <p class="stat-value">
            @if (loadingMessages()) {
              {{ 'loading_generic' | translate }}
            } @else {
              {{ unreadCount() }} {{ 'unread_messages_label' | translate }}
            }
          </p>
        </div>
        <button class="stat-btn" routerLink="/parent/messages">{{ 'view_details' | translate }}</button>
      </div>
    </div>

    <!-- Next Session Card -->
    <div class="section-row">
      <div class="next-session-card">
        <div class="section-header">
          <h2 class="section-title">{{ 'next_session' | translate }}</h2>
        </div>
        @if (loadingSchedule()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>{{ 'loading_sessions_text' | translate }}</span>
          </div>
        } @else if (nextSession(); as session) {
          <div class="session-detail">
            <div class="session-name">{{ getSessionDisplayName(session) }}</div>
            <div class="session-meta">
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ getDayName(session.dayOfWeek) }} {{ getTime(session.startTime) }} - {{ getTime(session.endTime) }}</span>
              </div>
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ session.room ?? ts.t('not_specified') }}</span>
              </div>
              <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{{ session.therapistName }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="empty-state">{{ 'no_upcoming_sessions' | translate }}</div>
        }
      </div>
    </div>

    <!-- Recent Messages -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">{{ 'recent_messages' | translate }}</h2>
        <a routerLink="/parent/messages" class="view-all-btn">{{ 'view_all' | translate }}</a>
      </div>

      @if (loadingMessages()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>{{ 'loading_messages_text' | translate }}</span>
        </div>
      } @else if (recentMessages().length === 0) {
        <div class="empty-state">{{ 'no_messages_currently' | translate }}</div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'therapist_name_col' | translate }}</th>
                <th>{{ 'subject' | translate }}</th>
                <th>{{ 'date' | translate }}</th>
                <th>{{ 'status' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (msg of recentMessages(); track msg.id) {
                <tr>
                  <td class="cell-name">{{ msg.senderName }}</td>
                  <td class="cell-subject">{{ msg.subject }}</td>
                  <td class="cell-date">{{ formatDate(msg.createdAt) }}</td>
                  <td>
                    <span class="badge" [class.badge--unread]="!msg.isRead" [class.badge--read]="msg.isRead">
                      {{ msg.isRead ? ('read_msg' | translate) : ('unread_msg' | translate) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Schedule Preview -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">{{ 'upcoming_schedule' | translate }}</h2>
        <a routerLink="/parent/schedule" class="view-all-btn">{{ 'view_all' | translate }}</a>
      </div>

      @if (loadingSchedule()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>{{ 'loading_schedule_text' | translate }}</span>
        </div>
      } @else if (upcomingSessions().length === 0) {
        <div class="empty-state">{{ 'no_scheduled_sessions' | translate }}</div>
      } @else {
        <div class="schedule-grid">
          @for (session of upcomingSessions(); track session.id) {
            <div class="schedule-card">
              <div class="schedule-card-header">
                <h3 class="schedule-name">{{ getSessionDisplayName(session) }}</h3>
              </div>
              <div class="schedule-card-body">
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ getDayName(session.dayOfWeek) }} {{ getTime(session.startTime) }} - {{ getTime(session.endTime) }}</span>
                </div>
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{{ session.therapistName }}</span>
                </div>
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ session.room ?? ts.t('not_specified') }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Welcome Card */
    .welcome-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      border-radius: var(--radius-lg);
      padding: 32px;
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .welcome-card .welcome-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #fff;
    }

    .welcome-card .welcome-subtitle {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .welcome-icon {
      flex-shrink: 0;
    }

    .welcome-student-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Student Info Card */
    .student-info-card {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 20px 24px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 24px;
    }

    .student-info-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--light-green);
    }

    .student-info-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 2px;
    }

    .student-info-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .student-info-details {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .info-detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-detail-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .info-detail-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--heading-color);
    }

    .badge--active {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #E8F5E9;
      color: #2E7D32;
    }

    .badge--inactive {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #F5F5F5;
      color: #757575;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: var(--transition);
    }

    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon--blue {
      background: #E3F2FD;
      color: #1976D2;
    }

    .stat-icon--green {
      background: #E8F5E9;
      color: #388E3C;
    }

    .stat-icon--orange {
      background: #FFF3E0;
      color: #F57C00;
    }

    .stat-title {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .stat-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--heading-color);
    }

    .stat-btn {
      background: var(--off-white);
      color: var(--primary);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      transition: var(--transition);
      align-self: flex-start;
    }

    .stat-btn:hover {
      background: var(--primary);
      color: var(--white);
    }

    /* Next Session */
    .section-row {
      margin-bottom: 24px;
    }

    .next-session-card {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .session-detail {
      margin-top: 12px;
    }

    .session-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 12px;
    }

    .session-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .meta-item svg {
      flex-shrink: 0;
      color: var(--primary);
    }

    /* Section */
    .section {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--heading-color);
    }

    .view-all-btn {
      font-size: 0.85rem;
      color: var(--primary);
      font-weight: 600;
      padding: 6px 16px;
      border-radius: var(--radius-sm);
      background: var(--off-white);
      transition: var(--transition);
    }

    .view-all-btn:hover {
      background: var(--primary);
      color: var(--white);
    }

    /* Table */
    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: right;
      padding: 12px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--light-green);
      white-space: nowrap;
    }

    .data-table td {
      padding: 14px 16px;
      font-size: 0.88rem;
      border-bottom: 1px solid var(--light-green);
    }

    .data-table tbody tr:hover {
      background: var(--off-white);
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .cell-name {
      font-weight: 600;
      color: var(--heading-color);
      white-space: nowrap;
    }

    .cell-subject {
      color: var(--text-muted);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cell-date {
      color: var(--text-muted);
      font-size: 0.82rem;
      white-space: nowrap;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge--unread {
      background: #E8F5E9;
      color: #2E7D32;
    }

    .badge--read {
      background: #F5F5F5;
      color: #757575;
    }

    /* Schedule Grid */
    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .schedule-card {
      background: var(--off-white);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: var(--transition);
    }

    .schedule-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .schedule-card-header {
      background: var(--primary);
      color: var(--white);
      padding: 14px 16px;
    }

    .schedule-name {
      font-size: 0.9rem;
      font-weight: 700;
    }

    .schedule-card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Loading / Empty */
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--light-green);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .schedule-grid {
        grid-template-columns: 1fr;
      }

      .welcome-card {
        padding: 24px;
      }

      .welcome-icon {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .session-meta {
        flex-direction: column;
        gap: 8px;
      }

      .welcome-title {
        font-size: 1.15rem;
      }
    }
  `,
})
export class ParentDashboardPage implements OnInit {
  private readonly parentService = inject(ParentService);
  readonly ts = inject(TranslationService);

  readonly loadingMessages = signal(true);
  readonly loadingSchedule = signal(true);
  readonly recentMessages = signal<Message[]>([]);
  readonly unreadCount = signal(0);
  readonly upcomingSessions = signal<SessionSchedule[]>([]);
  readonly nextSession = signal<SessionSchedule | null>(null);
  readonly studentInfo = signal<Student | null>(null);

  private readonly sessionNameKeys: Record<string, string> = {
    s1: 'speech_language_session',
    s2: 'occupational_therapy_session',
    s3: 'social_interaction_session',
    s4: 'behavior_modification_session',
  };

  ngOnInit(): void {
    this.loadMessages();
    this.loadSchedule();
    this.loadStudentInfo();
  }

  getSessionDisplayName(s: SessionSchedule): string {
    const specMap: Record<string, string> = {
      SpeechTherapy: this.ts.t('speech_therapy_spec'),
      OccupationalTherapy: this.ts.t('occupational_therapy'),
      PhysicalTherapy: this.ts.t('physical_therapy_spec'),
      Psychology: this.ts.t('psychology_spec'),
      BehavioralTherapy: this.ts.t('behavioral_therapy'),
    };
    const key = (s as any).sessionType ?? (s as any).specialization;
    if (key && specMap[key]) return specMap[key];
    const nameKey = this.sessionNameKeys[s.therapistId];
    return nameKey ? this.ts.t(nameKey) : this.ts.t('therapy_session');
  }

  getDayName(day: number): string {
    return dayOfWeekName(day, this.ts);
  }

  getTime(t: string): string {
    return formatTime12h(t, this.ts);
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return iso.substring(0, 10);
  }

  getDisabilityLabel(type: DisabilityType): string {
    const map: Record<string, string> = {
      [DisabilityType.Autism]: this.ts.t('autism'),
      [DisabilityType.DownSyndrome]: this.ts.t('down_syndrome'),
      [DisabilityType.CerebralPalsy]: this.ts.t('cerebral_palsy'),
      [DisabilityType.IntellectualDisability]: this.ts.t('intellectual_disability'),
      [DisabilityType.ADHD]: this.ts.t('adhd'),
      [DisabilityType.SpeechDelay]: this.ts.t('speech_delay'),
      [DisabilityType.HearingImpairment]: this.ts.t('hearing_impairment'),
      [DisabilityType.VisualImpairment]: this.ts.t('visual_impairment'),
      [DisabilityType.MultipleDisabilities]: this.ts.t('multiple_disabilities'),
      [DisabilityType.Other]: this.ts.t('other'),
    };
    return map[type] ?? type;
  }

  getGenderLabel(gender: Gender): string {
    return gender === Gender.Male ? this.ts.t('male') : this.ts.t('female');
  }

  private loadStudentInfo(): void {
    this.parentService.getMyChildren().subscribe({
      next: (children) => {
        if (children.length > 0) {
          this.studentInfo.set(children[0]);
        }
      },
      error: () => {},
    });
  }

  private loadMessages(): void {
    this.parentService.getMyMessages().subscribe({
      next: (messages) => {
        this.recentMessages.set(messages.slice(0, 4));
        this.unreadCount.set(messages.filter(m => !m.isRead).length);
        this.loadingMessages.set(false);
      },
      error: () => {
        this.loadingMessages.set(false);
      },
    });
  }

  private loadSchedule(): void {
    this.parentService.getMySchedule().subscribe({
      next: (sessions) => {
        this.upcomingSessions.set(sessions.slice(0, 3));
        this.nextSession.set(sessions[0] ?? null);
        this.loadingSchedule.set(false);
      },
      error: () => {
        this.loadingSchedule.set(false);
      },
    });
  }
}
