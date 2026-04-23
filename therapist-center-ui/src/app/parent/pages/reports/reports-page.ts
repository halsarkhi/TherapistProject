import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ParentService } from '../../services/parent.service';
import { TherapySession } from '../../../core/models/session.model';
import { SessionStatus } from '../../../core/models/enums';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface MonthGroup {
  month: string;
  sessions: TherapySession[];
}

const MONTH_KEYS: Record<number, string> = {
  0: 'month_january', 1: 'month_february', 2: 'month_march', 3: 'month_april',
  4: 'month_may', 5: 'month_june', 6: 'month_july', 7: 'month_august',
  8: 'month_september', 9: 'month_october', 10: 'month_november', 11: 'month_december',
};

@Component({
  selector: 'app-reports-page',
  imports: [TranslatePipe],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ 'progress_reports' | translate }}</h1>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <span>{{ 'loading_reports_text' | translate }}</span>
      </div>
    } @else if (errorMsg()) {
      <div class="error-state">
        <span>{{ errorMsg() }}</span>
        <button class="retry-btn" (click)="loadReports()">{{ 'retry' | translate }}</button>
      </div>
    } @else if (groupedReports().length === 0) {
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>{{ 'no_reports_currently' | translate }}</p>
      </div>
    } @else {
      @for (group of groupedReports(); track group.month) {
        <div class="month-group">
          <div class="month-label">
            <div class="month-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span>{{ group.month }}</span>
          </div>

          <div class="reports-list">
            @for (session of group.sessions; track session.id) {
              <div class="report-card">
                <div class="report-card-right">
                  <div class="report-type-badge">{{ getTypeLabel(session.sessionType) }}</div>
                  <div class="report-details">
                    <div class="report-date">{{ session.scheduledDate }}</div>
                    <div class="report-therapist">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {{ session.therapistName }}
                    </div>
                  </div>
                </div>
                <div class="report-summary">
                  @if (session.summary) {
                    <p>{{ session.summary }}</p>
                  } @else if (session.notes) {
                    <p>{{ session.notes }}</p>
                  } @else {
                    <p class="no-summary">{{ 'no_summary' | translate }}</p>
                  }
                </div>
                <div class="report-status">
                  <span class="status-badge status-badge--completed">{{ 'completed' | translate }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--heading-color);
    }

    /* Month Group */
    .month-group {
      margin-bottom: 32px;
    }

    .month-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading-color);
    }

    .month-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Report Cards */
    .reports-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .report-card {
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      gap: 20px;
      align-items: center;
      transition: var(--transition);
    }

    .report-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .report-card-right {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .report-type-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--light-green);
      color: var(--heading-color);
      align-self: flex-start;
    }

    .report-date {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .report-therapist {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .report-summary p {
      font-size: 0.88rem;
      color: var(--text-dark);
      line-height: 1.7;
    }

    .no-summary {
      color: var(--text-muted) !important;
      font-style: italic;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-badge--completed {
      background: #E8F5E9;
      color: #2E7D32;
    }

    /* States */
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 64px 24px;
      color: var(--text-muted);
      font-size: 0.95rem;
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--light-green);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: var(--text-muted);
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .empty-state svg {
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .error-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--error);
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .retry-btn {
      padding: 8px 20px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--white);
      font-size: 0.85rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .report-card {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .report-status {
        justify-self: start;
      }
    }
  `,
})
export class ReportsPage implements OnInit {
  private readonly parentService = inject(ParentService);
  private readonly ts = inject(TranslationService);

  readonly loading = signal(true);
  readonly errorMsg = signal('');
  readonly sessions = signal<TherapySession[]>([]);

  readonly groupedReports = computed<MonthGroup[]>(() => {
    const completed = this.sessions().filter(s => s.status === SessionStatus.Completed);
    const months = new Map<string, TherapySession[]>();

    for (const session of completed) {
      const monthKey = this.getMonthLabel(session.scheduledDate ?? session.sessionDate ?? '');
      const existing = months.get(monthKey) ?? [];
      existing.push(session);
      months.set(monthKey, existing);
    }

    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, sessions]) => ({ month, sessions }));
  });

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.parentService.getMyStudentSessions().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set(this.ts.t('error_loading_reports'));
        this.loading.set(false);
      },
    });
  }

  getTypeLabel(type: string): string {
    const sessionTypeMap: Record<string, string> = {
      Individual: this.ts.t('individual_session_type'),
      Group: this.ts.t('group_session_type'),
      Assessment: this.ts.t('assessment_type'),
      Consultation: this.ts.t('consultation_type'),
    };
    const specMap: Record<string, string> = {
      SpeechTherapy: this.ts.t('speech_therapy_spec'),
      OccupationalTherapy: this.ts.t('occupational_therapy'),
      PhysicalTherapy: this.ts.t('physical_therapy_spec'),
      Psychology: this.ts.t('psychology_spec'),
      BehavioralTherapy: this.ts.t('behavioral_therapy'),
    };
    return specMap[type] ?? sessionTypeMap[type] ?? type;
  }

  private getMonthLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const key = MONTH_KEYS[date.getMonth()];
    const month = key ? this.ts.t(key) : '';
    return `${month} ${date.getFullYear()}`;
  }
}
