import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  AssessmentStatus,
  AssessmentType,
  EconomicStatus,
  LivesWith,
  ParentEducation,
  SocialAssessmentData,
  VaccinationStatus,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';

// --- Inline i18n map (do not touch ar.ts/en.ts) ---
const T = {
  ar: {
    back: 'العودة إلى التقييمات',
    title: 'تقرير الأخصائي الاجتماعي',
    subtitle: 'التشخيص، المعلومات الطبية الأساسية، والخلفية الأسرية',
    note_digital: 'لا يوجد نموذج مرجعي - استمارة رقمية فقط',
    save_draft: 'حفظ كمسودة',
    submit: 'اعتماد وإرسال',
    saving: 'جاري الحفظ...',
    pick_student: 'اختر الطالب',
    select_student_ph: 'اختر طالباً',
    date: 'تاريخ التقرير',
    saved_draft: 'تم حفظ المسودة بنجاح',
    saved_submitted: 'تم اعتماد وإرسال التقرير بنجاح',
    save_error: 'حدث خطأ أثناء الحفظ',
    yes: 'نعم',
    no: 'لا',
    optional: 'اختياري',
    details: 'التفاصيل',

    // Section 1
    sec1: '1. التشخيص والتاريخ المرضي',
    diagnosis: 'التشخيص الحالي',
    diagnosis_ph: 'اكتب التشخيص الطبي الحالي...',
    diagnosis_source: 'جهة التشخيص',
    diagnosis_source_ph: 'مثال: مستشفى / طبيب',
    diagnosis_date: 'تاريخ التشخيص',
    iq_score: 'درجة الذكاء (IQ)',
    iq_test: 'اختبار الذكاء المستخدم',
    iq_test_ph: 'مثال: ستانفورد بينيه، وكسلر...',
    diagnosis_notes: 'ملاحظات إضافية',
    diagnosis_notes_ph: 'ملاحظات إضافية حول التشخيص...',

    // Section 2
    sec2: '2. المعلومات الطبية الأساسية',
    vaccinations: 'التطعيمات',
    vacc_complete: 'مكتملة',
    vacc_incomplete: 'غير مكتملة',
    vacc_unknown: 'غير معروفة',
    vacc_details_ph: 'تفاصيل حول التطعيمات (إن وجدت)...',
    hearing: 'مشاكل السمع',
    hearing_details_ph: 'اشرح مشكلة السمع...',
    vision: 'مشاكل البصر',
    vision_details_ph: 'اشرح مشكلة البصر...',
    seizures: 'النوبات الصرعية',
    last_seizure: 'تاريخ آخر نوبة',
    seizure_meds: 'الأدوية المستخدمة',
    seizure_meds_ph: 'أسماء الأدوية والجرعات...',
    allergies: 'الحساسية الغذائية',
    allergies_ph: 'اذكر أنواع الحساسية...',
    surgeries: 'جراحات سابقة',
    surgeries_ph: 'اذكر الجراحات السابقة (إن وجدت)...',

    // Section 3
    sec3: '3. الخلفية الأسرية',
    sibling_order: 'ترتيب الطفل بين إخوته',
    sibling_count: 'عدد الإخوة',
    parent_education: 'المستوى التعليمي للوالدين',
    edu_primary: 'ابتدائي',
    edu_middle: 'متوسط',
    edu_secondary: 'ثانوي',
    edu_university: 'جامعي',
    edu_higher: 'أعلى',
    lives_with: 'يعيش الطفل مع',
    lives_both: 'الوالدين معاً',
    lives_mother: 'الأم',
    lives_father: 'الأب',
    lives_other: 'آخر',
    lives_other_ph: 'حدد...',
    parent_relation: 'علاقة الوالدين بالطفل',
    parent_relation_ph: 'اشرح العلاقة الأسرية...',
    economic: 'الوضع الاقتصادي',
    econ_affluent: 'ميسور',
    econ_middle: 'متوسط',
    econ_limited: 'محدود',

    // Section 4
    sec4: '4. التوصيات',
    recs: 'التوصيات',
    recs_ph: 'أضف توصياتك لدعم الطفل والأسرة...',
  },
  en: {
    back: 'Back to Assessments',
    title: 'Social Worker Report',
    subtitle: 'Diagnosis, medical baseline, and family background',
    note_digital: 'No reference form — digital-only assessment',
    save_draft: 'Save as Draft',
    submit: 'Submit',
    saving: 'Saving...',
    pick_student: 'Pick Student',
    select_student_ph: 'Select a student',
    date: 'Report date',
    saved_draft: 'Draft saved successfully',
    saved_submitted: 'Report submitted successfully',
    save_error: 'Error while saving',
    yes: 'Yes',
    no: 'No',
    optional: 'Optional',
    details: 'Details',

    // Section 1
    sec1: '1. Diagnosis & Medical History',
    diagnosis: 'Current diagnosis',
    diagnosis_ph: 'Write the current medical diagnosis...',
    diagnosis_source: 'Diagnosis source',
    diagnosis_source_ph: 'e.g. Hospital / Physician',
    diagnosis_date: 'Diagnosis date',
    iq_score: 'IQ score',
    iq_test: 'IQ test used',
    iq_test_ph: 'e.g. Stanford-Binet, Wechsler...',
    diagnosis_notes: 'Additional notes',
    diagnosis_notes_ph: 'Any additional notes about the diagnosis...',

    // Section 2
    sec2: '2. Medical Baseline',
    vaccinations: 'Vaccinations',
    vacc_complete: 'Complete',
    vacc_incomplete: 'Incomplete',
    vacc_unknown: 'Unknown',
    vacc_details_ph: 'Details about vaccinations (if any)...',
    hearing: 'Hearing issues',
    hearing_details_ph: 'Describe the hearing issue...',
    vision: 'Vision issues',
    vision_details_ph: 'Describe the vision issue...',
    seizures: 'Seizures / Epilepsy',
    last_seizure: 'Last seizure date',
    seizure_meds: 'Medications used',
    seizure_meds_ph: 'Medication names and dosages...',
    allergies: 'Food allergies',
    allergies_ph: 'List allergies...',
    surgeries: 'Previous surgeries',
    surgeries_ph: 'List previous surgeries (if any)...',

    // Section 3
    sec3: '3. Family Background',
    sibling_order: 'Child\'s birth order',
    sibling_count: 'Number of siblings',
    parent_education: 'Parents\' education level',
    edu_primary: 'Primary',
    edu_middle: 'Middle',
    edu_secondary: 'Secondary',
    edu_university: 'University',
    edu_higher: 'Higher',
    lives_with: 'Child lives with',
    lives_both: 'Both parents',
    lives_mother: 'Mother',
    lives_father: 'Father',
    lives_other: 'Other',
    lives_other_ph: 'Specify...',
    parent_relation: 'Parents\' relationship with child',
    parent_relation_ph: 'Describe the family relationship...',
    economic: 'Economic status',
    econ_affluent: 'Affluent',
    econ_middle: 'Middle',
    econ_limited: 'Limited',

    // Section 4
    sec4: '4. Recommendations',
    recs: 'Recommendations',
    recs_ph: 'Add recommendations to support the child and family...',
  },
} as const;

