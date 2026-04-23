import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  AchievementLevel,
  AssessmentStatus,
  AssessmentType,
  MonthlyDomain,
  MonthlyGoal,
  MonthlyReportData,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDownloadButtonComponent } from '../shared/form-download-button';

interface GoalRow {
  goal: string;
  status: AchievementLevel;
  notes: string;
}

interface DomainBlock {
  name: string;
  goals: GoalRow[];
}

type Specialty = 'skills' | 'physio' | 'speech';

type L = { ar: Record<string, string>; en: Record<string, string> };

const T: L = {
  ar: {
    back: 'العودة إلى مركز التقييمات',
    title: 'التقرير الشهري الموحّد',
    desc: 'تقرير شهري موحد عن تقدم الطالب/ة في الأهداف المختلفة لمدة محددة.',
    saveDraft: 'حفظ كمسودة',
    submit: 'حفظ التقرير',
    saving: 'جارٍ الحفظ…',
    savedDraft: 'تم حفظ المسودة.',
    savedSubmitted: 'تم حفظ التقرير بنجاح.',
    saveError: 'تعذّر الحفظ. حاول مرة أخرى.',
    downloadLabel: 'تحميل النموذج الأصلي (Word)',
    pickStudent: 'الطالب/ة',
    pickStudentPh: 'اختر الطالب/ة…',
    specialty: 'التخصص',
    specialtyPh: 'اختر التخصص…',
    specSkills: 'تنمية مهارات',
    specPhysio: 'علاج طبيعي',
    specSpeech: 'تخاطب',
    periodFrom: 'للفترة من',
    periodTo: 'إلى',
    domainsTitle: 'مجالات التقرير',
    domainsHint: 'حتى ستة مجالات. أضف هدفًا واحدًا أو أكثر لكل مجال.',
    domainNamePh: 'اسم المجال — مثلاً: التواصل',
    domainIndex: 'المجال',
    addDomain: '+ إضافة مجال',
    removeDomain: 'حذف المجال',
    maxDomains: 'بلغت الحد الأقصى (6 مجالات).',
    addGoal: '+ إضافة هدف',
    noGoals: 'لا توجد أهداف — انقر "إضافة هدف".',
    colIndex: 'م',
    colGoal: 'الهدف',
    colMastered: 'أنجز',
    colPartial: 'انجز بمساعدة',
    colNotMastered: 'لم ينجز',
    colNotes: 'الملاحظات',
    removeGoal: 'حذف',
    summary: 'الملخص العام',
    summaryPh: 'ملخص عام عن أداء الطالب/ة خلال الفترة…',
    parentNotes: 'ملاحظات لولي الأمر',
    parentNotesPh: 'توصيات وملاحظات لولي الأمر…',
    validationMissing: 'يُرجى اختيار الطالب/ة والتخصص وتحديد الفترة.',
    noDomains: 'أضف مجالاً واحداً على الأقل قبل الحفظ.',
  },
  en: {
    back: 'Back to assessments hub',
    title: 'Monthly Unified Report',
    desc: "A unified monthly progress report across the student's goals for a defined period.",
    saveDraft: 'Save as draft',
    submit: 'Save report',
    saving: 'Saving…',
    savedDraft: 'Draft saved.',
    savedSubmitted: 'Report saved successfully.',
    saveError: 'Could not save. Please try again.',
    downloadLabel: 'Download original form (Word)',
    pickStudent: 'Student',
    pickStudentPh: 'Select student…',
    specialty: 'Specialty',
    specialtyPh: 'Select specialty…',
    specSkills: 'Skill development',
    specPhysio: 'Physical therapy',
    specSpeech: 'Speech',
    periodFrom: 'From',
    periodTo: 'To',
    domainsTitle: 'Report domains',
    domainsHint: 'Up to six domains. Add one or more goals per domain.',
    domainNamePh: 'Domain name — e.g. Communication',
    domainIndex: 'Domain',
    addDomain: '+ Add domain',
    removeDomain: 'Remove domain',
    maxDomains: 'Reached maximum (6 domains).',
    addGoal: '+ Add goal',
    noGoals: 'No goals — click "Add goal".',
    colIndex: '#',
    colGoal: 'Goal',
    colMastered: 'Mastered',
    colPartial: 'With help',
    colNotMastered: 'Not met',
    colNotes: 'Notes',
    removeGoal: 'Remove',
    summary: 'General summary',
    summaryPh: 'Overall summary of the student’s performance during the period…',
    parentNotes: 'Notes for parent',
    parentNotesPh: 'Recommendations and notes for the parent…',
    validationMissing: 'Please select student, specialty, and the period.',
    noDomains: 'Add at least one domain before saving.',
  },
};

