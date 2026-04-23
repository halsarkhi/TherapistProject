import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ParentService, dayOfWeekName, formatTime12h } from '../../services/parent.service';
import { SessionSchedule } from '../../../core/models/schedule.model';
import { TherapySession } from '../../../core/models/session.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface DayGroup {
  day: string;
  dayNum: number;
  sessions: SessionSchedule[];
}

@Component({
  selector: 'app-schedule-page',
  imports: [TranslatePipe],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ 'session_schedule' | translate }}</h1>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <span>{{ 'loading_schedule_text' | translate }}</span>
      </div>
    } @else if (errorMsg()) {
      <div class="error-state">
        <span>{{ errorMsg() }}</span>
        <button class="retry-btn" (click)="loadSchedule()">{{ 'retry' | translate }}</button>
      </div>
    } @else if (groupedSessions().length === 0) {
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>{{ 'no_scheduled_sessions' | translate }}</p>
      </div>
    } @else {
      <div class="days-grid">
      @for (group of groupedSessions(); track group.dayNum) {
        <div class="day-group">
          <div class="day-label">
            <div class="day-dot"></div>
            <span>{{ group.day }}</span>
          </div>
          <div class="sessions-grid">
            @for (session of group.sessions; track session.id) {
              <div class="session-card">
                <div class="session-card-header">
                  <h3 class="session-name">{{ getSessionDisplayName(session) }}</h3>
                </div>
                <div class="session-card-body">
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
                <div class="session-card-footer">
                  <button class="detail-btn" (click)="openDetailModal(session)">{{ 'session_details' | translate }}</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
      </div>
    }

    <!-- Session Detail Modal -->
    @if (showDetailModal() && selectedSession()) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <!-- Close button -->
          <button class="modal-close-x" (click)="closeDetailModal()">&times;</button>

          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ getSessionDisplayName(selectedSession()!) }}</h2>
            <p class="modal-subtitle">{{ selectedSession()!.studentName }}</p>
          </div>

          <!-- Info Cards -->
          <div class="modal-body">
            <div class="info-grid">
              <div class="info-card">
                <span class="info-icon">📅</span>
                <span class="info-label">{{ 'day_label' | translate }}</span>
                <span class="info-value">{{ getDayName(selectedSession()!.dayOfWeek) }}</span>
              </div>
              <div class="info-card">
                <span class="info-icon">⏰</span>
                <span class="info-label">{{ 'time_label' | translate }}</span>
                <span class="info-value">{{ getTime(selectedSession()!.startTime) }} - {{ getTime(selectedSession()!.endTime) }}</span>
              </div>
              <div class="info-card">
                <span class="info-icon">👨‍⚕️</span>
                <span class="info-label">{{ 'therapist_label' | translate }}</span>
                <span class="info-value">{{ selectedSession()!.therapistName }}</span>
              </div>
              <div class="info-card">
                <span class="info-icon">🏥</span>
                <span class="info-label">{{ 'room_label' | translate }}</span>
                <span class="info-value">{{ selectedSession()!.room ?? ts.t('not_specified') }}</span>
              </div>
              <div class="info-card">
                <span class="info-icon">📋</span>
                <span class="info-label">{{ 'specialization_label' | translate }}</span>
                <span class="info-value">{{ getSpecializationName(selectedSession()!) }}</span>
              </div>
              <div class="info-card">
                <span class="info-icon">✅</span>
                <span class="info-label">{{ 'status_label' | translate }}</span>
                <span class="info-value" [class.status-active]="selectedSession()!.isActive" [class.status-inactive]="!selectedSession()!.isActive">
                  {{ selectedSession()!.isActive ? ts.t('active_status') : ts.t('inactive_status') }}
                </span>
              </div>
            </div>

            <!-- Recent Completed Sessions -->
            <div class="recent-section">
              <h3 class="recent-title">{{ 'recent_completed' | translate }}</h3>
              @if (loadingRelated()) {
                <div class="recent-loading">
                  <div class="spinner-sm"></div>
                </div>
              } @else if (relatedSessions().length === 0) {
                <p class="no-sessions">{{ 'no_completed_sessions' | translate }}</p>
              } @else {
                <div class="recent-list">
                  @for (rs of relatedSessions(); track rs.id) {
                    <div class="recent-card">
                      <div class="recent-date">
                        <span class="recent-date-label">{{ 'session_date' | translate }}:</span>
                        <span>{{ rs.scheduledDate ?? rs.sessionDate ?? '-' }}</span>
                      </div>
                      @if (rs.summary) {
                        <div class="recent-summary">
                          <span class="recent-summary-label">{{ 'session_summary_label' | translate }}:</span>
                          <span>{{ rs.summary }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="close-btn" (click)="closeDetailModal()">{{ 'close' | translate }}</button>
          </div>
        </div>
      </div>
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

    /* Days Grid - distributes day groups into columns */
    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      align-items: start;
    }

    /* Day Group */
    .day-group {
      margin-bottom: 0;
    }

    .day-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading-color);
    }

    .day-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary);
    }

    /* Sessions Grid */
    .sessions-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .session-card {
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: var(--transition);
    }

    .session-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .session-card-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      padding: 16px 20px;
    }

    .session-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--white);
      margin: 0;
    }

    .session-card-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .meta-item svg {
      flex-shrink: 0;
      color: var(--primary);
    }

    .session-card-footer {
      padding: 0 20px 20px;
    }

    .detail-btn {
      width: 100%;
      padding: 10px;
      border-radius: var(--radius-sm);
      background: var(--off-white);
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 600;
      transition: var(--transition);
    }

    .detail-btn:hover {
      background: var(--primary);
      color: var(--white);
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

    /* ── Modal Overlay ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-container {
      position: relative;
      background: var(--white);
      border-radius: var(--radius-md);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 560px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    .modal-close-x {
      position: absolute;
      top: 12px;
      inset-inline-end: 14px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: var(--white);
      font-size: 1.5rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 1;
      line-height: 1;
    }

    .modal-close-x:hover {
      background: rgba(255, 255, 255, 0.35);
    }

    /* ── Modal Header ── */
    .modal-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      padding: 28px 24px 22px;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .modal-subtitle {
      font-size: 0.9rem;
      opacity: 0.85;
      margin: 0;
    }

    /* ── Modal Body ── */
    .modal-body {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .info-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--off-white);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      transition: var(--transition);
    }

    .info-card:hover {
      box-shadow: var(--shadow-sm);
    }

    .info-icon {
      font-size: 1.2rem;
      line-height: 1;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .info-value {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--heading-color);
    }

    .status-active {
      color: var(--primary);
    }

    .status-inactive {
      color: var(--error, #e53935);
    }

    /* ── Recent Completed Sessions ── */
    .recent-section {
      border-top: 1px solid var(--off-white);
      padding-top: 20px;
    }

    .recent-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--heading-color);
      margin: 0 0 14px;
    }

    .recent-loading {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .spinner-sm {
      width: 20px;
      height: 20px;
      border: 2px solid var(--light-green);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .no-sessions {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 16px 0;
    }

    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recent-card {
      background: var(--off-white);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      border-inline-start: 3px solid var(--primary);
    }

    .recent-date {
      display: flex;
      gap: 6px;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .recent-date-label,
    .recent-summary-label {
      font-weight: 600;
      color: var(--heading-color);
    }

    .recent-summary {
      display: flex;
      gap: 6px;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    /* ── Modal Footer ── */
    .modal-footer {
      padding: 0 24px 24px;
      display: flex;
      justify-content: flex-end;
    }

    .close-btn {
      padding: 10px 32px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--white);
      font-size: 0.88rem;
      font-weight: 600;
      transition: var(--transition);
    }

    .close-btn:hover {
      background: var(--primary-dark);
    }

    @media (max-width: 768px) {
      .days-grid {
        grid-template-columns: 1fr;
      }

      .sessions-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .modal-container {
        max-height: 90vh;
      }
    }
  `,
})
export class SchedulePage implements OnInit {
  private readonly parentService = inject(ParentService);
  readonly ts = inject(TranslationService);

  readonly loading = signal(true);
  readonly errorMsg = signal('');
  readonly sessions = signal<SessionSchedule[]>([]);

  // Modal state
  readonly showDetailModal = signal(false);
  readonly selectedSession = signal<SessionSchedule | null>(null);
  readonly relatedSessions = signal<TherapySession[]>([]);
  readonly loadingRelated = signal(false);

  private readonly sessionNameKeys: Record<string, string> = {
    s1: 'speech_language_session',
    s2: 'occupational_therapy_session',
    s3: 'social_interaction_session',
    s4: 'behavior_modification_session',
  };

  private readonly specMap: Record<string, string> = {
    SpeechTherapy: 'speech_therapy_spec',
    OccupationalTherapy: 'occupational_therapy',
    PhysicalTherapy: 'physical_therapy_spec',
    Psychology: 'psychology_spec',
    BehavioralTherapy: 'behavioral_therapy',
  };

  readonly groupedSessions = computed<DayGroup[]>(() => {
    const days = new Map<number, SessionSchedule[]>();
    const dayOrder = [0, 1, 2, 3, 4]; // Sun-Thu

    for (const session of this.sessions()) {
      const existing = days.get(session.dayOfWeek) ?? [];
      existing.push(session);
      days.set(session.dayOfWeek, existing);
    }

    return dayOrder
      .filter(d => days.has(d))
      .map(d => ({
        day: dayOfWeekName(d, this.ts),
        dayNum: d,
        sessions: days.get(d)!,
      }));
  });

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.parentService.getMySchedule().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set(this.ts.t('error_loading_schedule'));
        this.loading.set(false);
      },
    });
  }

  getSessionDisplayName(s: SessionSchedule): string {
    const key = (s as any).sessionType ?? (s as any).specialization;
    if (key && this.specMap[key]) return this.ts.t(this.specMap[key]);
    const nameKey = this.sessionNameKeys[s.therapistId];
    return nameKey ? this.ts.t(nameKey) : this.ts.t('therapy_session');
  }

  getSpecializationName(s: SessionSchedule): string {
    const key = (s as any).sessionType ?? (s as any).specialization;
    if (key && this.specMap[key]) return this.ts.t(this.specMap[key]);
    return this.ts.t('not_specified');
  }

  getDayName(day: number): string {
    return dayOfWeekName(day, this.ts);
  }

  getTime(t: string): string {
    return formatTime12h(t, this.ts);
  }

  openDetailModal(session: SessionSchedule): void {
    this.selectedSession.set(session);
    this.showDetailModal.set(true);
    this.relatedSessions.set([]);
    this.loadingRelated.set(true);

    this.parentService.getMyStudentSessions(session.studentId).subscribe({
      next: (sessions) => {
        const completed = sessions
          .filter(
            (rs) =>
              rs.therapistId === session.therapistId &&
              rs.status === 'Completed',
          )
          .sort((a, b) => {
            const dateA = a.scheduledDate ?? a.sessionDate ?? '';
            const dateB = b.scheduledDate ?? b.sessionDate ?? '';
            return dateB.localeCompare(dateA);
          })
          .slice(0, 3);
        this.relatedSessions.set(completed);
        this.loadingRelated.set(false);
      },
      error: () => {
        this.relatedSessions.set([]);
        this.loadingRelated.set(false);
      },
    });
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedSession.set(null);
    this.relatedSessions.set([]);
  }
}
