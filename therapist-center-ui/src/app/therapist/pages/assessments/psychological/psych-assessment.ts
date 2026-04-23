import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  ABCEntry,
  AssessmentStatus,
  AssessmentType,
  BehaviorFunction,
  PsychAssessmentData,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';

// --- Inline i18n map (do not touch ar.ts/en.ts) ---
const T = {
  ar: {
    back: 'العودة إلى التقييمات',
    title: 'التقرير النفسي وتحليل السلوك',
    subtitle: 'تحليل السلوك (ABC) وتحديد المعززات وأهداف التقليل',
    note_digital: 'لا يوجد نموذج مرجعي - استمارة رقمية فقط',
    save_draft: 'حفظ كمسودة',
    submit: 'اعتماد وإرسال',
    saving: 'جاري الحفظ...',
    pick_student: 'اختر الطالب',
    select_student_ph: 'اختر طالباً',
    date: 'تاريخ التقييم',
    saved_draft: 'تم حفظ المسودة بنجاح',
    saved_submitted: 'تم اعتماد وإرسال التقرير بنجاح',
    save_error: 'حدث خطأ أثناء الحفظ',
    notes: 'ملاحظات',
    optional: 'اختياري',
    // Section 1
    sec1: '1. تحليل السلوك (ABC)',
    sec1_hint: 'سجل كل حادثة سلوكية بتفاصيلها (السابق - السلوك - النتيجة)',
    add_behavior: '+ إضافة سلوك',
    remove: 'حذف',
    entry_label: 'الحادثة رقم',
    incident_date: 'التاريخ',
    antecedent: 'المثير / السابق',
    antecedent_ph: 'ماذا حدث قبل السلوك؟',
    behavior: 'السلوك',
    behavior_ph: 'ما هو السلوك الظاهر؟',
    consequence: 'النتيجة',
    consequence_ph: 'ماذا حدث بعد السلوك؟',
    frequency: 'التكرار (عدد المرات / يوم أو أسبوع)',
    intensity: 'الشدة',
    int_low: 'منخفضة',
    int_med: 'متوسطة',
    int_high: 'عالية',
    behavior_function: 'وظيفة السلوك',
    fn_attention: 'لفت الانتباه',
    fn_escape: 'الهروب من مهمة',
    fn_sensory: 'الإشباع الحسي',
    fn_tangible: 'الحصول على شيء',
    fn_unknown: 'غير محدد',
    no_entries: 'لم تتم إضافة أي سلوكيات بعد. اضغط على "إضافة سلوك" للبدء.',
    // Section 2
    sec2: '2. المعززات المفضلة',
    sec2_hint: 'أدخل المعززات التي يستجيب لها الطفل (ألعاب، أكل، مدح، أنشطة، أخرى)',
    reinforcer_input_ph: 'اكتب المعزز ثم اضغط Enter أو استخدم الفاصلة لإضافة عدة معززات',
    add: 'إضافة',
    no_reinforcers: 'لا توجد معززات مضافة.',
    // Section 3
    sec3: '3. أهداف تقليل السلوك',
    sec3_hint: 'أضف أهدافاً محددة وقابلة للقياس لتقليل السلوكيات غير المرغوبة',
    add_goal: '+ إضافة هدف',
    goal_ph: 'مثال: تقليل سلوك الصراخ أثناء الحصة بنسبة 50% خلال 3 أشهر',
    no_goals: 'لا توجد أهداف مضافة.',
    goal_label: 'الهدف رقم',
    // Section 4
    sec4: '4. ملاحظات عامة',
    general_notes: 'ملاحظات عامة',
    general_notes_ph: 'أضف أي ملاحظات عامة حول حالة الطفل النفسية والسلوكية...',
  },
  en: {
    back: 'Back to Assessments',
    title: 'Psychological & Behavior Analysis Report',
    subtitle: 'ABC behavior analysis, preferred reinforcers, and reduction goals',
    note_digital: 'No reference form — digital-only assessment',
    save_draft: 'Save as Draft',
    submit: 'Submit',
    saving: 'Saving...',
    pick_student: 'Pick Student',
    select_student_ph: 'Select a student',
    date: 'Assessment date',
    saved_draft: 'Draft saved successfully',
    saved_submitted: 'Report submitted successfully',
    save_error: 'Error while saving',
    notes: 'Notes',
    optional: 'Optional',
    // Section 1
    sec1: '1. Behavior Analysis (ABC)',
    sec1_hint: 'Record each behavioral incident with full detail (Antecedent - Behavior - Consequence)',
    add_behavior: '+ Add Behavior',
    remove: 'Remove',
    entry_label: 'Incident #',
    incident_date: 'Date',
    antecedent: 'Antecedent',
    antecedent_ph: 'What happened before the behavior?',
    behavior: 'Behavior',
    behavior_ph: 'What was the observed behavior?',
    consequence: 'Consequence',
    consequence_ph: 'What happened after the behavior?',
    frequency: 'Frequency (times per day or week)',
    intensity: 'Intensity',
    int_low: 'Low',
    int_med: 'Medium',
    int_high: 'High',
    behavior_function: 'Behavior function',
    fn_attention: 'Attention',
    fn_escape: 'Escape from task',
    fn_sensory: 'Sensory stimulation',
    fn_tangible: 'Access to tangible',
    fn_unknown: 'Unknown',
    no_entries: 'No behaviors have been added yet. Click "Add Behavior" to get started.',
    // Section 2
    sec2: '2. Preferred Reinforcers',
    sec2_hint: 'Add reinforcers the child responds to (toys, food, praise, activities, other)',
    reinforcer_input_ph: 'Type a reinforcer and press Enter, or use commas to add multiple',
    add: 'Add',
    no_reinforcers: 'No reinforcers added.',
    // Section 3
    sec3: '3. Behavior Reduction Goals',
    sec3_hint: 'Add specific, measurable goals to reduce undesired behaviors',
    add_goal: '+ Add Goal',
    goal_ph: 'Example: Reduce screaming during sessions by 50% within 3 months',
    no_goals: 'No goals added.',
    goal_label: 'Goal #',
    // Section 4
    sec4: '4. General Notes',
    general_notes: 'General notes',
    general_notes_ph: 'Add any general observations about the child\'s psychological and behavioral state...',
  },
} as const;