const MAX_DOMAINS = 6;

@Component({
  selector: 'app-monthly-report-page',
  standalone: true,
  imports: [FormsModule, RouterLink, FormDownloadButtonComponent],
  template: `
    <div class="assess-wrapper">
      <a routerLink="/therapist/assessments" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ t('back') }}
      </a>

      <header class="assess-header">
        <div class="header-title">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <h1>{{ t('title') }} <span class="subtitle">({{ specialtyLabel() }})</span></h1>
            <p>{{ t('desc') }}</p>
          </div>
        </div>

        <div class="header-actions">
          <app-form-download-button fileName="monthly-unified-report.docx" [label]="t('downloadLabel')" format="docx" />
          <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
            {{ t('saveDraft') }}
          </button>
          <button type="button" class="btn btn-primary" [disabled]="saving() || !canSubmit()" (click)="save(false)">
            {{ saving() ? t('saving') : t('submit') }}
          </button>
        </div>
      </header>

      @if (savedNotice()) {
        <div class="notice success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ savedNotice() }}
        </div>
      }
      @if (errorNotice()) {
        <div class="notice error">{{ errorNotice() }}</div>
      }

      <!-- Header form -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="student">{{ t('pickStudent') }} *</label>
            @if (loadingStudents()) {
              <div class="input-skeleton"></div>
            } @else {
              <select id="student" [(ngModel)]="studentId" name="studentId" [class.invalid]="submitted() && !studentId()">
                <option [ngValue]="''">{{ t('pickStudentPh') }}</option>
                @for (s of students(); track s.id) {
                  <option [ngValue]="s.id">{{ s.fullName }}</option>
                }
              </select>
            }
          </div>
          <div class="form-group">
            <label for="specialty">{{ t('specialty') }} *</label>
            <select id="specialty" [(ngModel)]="specialty" name="specialty" [class.invalid]="submitted() && !specialty()">
              <option [ngValue]="''">{{ t('specialtyPh') }}</option>
              <option ngValue="skills">{{ t('specSkills') }}</option>
              <option ngValue="physio">{{ t('specPhysio') }}</option>
              <option ngValue="speech">{{ t('specSpeech') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="from">{{ t('periodFrom') }} *</label>
            <input id="from" type="date" [(ngModel)]="periodStart" name="periodStart" [class.invalid]="submitted() && !periodStart()" />
          </div>
          <div class="form-group">
            <label for="to">{{ t('periodTo') }} *</label>
            <input id="to" type="date" [(ngModel)]="periodEnd" name="periodEnd" [class.invalid]="submitted() && !periodEnd()" />
          </div>
        </div>
      </section>

      <!-- Domains -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('domainsTitle') }}</h2>
          <span class="section-hint">{{ t('domainsHint') }}</span>
        </header>

        <div class="domains-body">
          @for (dom of domains(); track $index; let di = $index) {
            <div class="domain-card">
              <div class="domain-head">
                <span class="domain-num">{{ t('domainIndex') }} {{ di + 1 }}</span>
                <input
                  class="domain-name"
                  type="text"
                  [(ngModel)]="dom.name"
                  [name]="'dom-name-' + di"
                  [placeholder]="t('domainNamePh')"
                />
                <button
                  type="button"
                  class="del-btn"
                  [attr.aria-label]="t('removeDomain')"
                  (click)="removeDomain(di)"
                >×</button>
              </div>

              <div class="table-wrap">
                <table class="data-table goals-table">
                  <thead>
                    <tr>
                      <th class="idx-col">{{ t('colIndex') }}</th>
                      <th>{{ t('colGoal') }}</th>
                      <th class="ach-col">{{ t('colMastered') }}</th>
                      <th class="ach-col">{{ t('colPartial') }}</th>
                      <th class="ach-col">{{ t('colNotMastered') }}</th>
                      <th>{{ t('colNotes') }}</th>
                      <th class="del-col" aria-label="remove"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (dom.goals.length === 0) {
                      <tr><td colspan="7" class="empty-cell">{{ t('noGoals') }}</td></tr>
                    }
                    @for (g of dom.goals; track $index; let gi = $index) {
                      <tr>
                        <td class="idx-col">{{ gi + 1 }}</td>
                        <td><input type="text" [(ngModel)]="g.goal" [name]="'g-' + di + '-' + gi" /></td>
                        <td class="ach-col center">
                          <label class="ach-radio mastered">
                            <input
                              type="radio"
                              [name]="'ach-' + di + '-' + gi"
                              [value]="Mastered"
                              [(ngModel)]="g.status"
                            />
                            <span class="dot"></span>
                          </label>
                        </td>
                        <td class="ach-col center">
                          <label class="ach-radio partial">
                            <input
                              type="radio"
                              [name]="'ach-' + di + '-' + gi"
                              [value]="Partial"
                              [(ngModel)]="g.status"
                            />
                            <span class="dot"></span>
                          </label>
                        </td>
                        <td class="ach-col center">
                          <label class="ach-radio not-mastered">
                            <input
                              type="radio"
                              [name]="'ach-' + di + '-' + gi"
                              [value]="NotMastered"
                              [(ngModel)]="g.status"
                            />
                            <span class="dot"></span>
                          </label>
                        </td>
                        <td><input type="text" [(ngModel)]="g.notes" [name]="'gn-' + di + '-' + gi" /></td>
                        <td class="del-col">
                          <button type="button" class="del-btn small" (click)="removeGoal(di, gi)" [attr.aria-label]="t('removeGoal')">×</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="domain-foot">
                <button type="button" class="btn btn-ghost btn-sm" (click)="addGoal(di)">{{ t('addGoal') }}</button>
              </div>
            </div>
          }
        </div>

        <div class="section-foot">
          @if (domains().length >= MAX_DOMAINS) {
            <span class="limit-note">{{ t('maxDomains') }}</span>
          } @else {
            <button type="button" class="btn btn-primary btn-sm" (click)="addDomain()">{{ t('addDomain') }}</button>
          }
        </div>
      </section>

      <!-- Footer notes -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="summary">{{ t('summary') }}</label>
            <textarea id="summary" rows="5" [(ngModel)]="summary" name="summary" [placeholder]="t('summaryPh')"></textarea>
          </div>
          <div class="form-group">
            <label for="parentNotes">{{ t('parentNotes') }}</label>
            <textarea id="parentNotes" rows="5" [(ngModel)]="parentNotes" name="parentNotes" [placeholder]="t('parentNotesPh')"></textarea>
          </div>
        </div>
      </section>

      <footer class="footer-actions">
        <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
          {{ t('saveDraft') }}
        </button>
        <button type="button" class="btn btn-primary" [disabled]="saving() || !canSubmit()" (click)="save(false)">
          {{ saving() ? t('saving') : t('submit') }}
        </button>
      </footer>
    </div>
  `,
  styles: `
    :host { display: block; --accent: #3F4F3C; }

    .assess-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: var(--text-muted); font-size: 0.9rem; font-weight: 600;
      text-decoration: none; align-self: flex-start;
    }
    .back-link:hover { color: var(--primary); }
    .back-link svg { width: 16px; height: 16px; }
    [dir="rtl"] .back-link svg { transform: scaleX(-1); }

    .assess-header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1.5rem; flex-wrap: wrap;
      background: var(--white); border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
    }
    .header-title { display: flex; gap: 1rem; align-items: center; }
    .title-icon {
      width: 56px; height: 56px; border-radius: 14px;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .title-icon svg { width: 28px; height: 28px; }
    .header-title h1 { margin: 0 0 0.2rem; font-size: 1.35rem; color: var(--heading-color); }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
    .header-title p { margin: 0; font-size: 0.85rem; color: var(--text-muted); max-width: 580px; }

    .header-actions { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }

    .btn {
      padding: 0.6rem 1.25rem; border-radius: var(--radius-sm);
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      border: 1.5px solid transparent; transition: var(--transition);
    }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-primary { background: var(--accent); color: var(--white); border-color: var(--accent); }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.92); }
    .btn-outline { background: transparent; color: var(--text); border-color: var(--border-light); }
    .btn-outline:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-ghost {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      color: var(--accent); border-color: transparent;
    }
    .btn-ghost:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 16%, transparent); }
    .btn-sm { padding: 0.45rem 0.9rem; font-size: 0.82rem; }

    .notice {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.85rem 1.1rem; border-radius: var(--radius-md);
      font-size: 0.9rem; font-weight: 600;
    }
    .notice.success { background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent); }
    .notice.error { background: color-mix(in srgb, #D95A5A 10%, transparent); color: #D95A5A; }
    .notice svg { width: 20px; height: 20px; }

    .card {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .card-body { padding: 1.25rem 1.5rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }

    .section-head {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      display: flex; justify-content: space-between; align-items: baseline;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-head h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }
    .section-hint { font-size: 0.78rem; color: var(--text-muted); }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.55rem 0.8rem;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-light);
      background: var(--white); color: var(--text);
      font-size: 0.9rem; font-family: inherit;
      transition: border-color 0.2s ease;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none; border-color: var(--accent);
    }
    .form-group .invalid, input.invalid, select.invalid { border-color: #D95A5A; }
    .form-group textarea { resize: vertical; min-height: 90px; }

    .input-skeleton {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .domains-body {
      display: flex; flex-direction: column; gap: 1rem;
      padding: 1.25rem 1.5rem;
    }
    .domain-card {
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: color-mix(in srgb, var(--accent) 2%, transparent);
    }
    .domain-head {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: color-mix(in srgb, var(--accent) 8%, var(--white));
      border-bottom: 1px solid var(--border-light);
    }
    .domain-num {
      font-size: 0.78rem; font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xl);
      background: var(--accent); color: var(--white);
      white-space: nowrap;
    }
    .domain-name {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 0.95rem; font-weight: 600; font-family: inherit;
      background: var(--white); color: var(--heading-color);
    }
    .domain-name:focus { outline: none; border-color: var(--accent); }

    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .data-table th {
      background: var(--white);
      padding: 0.55rem 0.5rem;
      text-align: start;
      font-weight: 700; color: var(--heading-color);
      border-bottom: 1.5px solid var(--border-light);
      font-size: 0.78rem;
    }
    .data-table td {
      padding: 0.4rem 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-light) 70%, transparent);
      vertical-align: middle;
      background: var(--white);
    }
    .data-table input[type="text"] {
      width: 100%;
      padding: 0.4rem 0.55rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.85rem;
      background: var(--white); color: var(--text);
      font-family: inherit;
    }

    .goals-table .idx-col { width: 36px; text-align: center; color: var(--text-muted); font-weight: 700; }
    .goals-table .ach-col { width: 86px; text-align: center; }
    .goals-table .del-col { width: 38px; text-align: center; }
    .goals-table .center { text-align: center; }

    .empty-cell { text-align: center; color: var(--text-muted); padding: 1rem !important; font-size: 0.85rem; }

    .ach-radio {
      display: inline-flex; cursor: pointer;
    }
    .ach-radio input { display: none; }
    .ach-radio .dot {
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 2px solid var(--border-light);
      background: var(--white);
      transition: var(--transition);
      position: relative;
    }
    .ach-radio:hover .dot { border-color: var(--accent); }
    .ach-radio input:checked + .dot::after {
      content: ''; position: absolute;
      inset: 3px; border-radius: 50%;
    }
    .ach-radio.mastered input:checked + .dot { border-color: #3F8E5A; }
    .ach-radio.mastered input:checked + .dot::after { background: #3F8E5A; }
    .ach-radio.partial input:checked + .dot { border-color: #D9A05A; }
    .ach-radio.partial input:checked + .dot::after { background: #D9A05A; }
    .ach-radio.not-mastered input:checked + .dot { border-color: #D95A5A; }
    .ach-radio.not-mastered input:checked + .dot::after { background: #D95A5A; }

    .del-btn {
      width: 28px; height: 28px; border: none;
      border-radius: 50%;
      background: color-mix(in srgb, #D95A5A 12%, transparent);
      color: #D95A5A; font-size: 1.1rem; font-weight: 700;
      cursor: pointer; line-height: 1;
    }
    .del-btn:hover { background: #D95A5A; color: var(--white); }
    .del-btn.small { width: 24px; height: 24px; font-size: 0.95rem; }

    .domain-foot {
      padding: 0.65rem 1rem;
      background: var(--white);
      border-top: 1px solid var(--border-light);
    }

    .section-foot {
      padding: 0.85rem 1.5rem;
      background: var(--off-white);
      border-top: 1px solid var(--border-light);
      display: flex; justify-content: flex-start; align-items: center;
    }
    .limit-note { font-size: 0.82rem; color: var(--text-muted); }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; flex-wrap: wrap; }
      .domain-head { flex-wrap: wrap; }
      .domain-name { width: 100%; }
    }
  `,
})
export class MonthlyReportPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Enum refs for template
  protected readonly Mastered = AchievementLevel.Mastered;
  protected readonly Partial = AchievementLevel.Partial;
  protected readonly NotMastered = AchievementLevel.NotMastered;
  protected readonly MAX_DOMAINS = MAX_DOMAINS;

  // State
  studentId = signal<string>('');
  specialty = signal<Specialty | ''>('');
  periodStart = signal<string>('');
  periodEnd = signal<string>('');
  domains = signal<DomainBlock[]>([]);
  summary = signal<string>('');
  parentNotes = signal<string>('');

  // UI
  students = signal<Student[]>([]);
  loadingStudents = signal(true);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);
  errorNotice = signal<string | null>(null);

  canSubmit = computed(
    () =>
      this.studentId() !== '' &&
      this.specialty() !== '' &&
      this.periodStart() !== '' &&
      this.periodEnd() !== '',
  );

  specialtyLabel = computed(() => {
    switch (this.specialty()) {
      case 'skills': return this.t('specSkills');
      case 'physio': return this.t('specPhysio');
      case 'speech': return this.t('specSpeech');
      default: return '…';
    }
  });

  t(key: keyof typeof T.ar): string {
    const lang = this.ts.currentLang();
    return T[lang]?.[key] ?? T.ar[key] ?? key;
  }

  ngOnInit(): void {
    // Seed with one empty domain
    if (this.domains().length === 0) this.addDomain();

    this.therapist.getMyStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        this.loadingStudents.set(false);
        const queryStudent = this.route.snapshot.queryParamMap.get('studentId');
        if (queryStudent && list.some((s) => s.id === queryStudent)) {
          this.studentId.set(queryStudent);
        }
      },
      error: () => this.loadingStudents.set(false),
    });
  }

  addDomain(): void {
    if (this.domains().length >= MAX_DOMAINS) return;
    this.domains.update((arr) => [
      ...arr,
      { name: '', goals: [{ goal: '', status: AchievementLevel.Mastered, notes: '' }] },
    ]);
  }

  removeDomain(i: number): void {
    this.domains.update((arr) => arr.filter((_, idx) => idx !== i));
  }

  addGoal(di: number): void {
    this.domains.update((arr) => {
      const next = [...arr];
      next[di] = {
        ...next[di],
        goals: [...next[di].goals, { goal: '', status: AchievementLevel.Mastered, notes: '' }],
      };
      return next;
    });
  }

  removeGoal(di: number, gi: number): void {
    this.domains.update((arr) => {
      const next = [...arr];
      next[di] = {
        ...next[di],
        goals: next[di].goals.filter((_, idx) => idx !== gi),
      };
      return next;
    });
  }

  private specialtyLabelFor(spec: Specialty | ''): string {
    switch (spec) {
      case 'skills': return this.t('specSkills');
      case 'physio': return this.t('specPhysio');
      case 'speech': return this.t('specSpeech');
      default: return '';
    }
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    this.errorNotice.set(null);

    if (!this.canSubmit()) {
      this.errorNotice.set(this.t('validationMissing'));
      return;
    }
    if (this.domains().length === 0) {
      this.errorNotice.set(this.t('noDomains'));
      return;
    }

    this.saving.set(true);

    // Build payload
    const domains: MonthlyDomain[] = this.domains().map((d) => ({
      name: d.name.trim(),
      goals: d.goals
        .filter((g) => g.goal.trim() !== '')
        .map<MonthlyGoal>((g) => ({
          domain: d.name.trim(),
          goal: g.goal.trim(),
          status: g.status,
          notes: g.notes.trim() || undefined,
        })),
    }));

    const flatGoals: MonthlyGoal[] = domains.flatMap((d) => d.goals);

    const startDate = this.periodStart();
    const d = startDate ? new Date(startDate) : new Date();
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();

    const payload: MonthlyReportData = {
      month,
      year,
      specialty: this.specialtyLabelFor(this.specialty()),
      periodStart: this.periodStart(),
      periodEnd: this.periodEnd(),
      domains,
      goals: flatGoals,
      summary: this.summary() || undefined,
      parentNotes: this.parentNotes() || undefined,
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Monthly,
        studentId: this.studentId(),
        studentName: student?.fullName,
        evaluatorId: this.auth.getUserId() ?? '',
        evaluatorName: this.auth.getUserName() ?? '',
        date: this.periodEnd() || new Date().toISOString().slice(0, 10),
        status: asDraft ? AssessmentStatus.Draft : AssessmentStatus.Submitted,
        payload,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.savedNotice.set(asDraft ? this.t('savedDraft') : this.t('savedSubmitted'));
          setTimeout(() => this.savedNotice.set(null), 4000);
          if (!asDraft) {
            setTimeout(() => this.router.navigate(['/therapist/assessments']), 1200);
          }
        },
        error: () => {
          this.saving.set(false);
          this.errorNotice.set(this.t('saveError'));
        },
      });
  }
}