type SocialKey = keyof typeof T.ar;

const VACC_OPTIONS: { value: VaccinationStatus; key: SocialKey }[] = [
  { value: 'Complete', key: 'vacc_complete' },
  { value: 'Incomplete', key: 'vacc_incomplete' },
  { value: 'Unknown', key: 'vacc_unknown' },
];

const EDU_OPTIONS: { value: ParentEducation; key: SocialKey }[] = [
  { value: 'Primary', key: 'edu_primary' },
  { value: 'Middle', key: 'edu_middle' },
  { value: 'Secondary', key: 'edu_secondary' },
  { value: 'University', key: 'edu_university' },
  { value: 'Higher', key: 'edu_higher' },
];

const LIVES_OPTIONS: { value: LivesWith; key: SocialKey }[] = [
  { value: 'BothParents', key: 'lives_both' },
  { value: 'Mother', key: 'lives_mother' },
  { value: 'Father', key: 'lives_father' },
  { value: 'Other', key: 'lives_other' },
];

const ECON_OPTIONS: { value: EconomicStatus; key: SocialKey }[] = [
  { value: 'Affluent', key: 'econ_affluent' },
  { value: 'Middle', key: 'econ_middle' },
  { value: 'Limited', key: 'econ_limited' },
];

@Component({
  selector: 'app-social-assessment',
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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

      <!-- Header: student + date -->
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

      <!-- Section 1: Diagnosis -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec1') }}</h2>
        </header>
        <div class="card-body">
          <div class="form-group">
            <label>{{ t('diagnosis') }}</label>
            <textarea rows="3" [(ngModel)]="diagnosisHistory" name="diagnosisHistory" [placeholder]="t('diagnosis_ph')"></textarea>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>{{ t('diagnosis_source') }}</label>
              <input type="text" [(ngModel)]="diagnosisSource" name="diagnosisSource" [placeholder]="t('diagnosis_source_ph')" />
            </div>
            <div class="form-group">
              <label>{{ t('diagnosis_date') }}</label>
              <input type="date" [(ngModel)]="diagnosisDate" name="diagnosisDate" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>{{ t('iq_score') }} <span class="muted">({{ t('optional') }})</span></label>
              <input type="number" min="0" max="200" [(ngModel)]="iqScore" name="iqScore" />
            </div>
            <div class="form-group">
              <label>{{ t('iq_test') }} <span class="muted">({{ t('optional') }})</span></label>
              <input type="text" [(ngModel)]="iqTest" name="iqTest" [placeholder]="t('iq_test_ph')" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('diagnosis_notes') }}</label>
            <textarea rows="2" [(ngModel)]="diagnosisNotes" name="diagnosisNotes" [placeholder]="t('diagnosis_notes_ph')"></textarea>
          </div>
        </div>
      </section>

      <!-- Section 2: Medical -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec2') }}</h2>
        </header>
        <div class="card-body">
          <!-- Vaccinations -->
          <div class="form-group">
            <label>{{ t('vaccinations') }}</label>
            <div class="pill-row wrap">
              @for (opt of vaccOptions; track opt.value) {
                <label class="radio-pill" [class.active]="vaccinationStatus() === opt.value">
                  <input type="radio" name="vaccStatus" [value]="opt.value" [ngModel]="vaccinationStatus()" (ngModelChange)="vaccinationStatus.set($event)" />
                  {{ t(opt.key) }}
                </label>
              }
            </div>
            <textarea rows="2" [(ngModel)]="vaccinationDetails" name="vaccDetails" [placeholder]="t('vacc_details_ph')"></textarea>
          </div>

          <!-- Hearing -->
          <div class="form-group">
            <label>{{ t('hearing') }}</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="hasHearingIssues() === true">
                <input type="radio" name="hearing" [value]="true" [ngModel]="hasHearingIssues()" (ngModelChange)="hasHearingIssues.set($event)" />
                {{ t('yes') }}
              </label>
              <label class="radio-pill" [class.active]="hasHearingIssues() === false">
                <input type="radio" name="hearing" [value]="false" [ngModel]="hasHearingIssues()" (ngModelChange)="hasHearingIssues.set($event)" />
                {{ t('no') }}
              </label>
            </div>
            @if (hasHearingIssues() === true) {
              <textarea rows="2" [(ngModel)]="hearingDetails" name="hearingDetails" [placeholder]="t('hearing_details_ph')"></textarea>
            }
          </div>

          <!-- Vision -->
          <div class="form-group">
            <label>{{ t('vision') }}</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="hasVisionIssues() === true">
                <input type="radio" name="vision" [value]="true" [ngModel]="hasVisionIssues()" (ngModelChange)="hasVisionIssues.set($event)" />
                {{ t('yes') }}
              </label>
              <label class="radio-pill" [class.active]="hasVisionIssues() === false">
                <input type="radio" name="vision" [value]="false" [ngModel]="hasVisionIssues()" (ngModelChange)="hasVisionIssues.set($event)" />
                {{ t('no') }}
              </label>
            </div>
            @if (hasVisionIssues() === true) {
              <textarea rows="2" [(ngModel)]="visionDetails" name="visionDetails" [placeholder]="t('vision_details_ph')"></textarea>
            }
          </div>

          <!-- Seizures -->
          <div class="form-group">
            <label>{{ t('seizures') }}</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="hasSeizures() === true">
                <input type="radio" name="seizures" [value]="true" [ngModel]="hasSeizures()" (ngModelChange)="hasSeizures.set($event)" />
                {{ t('yes') }}
              </label>
              <label class="radio-pill" [class.active]="hasSeizures() === false">
                <input type="radio" name="seizures" [value]="false" [ngModel]="hasSeizures()" (ngModelChange)="hasSeizures.set($event)" />
                {{ t('no') }}
              </label>
            </div>
            @if (hasSeizures() === true) {
              <div class="grid-2">
                <div class="form-group">
                  <label>{{ t('last_seizure') }}</label>
                  <input type="date" [(ngModel)]="lastSeizureDate" name="lastSeizure" />
                </div>
                <div class="form-group">
                  <label>{{ t('seizure_meds') }}</label>
                  <input type="text" [(ngModel)]="seizureMedication" name="seizureMeds" [placeholder]="t('seizure_meds_ph')" />
                </div>
              </div>
            }
          </div>

          <!-- Food allergies -->
          <div class="form-group">
            <label>{{ t('allergies') }}</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="hasFoodAllergies() === true">
                <input type="radio" name="allergies" [value]="true" [ngModel]="hasFoodAllergies()" (ngModelChange)="hasFoodAllergies.set($event)" />
                {{ t('yes') }}
              </label>
              <label class="radio-pill" [class.active]="hasFoodAllergies() === false">
                <input type="radio" name="allergies" [value]="false" [ngModel]="hasFoodAllergies()" (ngModelChange)="hasFoodAllergies.set($event)" />
                {{ t('no') }}
              </label>
            </div>
            @if (hasFoodAllergies() === true) {
              <textarea rows="2" [(ngModel)]="foodAllergiesDetails" name="allergiesDetails" [placeholder]="t('allergies_ph')"></textarea>
            }
          </div>

          <!-- Surgeries -->
          <div class="form-group">
            <label>{{ t('surgeries') }}</label>
            <textarea rows="2" [(ngModel)]="previousSurgeries" name="surgeries" [placeholder]="t('surgeries_ph')"></textarea>
          </div>
        </div>
      </section>

      <!-- Section 3: Family -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec3') }}</h2>
        </header>
        <div class="card-body">
          <div class="grid-2">
            <div class="form-group">
              <label>{{ t('sibling_order') }}</label>
              <input type="number" min="0" [(ngModel)]="siblingOrder" name="siblingOrder" />
            </div>
            <div class="form-group">
              <label>{{ t('sibling_count') }}</label>
              <input type="number" min="0" [(ngModel)]="siblingCount" name="siblingCount" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('parent_education') }}</label>
            <div class="pill-row wrap">
              @for (opt of eduOptions; track opt.value) {
                <label class="radio-pill" [class.active]="parentEducation() === opt.value">
                  <input type="radio" name="parentEdu" [value]="opt.value" [ngModel]="parentEducation()" (ngModelChange)="parentEducation.set($event)" />
                  {{ t(opt.key) }}
                </label>
              }
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('lives_with') }}</label>
            <div class="pill-row wrap">
              @for (opt of livesOptions; track opt.value) {
                <label class="radio-pill" [class.active]="livesWith() === opt.value">
                  <input type="radio" name="livesWith" [value]="opt.value" [ngModel]="livesWith()" (ngModelChange)="livesWith.set($event)" />
                  {{ t(opt.key) }}
                </label>
              }
            </div>
            @if (livesWith() === 'Other') {
              <input type="text" [(ngModel)]="livesWithOther" name="livesWithOther" [placeholder]="t('lives_other_ph')" />
            }
          </div>

          <div class="form-group">
            <label>{{ t('parent_relation') }}</label>
            <textarea rows="3" [(ngModel)]="parentRelation" name="parentRelation" [placeholder]="t('parent_relation_ph')"></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('economic') }}</label>
            <div class="pill-row wrap">
              @for (opt of econOptions; track opt.value) {
                <label class="radio-pill" [class.active]="economicStatus() === opt.value">
                  <input type="radio" name="economic" [value]="opt.value" [ngModel]="economicStatus()" (ngModelChange)="economicStatus.set($event)" />
                  {{ t(opt.key) }}
                </label>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Recommendations -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sec4') }}</h2>
        </header>
        <div class="card-body">
          <div class="form-group">
            <label for="recs">{{ t('recs') }}</label>
            <textarea id="recs" [(ngModel)]="recommendations" name="recs" rows="5" [placeholder]="t('recs_ph')"></textarea>
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
    :host { display: block; --accent: #A8385A; }

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

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.85rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text); }
    .form-group label .muted { color: var(--text-muted); font-weight: 500; font-size: 0.78rem; }
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

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; }
      .header-actions .btn { flex: 1; }
    }
  `,
})
export class SocialAssessmentPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Header
  studentId = signal<string>('');
  evalDate = signal<string>(new Date().toISOString().slice(0, 10));

  // Section 1
  diagnosisHistory = signal<string>('');
  diagnosisSource = signal<string>('');
  diagnosisDate = signal<string>('');
  iqScore = signal<number | null>(null);
  iqTest = signal<string>('');
  diagnosisNotes = signal<string>('');

  // Section 2
  vaccinationStatus = signal<VaccinationStatus | null>(null);
  vaccinationDetails = signal<string>('');
  hasHearingIssues = signal<boolean | null>(null);
  hearingDetails = signal<string>('');
  hasVisionIssues = signal<boolean | null>(null);
  visionDetails = signal<string>('');
  hasSeizures = signal<boolean | null>(null);
  lastSeizureDate = signal<string>('');
  seizureMedication = signal<string>('');
  hasFoodAllergies = signal<boolean | null>(null);
  foodAllergiesDetails = signal<string>('');
  previousSurgeries = signal<string>('');

  // Section 3
  siblingOrder = signal<number | null>(null);
  siblingCount = signal<number | null>(null);
  parentEducation = signal<ParentEducation | null>(null);
  livesWith = signal<LivesWith | null>(null);
  livesWithOther = signal<string>('');
  parentRelation = signal<string>('');
  economicStatus = signal<EconomicStatus | null>(null);

  // Section 4
  recommendations = signal<string>('');

  // UI state
  loadingStudents = signal(true);
  students = signal<Student[]>([]);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);

  vaccOptions = VACC_OPTIONS;
  eduOptions = EDU_OPTIONS;
  livesOptions = LIVES_OPTIONS;
  econOptions = ECON_OPTIONS;

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

  t(key: SocialKey): string {
    const lang = this.ts.currentLang();
    return (T[lang] as Record<string, string>)[key] ?? (T.ar as Record<string, string>)[key] ?? key;
  }

  private boolToYesNo(v: boolean | null, details?: string): string {
    if (v === null) return '';
    return v ? (details?.trim() ? `نعم - ${details}` : 'نعم') : 'لا';
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    if (!this.canSubmit()) return;

    this.saving.set(true);

    // Build backwards-compatible summary strings for legacy fields
    const vaccSummary = this.vaccinationStatus()
      ? `${this.vaccinationStatus()}${this.vaccinationDetails() ? ' - ' + this.vaccinationDetails() : ''}`
      : this.vaccinationDetails();

    let familyBackground = '';
    const parts: string[] = [];
    if (this.siblingOrder() !== null) parts.push(`ترتيب: ${this.siblingOrder()}`);
    if (this.siblingCount() !== null) parts.push(`عدد الإخوة: ${this.siblingCount()}`);
    if (this.parentEducation()) parts.push(`تعليم الوالدين: ${this.parentEducation()}`);
    if (this.livesWith()) {
      const lw = this.livesWith() === 'Other' ? `Other (${this.livesWithOther()})` : this.livesWith();
      parts.push(`يعيش مع: ${lw}`);
    }
    if (this.economicStatus()) parts.push(`الوضع الاقتصادي: ${this.economicStatus()}`);
    if (this.parentRelation()) parts.push(this.parentRelation());
    familyBackground = parts.join(' | ');

    const payload: SocialAssessmentData = {
      // Legacy/required summary fields
      diagnosisHistory: this.diagnosisHistory(),
      diagnosisSource: this.diagnosisSource(),
      iqScore: this.iqScore() ?? undefined,
      vaccinations: vaccSummary,
      hearingIssues: this.boolToYesNo(this.hasHearingIssues(), this.hearingDetails()),
      visionIssues: this.boolToYesNo(this.hasVisionIssues(), this.visionDetails()),
      seizures: this.hasSeizures()
        ? `نعم - آخر نوبة: ${this.lastSeizureDate() || '—'}، أدوية: ${this.seizureMedication() || '—'}`
        : this.hasSeizures() === false
          ? 'لا'
          : '',
      familyBackground,
      recommendations: this.recommendations(),

      // New optional fields
      diagnosisDate: this.diagnosisDate() || undefined,
      iqTest: this.iqTest() || undefined,
      diagnosisNotes: this.diagnosisNotes() || undefined,

      vaccinationStatus: this.vaccinationStatus() ?? undefined,
      vaccinationDetails: this.vaccinationDetails() || undefined,
      hasHearingIssues: this.hasHearingIssues() ?? undefined,
      hasVisionIssues: this.hasVisionIssues() ?? undefined,
      hasSeizures: this.hasSeizures() ?? undefined,
      lastSeizureDate: this.lastSeizureDate() || undefined,
      seizureMedication: this.seizureMedication() || undefined,
      hasFoodAllergies: this.hasFoodAllergies() ?? undefined,
      foodAllergiesDetails: this.foodAllergiesDetails() || undefined,
      previousSurgeries: this.previousSurgeries() || undefined,

      siblingOrder: this.siblingOrder() ?? undefined,
      siblingCount: this.siblingCount() ?? undefined,
      parentEducation: this.parentEducation() ?? undefined,
      livesWith: this.livesWith() ?? undefined,
      livesWithOther: this.livesWithOther() || undefined,
      parentRelation: this.parentRelation() || undefined,
      economicStatus: this.economicStatus() ?? undefined,
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Social,
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
