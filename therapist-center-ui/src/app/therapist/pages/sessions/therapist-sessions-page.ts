import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Student } from '../../../core/models/student.model';
import { TherapySession, CreateSessionDto } from '../../../core/models/session.model';
import { SessionType } from '../../../core/models/enums';
import {
  TherapistService,
  SESSION_TYPE_OPTIONS,
} from '../../services/therapist.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-therapist-sessions-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-wrapper">
      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <a class="tab-item active" routerLink="/therapist/sessions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {{ 'add_session' | translate }}
        </a>
        <a class="tab-item" routerLink="/therapist/broadcast">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
          {{ 'broadcast_center' | translate }}
        </a>
      </nav>

      <!-- Session Form Card -->
      <div class="form-card">
        <div class="card-header">
          <div class="card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h2>{{ 'log_session' | translate }}</h2>
        </div>

        <form class="session-form" (ngSubmit)="submitSession()">
          <div class="form-grid">
            <!-- Student Dropdown -->
            <div class="form-group">
              <label for="student">{{ 'student_name' | translate }}</label>
              @if (loadingStudents()) {
                <div class="input-skeleton"></div>
              } @else {
                <select
                  id="student"
                  [(ngModel)]="selectedStudentId"
                  name="studentId"
                  required
                  [class.invalid]="submitted && !selectedStudentId"
                >
                  <option value="">{{ 'select_student' | translate }}...</option>
                  @for (student of students(); track student.id) {
                    <option [value]="student.id">{{ student.fullName }}</option>
                  }
                </select>
                @if (submitted && !selectedStudentId) {
                  <span class="error-text">{{ 'please_select_student' | translate }}</span>
                }
              }
            </div>

            <!-- Session Type Dropdown -->
            <div class="form-group">
              <label for="sessionType">{{ 'session_type' | translate }}</label>
              <select
                id="sessionType"
                [(ngModel)]="selectedSessionType"
                name="sessionType"
                required
                [class.invalid]="submitted && !selectedSessionType"
              >
                <option value="">{{ 'select_session_type' | translate }}...</option>
                @for (type of sessionTypeOptions; track type.value) {
                  <option [value]="type.value">{{ ts.t(type.labelKey) }}</option>
                }
              </select>
              @if (submitted && !selectedSessionType) {
                <span class="error-text">{{ 'please_select_session_type' | translate }}</span>
              }
            </div>

            <!-- Session Date -->
            <div class="form-group">
              <label for="sessionDate">{{ 'session_date_label' | translate }}</label>
              <input
                type="date"
                id="sessionDate"
                [(ngModel)]="sessionDate"
                name="sessionDate"
                required
                [class.invalid]="submitted && !sessionDate"
              />
              @if (submitted && !sessionDate) {
                <span class="error-text">{{ 'please_select_date' | translate }}</span>
              }
            </div>
          </div>

          <!-- Summary -->
          <div class="form-group full-width">
            <label for="summary">{{ 'session_summary' | translate }}</label>
            <textarea
              id="summary"
              [(ngModel)]="summary"
              name="summary"
              rows="3"
              [placeholder]="ts.t('session_summary_placeholder')"
              required
              [class.invalid]="submitted && !summary"
            ></textarea>
            @if (submitted && !summary) {
              <span class="error-text">{{ 'please_write_summary' | translate }}</span>
            }
          </div>

          <!-- Notes -->
          <div class="form-group full-width">
            <label for="notes">{{ 'additional_notes_label' | translate }}</label>
            <textarea
              id="notes"
              [(ngModel)]="notes"
              name="notes"
              rows="2"
              [placeholder]="ts.t('notes_to_parent_placeholder')"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn-submit"
              [disabled]="submitting()"
            >
              @if (submitting()) {
                <span class="spinner"></span>
                {{ 'saving' | translate }}
              } @else {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                </svg>
                {{ 'save_and_send' | translate }}
              }
            </button>
          </div>
        </form>
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

      <!-- Recent Sessions -->
      <div class="recent-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ 'recent_sessions' | translate }}
        </h3>

        @if (loadingSessions()) {
          <div class="sessions-loading">
            @for (i of [1, 2]; track i) {
              <div class="skeleton-card"></div>
            }
          </div>
        } @else if (recentSessions().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #6B8068)" stroke-width="1.5" opacity="0.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>{{ 'no_sessions_recorded' | translate }}</p>
          </div>
        } @else {
          <div class="sessions-grid">
            @for (session of recentSessions(); track session.id) {
              <div class="session-card">
                <div class="session-card-header">
                  <span class="session-type-badge" [attr.data-type]="getSpecLabel(session)">
                    {{ getSpecLabel(session) }}
                  </span>
                  <span class="session-date">{{ formatDate(session.scheduledDate ?? session.sessionDate ?? '') }}</span>
                </div>
                <h4 class="session-student">{{ session.studentName }}</h4>
                <p class="session-summary">{{ session.notes }}</p>
                @if (session.goals) {
                  <p class="session-notes">{{ session.goals }}</p>
                }
              </div>
            }
          </div>
        }
      </div>
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

    /* Form Card */
    .form-card {
      background: white;
      border-radius: var(--radius-lg, 16px);
      padding: 2rem;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
      margin-bottom: 2rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--light-green, #E8EDE7);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      background: var(--light-green, #E8EDE7);
      border-radius: var(--radius-md, 12px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary, #6B8068);
      flex-shrink: 0;
    }

    .card-header h2 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-dark, #2D3E28);
    }

    .form-group select,
    .form-group input,
    .form-group textarea {
      padding: 0.75rem 1rem;
      border: 2px solid var(--light-green, #E8EDE7);
      border-radius: var(--radius-sm, 8px);
      font-size: 0.95rem;
      color: var(--text-dark, #1A2A17);
      background: var(--off-white, #F4F6F3);
      transition: var(--transition, all 0.3s ease);
      width: 100%;
    }

    .form-group select:focus,
    .form-group input:focus,
    .form-group textarea:focus {
      border-color: var(--primary, #6B8068);
      background: white;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
      outline: none;
    }

    .form-group select.invalid,
    .form-group input.invalid,
    .form-group textarea.invalid {
      border-color: var(--error, #C0392B);
    }

    .error-text {
      font-size: 0.8rem;
      color: var(--error, #C0392B);
      font-weight: 500;
    }

    .input-skeleton {
      height: 46px;
      background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-sm, 8px);
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-start;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 2rem;
      background: linear-gradient(135deg, var(--primary, #6B8068), var(--primary-dark, #2D3E28));
      color: white;
      border: none;
      border-radius: var(--radius-sm, 8px);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition, all 0.3s ease);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent);
    }

    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-submit:disabled {
      opacity: 0.7;
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

    /* Recent Sessions */
    .recent-section {
      margin-top: 1rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
      margin-bottom: 1.2rem;
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1rem;
    }

    .session-card {
      background: white;
      border-radius: var(--radius-md, 12px);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
      transition: var(--transition, all 0.3s ease);
      border-right: 4px solid var(--primary, #6B8068);
    }

    .session-card:hover {
      box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.12));
      transform: translateY(-2px);
    }

    .session-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }

    .session-type-badge {
      padding: 0.25rem 0.8rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--light-green, #E8EDE7);
      color: var(--primary-dark, #2D3E28);
    }

    .session-date {
      font-size: 0.8rem;
      color: var(--text-muted, #6B7B68);
    }

    .session-student {
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
      margin-bottom: 0.5rem;
    }

    .session-summary {
      font-size: 0.9rem;
      color: var(--text-dark, #1A2A17);
      line-height: 1.6;
      margin-bottom: 0.4rem;
    }

    .session-notes {
      font-size: 0.8rem;
      color: var(--text-muted, #6B7B68);
      font-style: italic;
    }

    .sessions-loading {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1rem;
    }

    .skeleton-card {
      height: 140px;
      background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-md, 12px);
      animation: shimmer 1.5s infinite;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted, #6B7B68);
    }

    .empty-state p {
      margin-top: 1rem;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .tab-nav {
        flex-direction: column;
      }

      .tab-item {
        padding: 0.75rem 1rem;
      }

      .form-card {
        padding: 1.5rem;
      }

      .sessions-grid,
      .sessions-loading {
        grid-template-columns: 1fr;
      }

      .btn-submit {
        width: 100%;
        justify-content: center;
      }
    }
  `,
})
export class TherapistSessionsPage implements OnInit {
  readonly sessionTypeOptions = SESSION_TYPE_OPTIONS;

  students = signal<Student[]>([]);
  loadingStudents = signal(true);
  recentSessions = signal<TherapySession[]>([]);
  loadingSessions = signal(true);
  submitting = signal(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  selectedStudentId = '';
  selectedSessionType = '';
  sessionDate = '';
  summary = '';
  notes = '';
  submitted = false;

  constructor(
    private readonly therapist: TherapistService,
    public readonly ts: TranslationService,
  ) {}

  ngOnInit(): void {
    this.sessionDate = new Date().toISOString().split('T')[0];
    this.loadStudents();
    this.loadSessions();
  }

  loadStudents(): void {
    this.loadingStudents.set(true);
    this.therapist.getMyStudents().subscribe({
      next: (students) => {
        this.students.set(students);
        this.loadingStudents.set(false);
      },
      error: () => {
        this.loadingStudents.set(false);
        this.showToast(this.ts.t('error_loading_students'), 'error');
      },
    });
  }

  loadSessions(): void {
    this.loadingSessions.set(true);
    this.therapist.getMySessions().subscribe({
      next: (sessions) => {
        this.recentSessions.set(sessions);
        this.loadingSessions.set(false);
      },
      error: () => {
        this.loadingSessions.set(false);
      },
    });
  }

  submitSession(): void {
    this.submitted = true;

    if (!this.selectedStudentId || !this.selectedSessionType || !this.sessionDate || !this.summary) {
      return;
    }

    this.submitting.set(true);

    const dto: CreateSessionDto = {
      studentId: this.selectedStudentId,
      therapistId: '',
      sessionType: SessionType.Individual,
      scheduledDate: this.sessionDate,
      startTime: '09:00',
      endTime: '10:00',
      notes: this.summary,
      goals: this.notes,
    };

    this.therapist.createSession(dto).subscribe({
      next: (session) => {
        const student = this.students().find((s) => s.id === this.selectedStudentId);
        session.studentName = student?.fullName ?? '';
        this.recentSessions.update((sessions) => [session, ...sessions]);
        this.resetForm();
        this.submitting.set(false);
        this.showToast(this.ts.t('session_saved_success'), 'success');
      },
      error: () => {
        this.submitting.set(false);
        this.showToast(this.ts.t('error_saving_session'), 'error');
      },
    });
  }

  resetForm(): void {
    this.selectedStudentId = '';
    this.selectedSessionType = '';
    this.sessionDate = new Date().toISOString().split('T')[0];
    this.summary = '';
    this.notes = '';
    this.submitted = false;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  getSpecLabel(session: TherapySession): string {
    const found = SESSION_TYPE_OPTIONS.find((t) => t.value === this.selectedSessionType);
    if (found) return this.ts.t(found.labelKey);
    return this.ts.t('therapy_session');
  }

  formatDate(date: string): string {
    try {
      const locale = this.ts.isArabic() ? 'ar-SA' : 'en-US';
      return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  }
}