type PsychKey = keyof typeof T.ar;

const INTENSITY_OPTIONS: { value: 'Low' | 'Medium' | 'High'; key: PsychKey }[] = [
  { value: 'Low', key: 'int_low' },
  { value: 'Medium', key: 'int_med' },
  { value: 'High', key: 'int_high' },
];

const FUNCTION_OPTIONS: { value: BehaviorFunction; key: PsychKey }[] = [
  { value: BehaviorFunction.Attention, key: 'fn_attention' },
  { value: BehaviorFunction.Escape, key: 'fn_escape' },
  { value: BehaviorFunction.SensoryStimulation, key: 'fn_sensory' },
  { value: BehaviorFunction.AccessToTangible, key: 'fn_tangible' },
  { value: BehaviorFunction.Unknown, key: 'fn_unknown' },
];

@Component({
  selector: 'app-psych-assessment',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="assess-wrapper">
      <a routerLink="/therapist/assessments" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ t('back') }}
      </a>

      <header class="assess-header">
        <div class="header-title">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A4.5 4.5 0 0 1 14 6.5V8a2 2 0 1 1 0 4v.5a4.5 4.5 0 0 1-9 0V12a2 2 0 1 1 0-4V6.5A4.5 4.5 0 0 1 9.5 2z"/></svg>
          </div>
          <div>
            <h1>{{ t('title') }}</h1>
            <p>{{ t('subtitle') }}</p>
            <span class="digital-badge">{{ t('note_digital') }}</span>
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
            {{ t('save_draft') }}
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

      <!-- Header form: student + date -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="student">{{ t('pick_student') }} *</label>
            @if (loadingStudents()) {
              <div class="input-skeleton"></div>
            } @else {
              <select id="student" [(ngModel)]="studentId" name="studentId" [class.invalid]="submitted() && !studentId()">
                <option [ngValue]="''">{{ t('select_student_ph') }}…</option>
                @for (s of students(); track s.id) {
                  <option [ngValue]="s.id">{{ s.fullName }}</option>
                }
              </select>
            }
          </div>
          <div class="form-group">
            <label for="date">{{ t('date') }} *</label>
            <input id="date" type="date" [(ngModel)]="evalDate" name="evalDate" />
          </div>
        </div>
      </section>

      <!-- Section 1: ABC -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec1') }}</h2>
          <span class="section-hint">{{ t('sec1_hint') }}</span>
        </header>
        <div class="card-body">
          @if (abcEntries().length === 0) {
            <div class="empty-state">{{ t('no_entries') }}</div>
          }

          @for (entry of abcEntries(); track $index; let i = $index) {
            <div class="entry-card">
              <div class="entry-head">
                <span class="entry-label">{{ t('entry_label') }} {{ i + 1 }}</span>
                <button type="button" class="btn-remove" (click)="removeEntry(i)">
                  {{ t('remove') }}
                </button>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>{{ t('incident_date') }}</label>
                  <input type="date" [(ngModel)]="entry.date" [name]="'abc-date-' + i" />
                </div>
                <div class="form-group">
                  <label>{{ t('frequency') }}</label>
                  <input type="number" min="0" [(ngModel)]="entry.frequency" [name]="'abc-freq-' + i" />
                </div>
              </div>

              <div class="form-group">
                <label>{{ t('antecedent') }}</label>
                <textarea rows="2" [(ngModel)]="entry.antecedent" [name]="'abc-a-' + i" [placeholder]="t('antecedent_ph')"></textarea>
              </div>

              <div class="form-group">
                <label>{{ t('behavior') }}</label>
                <textarea rows="2" [(ngModel)]="entry.behavior" [name]="'abc-b-' + i" [placeholder]="t('behavior_ph')"></textarea>
              </div>

              <div class="form-group">
                <label>{{ t('consequence') }}</label>
                <textarea rows="2" [(ngModel)]="entry.consequence" [name]="'abc-c-' + i" [placeholder]="t('consequence_ph')"></textarea>
              </div>

              <div class="form-group">
                <label>{{ t('intensity') }}</label>
                <div class="pill-row">
                  @for (opt of intensityOptions; track opt.value) {
                    <label class="radio-pill" [class.active]="entry.intensity === opt.value">
                      <input type="radio" [name]="'abc-int-' + i" [value]="opt.value" [(ngModel)]="entry.intensity" />
                      {{ t(opt.key) }}
                    </label>
                  }
                </div>
              </div>

              <div class="form-group">
                <label>{{ t('behavior_function') }}</label>
                <div class="pill-row wrap">
                  @for (opt of functionOptions; track opt.value) {
                    <label class="radio-pill" [class.active]="entry.function === opt.value">
                      <input type="radio" [name]="'abc-fn-' + i" [value]="opt.value" [(ngModel)]="entry.function" />
                      {{ t(opt.key) }}
                    </label>
                  }
                </div>
              </div>
            </div>
          }

          <button type="button" class="btn btn-outline btn-add" (click)="addEntry()">
            {{ t('add_behavior') }}
          </button>
        </div>
      </section>

      <!-- Section 2: Reinforcers -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec2') }}</h2>
          <span class="section-hint">{{ t('sec2_hint') }}</span>
        </header>
        <div class="card-body">
          <div class="tag-input-row">
            <input
              type="text"
              [(ngModel)]="reinforcerDraft"
              name="reinforcerDraft"
              [placeholder]="t('reinforcer_input_ph')"
              (keydown.enter)="commitReinforcer($event)"
              (keydown.comma)="commitReinforcer($event)"
            />
            <button type="button" class="btn btn-outline" (click)="commitReinforcer()">
              {{ t('add') }}
            </button>
          </div>

          @if (reinforcers().length === 0) {
            <div class="empty-state small">{{ t('no_reinforcers') }}</div>
          } @else {
            <div class="chip-list">
              @for (r of reinforcers(); track $index; let i = $index) {
                <span class="chip">
                  {{ r }}
                  <button type="button" class="chip-x" (click)="removeReinforcer(i)" aria-label="remove">×</button>
                </span>
              }
            </div>
          }
        </div>
      </section>

      <!-- Section 3: Reduction goals -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec3') }}</h2>
          <span class="section-hint">{{ t('sec3_hint') }}</span>
        </header>
        <div class="card-body">
          @if (reductionGoals().length === 0) {
            <div class="empty-state small">{{ t('no_goals') }}</div>
          }

          @for (goal of reductionGoals(); track $index; let i = $index) {
            <div class="goal-row">
              <div class="form-group flex-1">
                <label>{{ t('goal_label') }} {{ i + 1 }}</label>
                <textarea
                  rows="2"
                  [ngModel]="goal"
                  (ngModelChange)="updateGoal(i, $event)"
                  [name]="'goal-' + i"
                  [placeholder]="t('goal_ph')"
                ></textarea>
              </div>
              <button type="button" class="btn-remove goal-remove" (click)="removeGoal(i)">
                {{ t('remove') }}
              </button>
            </div>
          }

          <button type="button" class="btn btn-outline btn-add" (click)="addGoal()">
            {{ t('add_goal') }}
          </button>
        </div>
      </section>

      <!-- Section 4: General notes -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec4') }}</h2>
        </header>
        <div class="card-body">
          <div class="form-group">
            <label for="general">{{ t('general_notes') }}</label>
            <textarea id="general" [(ngModel)]="generalNotes" name="general" rows="5" [placeholder]="t('general_notes_ph')"></textarea>
          </div>
        </div>
      </section>

      <footer class="footer-actions">
        <button type="button" class="btn btn-outline" [disabled]="saving()" (click)="save(true)">
          {{ t('save_draft') }}
        </button>
        <button type="button" class="btn btn-primary" [disabled]="saving() || !canSubmit()" (click)="save(false)">
          {{ saving() ? t('saving') : t('submit') }}
        </button>
      </footer>
    </div>
  `,
  styles: `
    :host { display: block; --accent: #6F47A8; }

    .assess-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: var(--text-muted); font-size: 0.9rem; font-weight: 600;
      text-decoration: none; align-self: flex-start;
    }
    .back-link:hover { color: var(--accent); }
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
    .header-title p { margin: 0 0 0.3rem; font-size: 0.85rem; color: var(--text-muted); max-width: 580px; }
    .digital-badge {
      display: inline-block; font-size: 0.72rem; font-weight: 600;
      padding: 0.15rem 0.55rem; border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent);
    }

    .header-actions { display: flex; gap: 0.6rem; }

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

    .btn-add {
      margin-top: 0.75rem;
      display: inline-flex; align-items: center; gap: 0.35rem;
      border-style: dashed;
    }

    .notice {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.85rem 1.1rem; border-radius: var(--radius-md);
      font-size: 0.9rem; font-weight: 600;
    }
    .notice.success { background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent); }
    .notice svg { width: 20px; height: 20px; }

    .card {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .card-body { padding: 1.25rem 1.5rem; }
    .grid-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem;
      margin-bottom: 0.75rem;
    }

    .section-head {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      display: flex; justify-content: space-between; align-items: baseline;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-head h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }
    .section-hint { font-size: 0.78rem; color: var(--text-muted); }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.75rem; }
    .form-group.flex-1 { flex: 1; }
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
    .form-group .invalid { border-color: #D95A5A; }
    .form-group textarea { resize: vertical; min-height: 70px; }

    .input-skeleton {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .entry-card {
      background: var(--off-white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }
    .entry-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.85rem;
    }
    .entry-label {
      font-weight: 700; font-size: 0.95rem; color: var(--accent);
    }

    .btn-remove {
      background: transparent; color: #B04848;
      border: 1px solid color-mix(in srgb, #B04848 40%, transparent);
      padding: 0.35rem 0.7rem; border-radius: var(--radius-sm);
      cursor: pointer; font-size: 0.78rem; font-weight: 600;
      transition: var(--transition);
    }
    .btn-remove:hover { background: color-mix(in srgb, #B04848 10%, transparent); }

    .pill-row { display: flex; gap: 0.4rem; flex-wrap: nowrap; }
    .pill-row.wrap { flex-wrap: wrap; }

    .radio-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 0.9rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-xl);
      cursor: pointer; font-size: 0.82rem; font-weight: 600;
      color: var(--text-muted);
      background: var(--white);
      transition: var(--transition);
    }
    .radio-pill input { display: none; }
    .radio-pill:hover { border-color: var(--accent); }
    .radio-pill.active { background: var(--accent); color: var(--white); border-color: var(--accent); }

    .empty-state {
      text-align: center; padding: 1.75rem 1rem;
      color: var(--text-muted); font-size: 0.9rem;
      background: var(--off-white);
      border: 1px dashed var(--border-light);
      border-radius: var(--radius-md);
    }
    .empty-state.small { padding: 1rem; font-size: 0.85rem; }

    .tag-input-row {
      display: flex; gap: 0.6rem; margin-bottom: 0.85rem;
    }
    .tag-input-row input {
      flex: 1;
      padding: 0.55rem 0.8rem;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-light);
      background: var(--white); color: var(--text);
      font-size: 0.9rem; font-family: inherit;
    }
    .tag-input-row input:focus { outline: none; border-color: var(--accent); }

    .chip-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-xl);
      font-size: 0.85rem; font-weight: 600;
    }
    .chip-x {
      background: transparent; border: none; color: inherit;
      cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;
    }
    .chip-x:hover { opacity: 0.7; }

    .goal-row {
      display: flex; gap: 0.75rem; align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .goal-remove { margin-top: 1.6rem; flex-shrink: 0; }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; }
      .header-actions .btn { flex: 1; }
      .goal-row { flex-direction: column; }
      .goal-remove { margin-top: 0; align-self: flex-end; }
    }
  `,
})
export class PsychAssessmentPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Form state
  studentId = signal<string>('');
  evalDate = signal<string>(new Date().toISOString().slice(0, 10));
  abcEntries = signal<ABCEntry[]>([]);
  reinforcers = signal<string[]>([]);
  reinforcerDraft = signal<string>('');
  reductionGoals = signal<string[]>([]);
  generalNotes = signal<string>('');

  // UI state
  loadingStudents = signal(true);
  students = signal<Student[]>([]);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);

  intensityOptions = INTENSITY_OPTIONS;
  functionOptions = FUNCTION_OPTIONS;

  canSubmit = computed(() => this.studentId() !== '' && this.evalDate() !== '');

  ngOnInit(): void {
    this.therapist.getMyStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        const queryStudent = this.route.snapshot.queryParamMap.get('studentId');
        if (queryStudent) this.studentId.set(queryStudent);
        this.loadingStudents.set(false);
      },
      error: () => this.loadingStudents.set(false),
    });
  }

  t(key: PsychKey): string {
    const lang = this.ts.currentLang();
    return (T[lang] as Record<string, string>)[key] ?? (T.ar as Record<string, string>)[key] ?? key;
  }

  // --- ABC entries ---
  addEntry(): void {
    this.abcEntries.update((arr) => [
      ...arr,
      {
        date: new Date().toISOString().slice(0, 10),
        antecedent: '',
        behavior: '',
        consequence: '',
        frequency: 0,
        intensity: 'Medium',
        function: BehaviorFunction.Unknown,
      },
    ]);
  }

  removeEntry(index: number): void {
    this.abcEntries.update((arr) => arr.filter((_, i) => i !== index));
  }

  // --- Reinforcers (tag/chip input) ---
  commitReinforcer(event?: Event): void {
    if (event) event.preventDefault();
    const raw = this.reinforcerDraft();
    if (!raw) return;

    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parts.length === 0) {
      this.reinforcerDraft.set('');
      return;
    }

    this.reinforcers.update((arr) => {
      const set = new Set(arr);
      for (const p of parts) set.add(p);
      return Array.from(set);
    });
    this.reinforcerDraft.set('');
  }

  removeReinforcer(index: number): void {
    this.reinforcers.update((arr) => arr.filter((_, i) => i !== index));
  }

  // --- Reduction goals ---
  addGoal(): void {
    this.reductionGoals.update((arr) => [...arr, '']);
  }

  updateGoal(index: number, value: string): void {
    this.reductionGoals.update((arr) => arr.map((g, i) => (i === index ? value : g)));
  }

  removeGoal(index: number): void {
    this.reductionGoals.update((arr) => arr.filter((_, i) => i !== index));
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    if (!this.canSubmit()) return;

    this.saving.set(true);

    const payload: PsychAssessmentData = {
      abcEntries: this.abcEntries(),
      reinforcers: this.reinforcers(),
      reductionGoals: this.reductionGoals().filter((g) => g.trim().length > 0),
      generalNotes: this.generalNotes(),
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Psychological,
        studentId: this.studentId(),
        studentName: student?.fullName,
        evaluatorId: this.auth.getUserId() ?? '',
        evaluatorName: this.auth.getUserName() ?? '',
        date: this.evalDate(),
        status: asDraft ? AssessmentStatus.Draft : AssessmentStatus.Submitted,
        payload,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.savedNotice.set(asDraft ? this.t('saved_draft') : this.t('saved_submitted'));
          setTimeout(() => this.savedNotice.set(null), 4000);
          if (!asDraft) {
            setTimeout(() => this.router.navigate(['/therapist/assessments']), 1200);
          }
        },
        error: () => {
          this.saving.set(false);
          this.savedNotice.set(this.t('save_error'));
        },
      });
  }
}
