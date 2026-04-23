import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  AchievementLevel,
  AssessmentStatus,
  AssessmentType,
  CoordinationLevel,
  DominantHand,
  MotorSkill,
  OccupationalAssessmentData,
  SensoryProcessingItem,
  SensoryResponseLevel,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDownloadButtonComponent } from '../shared/form-download-button';

// -------- Inline i18n (avoid touching ar.ts / en.ts to prevent concurrent edit conflicts) --------

type Dict = Record<string, string>;

const T: { ar: Dict; en: Dict } = {
  ar: {
    back_to_hub: 'العودة إلى التقييمات',
    assess_type_ot: 'العلاج الوظيفي',
    ot_full_desc: 'نموذج تقييم شامل للعلاج الوظيفي يغطي المهارات الإدراكية والحركية والمعالجة الحسية والتكامل الحسي.',
    save_draft: 'حفظ كمسودة',
    submit: 'إرسال التقييم',
    saving: 'جارٍ الحفظ...',
    saved_draft: 'تم حفظ المسودة',
    saved_submitted: 'تم إرسال التقييم بنجاح',
    save_error: 'تعذر الحفظ، حاول مرة أخرى',
    pick_student: 'اختر الطالب',
    select_student: 'اختر طالبًا',
    eval_date: 'تاريخ التقييم',
    notes: 'ملاحظات',
    optional: 'اختياري',
    download_form: 'تحميل الاستمارة الأصلية (PDF)',

    header_preamble: 'معلومات عامة',
    hand_dominant: 'اليد المسيطرة',
    hand_right: 'يمين',
    hand_left: 'يسار',
    hand_assist: 'استخدام اليد غير المسيطرة للمساعدة',
    visual_motor: 'التآزر الحركي/البصري',
    level_excellent: 'ممتاز',
    level_good: 'جيد',
    level_weak: 'ضعيف',

    level_mastered: 'أتقن',
    level_partial: 'أتقن جزئيًا',
    level_not_mastered: 'لم يتقن',

    sense_hypo: 'ضعف استجابة',
    sense_hyper: 'فرط استجابة',
    sense_normal: 'طبيعي',

    section_cognitive: 'المهارات الإدراكية',
    section_fine: 'المهارات الحركية الدقيقة',
    section_gross: 'المهارات الحركية الكبرى',
    section_sensory: 'المعالجة الحسية',
    section_integration: 'مهارات التكامل الحسي',
    section_behavior: 'الملاحظات السلوكية',

    col_skill: 'المهارة',
    col_sense: 'الحاسة',
    col_level: 'المستوى',
    col_notes: 'ملاحظات',

    behavior_placeholder: 'صف الملاحظات السلوكية للطفل خلال جلسة التقييم...',

    // Cognitive skills
    cog_commands: 'الاستجابة للأوامر',
    cog_focus: 'التركيز والانتباه',
    cog_spatial: 'الإدراك المكاني',
    cog_temporal: 'الإدراك الزماني',
    cog_social: 'الإدراك الاجتماعي',
    cog_short_memory: 'الذاكرة قصيرة المدى',
    cog_long_memory: 'الذاكرة طويلة المدى',
    cog_problem: 'حل المشكلات',
    cog_shapes: 'التعرف على الأحجام والأشكال',
    cog_colors: 'تمييز الألوان',
    cog_body: 'التعرف على أجزاء الجسم',
    cog_count: 'العد',
    cog_eye_contact: 'التواصل البصري',

    // Fine motor
    fine_pencil: 'مسك القلم مسكة ثلاثية صحيحة',
    fine_scissors: 'استخدام المقص بطريقة صحيحة',
    fine_draw: 'رسم خطوط وأشكال بسيطة',
    fine_color: 'التلوين داخل الحدود',
    fine_cut: 'القص',
    fine_beads: 'نظم الخرز',
    fine_blocks: 'تركيب المكعبات',
    fine_hammer: 'استخدام المطرقة/الضغط على كرة',
    fine_transfer: 'النقل والإفلات',
    fine_bilateral: 'استخدام كلتا اليدين بتناسق',

    // Gross motor
    gross_jump: 'القفز',
    gross_run: 'الجري',
    gross_stairs: 'صعود/نزول الدرج',
    gross_balance: 'التوازن على سطح متحرك',
    gross_ball: 'اللعب بالكرة/الترمبولين',

    // Senses
    sens_touch: 'اللمس',
    sens_taste: 'التذوق',
    sens_smell: 'الشم',
    sens_hearing: 'السمع',
    sens_vision: 'البصر',
    sens_interoception: 'الحس الداخلي',
    sens_proprioception: 'الحس العميق',
    sens_vestibular: 'الحس الدهليزي',

    // Sensory integration
    si_ball_sit: 'الجلوس بتوازن على الكرة',
    si_ball_jump: 'القفز بالكرة من مكان لآخر',
    si_texture: 'التمييز بين الملمس الناعم والخشن',
    si_swing: 'التأرجح بعدة اتجاهات',
    si_sensory_bin: 'إخراج مجسمات من سلة حسية',
  },
  en: {
    back_to_hub: 'Back to assessments',
    assess_type_ot: 'Occupational Therapy',
    ot_full_desc: 'Comprehensive occupational therapy evaluation covering cognitive, motor, sensory processing and sensory integration skills.',
    save_draft: 'Save as draft',
    submit: 'Submit',
    saving: 'Saving...',
    saved_draft: 'Draft saved',
    saved_submitted: 'Assessment submitted',
    save_error: 'Save failed, please try again',
    pick_student: 'Select student',
    select_student: 'Select a student',
    eval_date: 'Evaluation date',
    notes: 'Notes',
    optional: 'Optional',
    download_form: 'Download original form (PDF)',

    header_preamble: 'General information',
    hand_dominant: 'Dominant hand',
    hand_right: 'Right',
    hand_left: 'Left',
    hand_assist: 'Non-dominant hand assistance',
    visual_motor: 'Visual-motor coordination',
    level_excellent: 'Excellent',
    level_good: 'Good',
    level_weak: 'Weak',

    level_mastered: 'Mastered',
    level_partial: 'Partially mastered',
    level_not_mastered: 'Not mastered',

    sense_hypo: 'Hyposensitive',
    sense_hyper: 'Hypersensitive',
    sense_normal: 'Typical',

    section_cognitive: 'Cognitive skills',
    section_fine: 'Fine motor skills',
    section_gross: 'Gross motor skills',
    section_sensory: 'Sensory processing',
    section_integration: 'Sensory integration skills',
    section_behavior: 'Behavioral notes',

    col_skill: 'Skill',
    col_sense: 'Sense',
    col_level: 'Level',
    col_notes: 'Notes',

    behavior_placeholder: 'Describe behavioral observations during the evaluation session...',

    cog_commands: 'Response to commands',
    cog_focus: 'Focus and attention',
    cog_spatial: 'Spatial awareness',
    cog_temporal: 'Temporal awareness',
    cog_social: 'Social awareness',
    cog_short_memory: 'Short-term memory',
    cog_long_memory: 'Long-term memory',
    cog_problem: 'Problem solving',
    cog_shapes: 'Size and shape recognition',
    cog_colors: 'Color discrimination',
    cog_body: 'Body parts recognition',
    cog_count: 'Counting',
    cog_eye_contact: 'Eye contact',

    fine_pencil: 'Correct tripod pencil grasp',
    fine_scissors: 'Correct scissors use',
    fine_draw: 'Drawing simple lines and shapes',
    fine_color: 'Coloring inside the lines',
    fine_cut: 'Cutting',
    fine_beads: 'Bead stringing',
    fine_blocks: 'Block construction',
    fine_hammer: 'Using a hammer / squeezing a ball',
    fine_transfer: 'Transfer and release',
    fine_bilateral: 'Bilateral hand coordination',

    gross_jump: 'Jumping',
    gross_run: 'Running',
    gross_stairs: 'Ascending/descending stairs',
    gross_balance: 'Balance on a moving surface',
    gross_ball: 'Ball play / trampoline',

    sens_touch: 'Touch',
    sens_taste: 'Taste',
    sens_smell: 'Smell',
    sens_hearing: 'Hearing',
    sens_vision: 'Vision',
    sens_interoception: 'Interoception',
    sens_proprioception: 'Proprioception',
    sens_vestibular: 'Vestibular',

    si_ball_sit: 'Sitting balanced on a therapy ball',
    si_ball_jump: 'Jumping with a ball between places',
    si_texture: 'Distinguishing smooth vs rough textures',
    si_swing: 'Swinging in multiple directions',
    si_sensory_bin: 'Retrieving objects from a sensory bin',
  },
};

// -------- Skill lists (keys for i18n, mapped to Arabic/English labels at render time) --------

const COGNITIVE_KEYS = [
  'cog_commands', 'cog_focus', 'cog_spatial', 'cog_temporal', 'cog_social',
  'cog_short_memory', 'cog_long_memory', 'cog_problem', 'cog_shapes',
  'cog_colors', 'cog_body', 'cog_count', 'cog_eye_contact',
];

const FINE_KEYS = [
  'fine_pencil', 'fine_scissors', 'fine_draw', 'fine_color', 'fine_cut',
  'fine_beads', 'fine_blocks', 'fine_hammer', 'fine_transfer', 'fine_bilateral',
];

const GROSS_KEYS = [
  'gross_jump', 'gross_run', 'gross_stairs', 'gross_balance', 'gross_ball',
];

const SENSORY_KEYS = [
  'sens_touch', 'sens_taste', 'sens_smell', 'sens_hearing', 'sens_vision',
  'sens_interoception', 'sens_proprioception', 'sens_vestibular',
];

const INTEGRATION_KEYS = [
  'si_ball_sit', 'si_ball_jump', 'si_texture', 'si_swing', 'si_sensory_bin',
];

interface SkillRow {
  key: string;
  level: AchievementLevel;
  notes: string;
}

interface SensoryRow {
  key: string;
  level: SensoryResponseLevel;
  notes: string;
}

const makeSkillRows = (keys: string[]): SkillRow[] =>
  keys.map((key) => ({ key, level: AchievementLevel.NotMastered, notes: '' }));

const makeSensoryRows = (keys: string[]): SensoryRow[] =>
  keys.map((key) => ({ key, level: SensoryResponseLevel.Normal, notes: '' }));

@Component({
  selector: 'app-ot-assessment',
  standalone: true,
  imports: [FormsModule, RouterLink, FormDownloadButtonComponent],
  template: `
    <div class="assess-wrapper">
      <a routerLink="/therapist/assessments" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ t('back_to_hub') }}
      </a>

      <header class="assess-header">
        <div class="header-title">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="13" rx="2"/></svg>
          </div>
          <div>
            <h1>{{ t('assess_type_ot') }}</h1>
            <p>{{ t('ot_full_desc') }}</p>
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

      <div class="download-row">
        <app-form-download-button
          fileName="occupational-therapy-evaluation.pdf"
          [label]="t('download_form')"
          format="pdf"
        />
      </div>

      <!-- Header form: student + date -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('header_preamble') }}</h2>
        </header>
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="student">{{ t('pick_student') }} *</label>
            @if (loadingStudents()) {
              <div class="input-skeleton"></div>
            } @else {
              <select id="student" [(ngModel)]="studentId" name="studentId" [class.invalid]="submitted() && !studentId()">
                <option [ngValue]="''">{{ t('select_student') }}…</option>
                @for (s of students(); track s.id) {
                  <option [ngValue]="s.id">{{ s.fullName }}</option>
                }
              </select>
            }
          </div>
          <div class="form-group">
            <label for="date">{{ t('eval_date') }} *</label>
            <input id="date" type="date" [(ngModel)]="evalDate" name="evalDate" />
          </div>

          <!-- Dominant hand radio -->
          <div class="form-group">
            <label>{{ t('hand_dominant') }}</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="dominantHand() === 'Right'">
                <input type="radio" name="hand" value="Right" [ngModel]="dominantHand()" (ngModelChange)="dominantHand.set($event)" />
                {{ t('hand_right') }}
              </label>
              <label class="radio-pill" [class.active]="dominantHand() === 'Left'">
                <input type="radio" name="hand" value="Left" [ngModel]="dominantHand()" (ngModelChange)="dominantHand.set($event)" />
                {{ t('hand_left') }}
              </label>
            </div>
          </div>

          <!-- Non-dominant assist -->
          <div class="form-group">
            <label>{{ t('hand_assist') }}</label>
            <div class="pill-row">
              @for (opt of coordLevels; track opt.value) {
                <label class="radio-pill" [class.active]="nonDominantAssist() === opt.value">
                  <input type="radio" name="assist" [value]="opt.value" [ngModel]="nonDominantAssist()" (ngModelChange)="nonDominantAssist.set($event)" />
                  {{ t(opt.labelKey) }}
                </label>
              }
            </div>
          </div>

          <!-- Visual-motor coordination -->
          <div class="form-group form-group-wide">
            <label>{{ t('visual_motor') }}</label>
            <div class="pill-row">
              @for (opt of coordLevels; track opt.value) {
                <label class="radio-pill" [class.active]="visualMotor() === opt.value">
                  <input type="radio" name="vmc" [value]="opt.value" [ngModel]="visualMotor()" (ngModelChange)="visualMotor.set($event)" />
                  {{ t(opt.labelKey) }}
                </label>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Section 1: Cognitive skills -->
      <section class="card">
        <header class="section-head">
          <h2>1. {{ t('section_cognitive') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table skills-table">
            <thead>
              <tr>
                <th class="skill-col">{{ t('col_skill') }}</th>
                <th class="level-col">{{ t('col_level') }}</th>
                <th>{{ t('col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of cognitive(); track row.key; let i = $index) {
                <tr>
                  <td class="skill-cell">{{ t(row.key) }}</td>
                  <td>
                    <div class="level-pills">
                      @for (lvl of achievementLevels; track lvl.value) {
                        <label class="mini-pill" [class.active]="row.level === lvl.value" [attr.data-variant]="lvl.variant">
                          <input type="radio" [name]="'cog-' + i" [value]="lvl.value" [(ngModel)]="row.level" />
                          {{ t(lvl.labelKey) }}
                        </label>
                      }
                    </div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'cog-notes-' + i" [placeholder]="t('optional')" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 2: Fine motor skills -->
      <section class="card">
        <header class="section-head">
          <h2>2. {{ t('section_fine') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table skills-table">
            <thead>
              <tr>
                <th class="skill-col">{{ t('col_skill') }}</th>
                <th class="level-col">{{ t('col_level') }}</th>
                <th>{{ t('col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of fineMotor(); track row.key; let i = $index) {
                <tr>
                  <td class="skill-cell">{{ t(row.key) }}</td>
                  <td>
                    <div class="level-pills">
                      @for (lvl of achievementLevels; track lvl.value) {
                        <label class="mini-pill" [class.active]="row.level === lvl.value" [attr.data-variant]="lvl.variant">
                          <input type="radio" [name]="'fine-' + i" [value]="lvl.value" [(ngModel)]="row.level" />
                          {{ t(lvl.labelKey) }}
                        </label>
                      }
                    </div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'fine-notes-' + i" [placeholder]="t('optional')" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 3: Gross motor skills -->
      <section class="card">
        <header class="section-head">
          <h2>3. {{ t('section_gross') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table skills-table">
            <thead>
              <tr>
                <th class="skill-col">{{ t('col_skill') }}</th>
                <th class="level-col">{{ t('col_level') }}</th>
                <th>{{ t('col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of grossMotor(); track row.key; let i = $index) {
                <tr>
                  <td class="skill-cell">{{ t(row.key) }}</td>
                  <td>
                    <div class="level-pills">
                      @for (lvl of achievementLevels; track lvl.value) {
                        <label class="mini-pill" [class.active]="row.level === lvl.value" [attr.data-variant]="lvl.variant">
                          <input type="radio" [name]="'gross-' + i" [value]="lvl.value" [(ngModel)]="row.level" />
                          {{ t(lvl.labelKey) }}
                        </label>
                      }
                    </div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'gross-notes-' + i" [placeholder]="t('optional')" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 4: Sensory processing (Hypo / Hyper / Normal) -->
      <section class="card">
        <header class="section-head">
          <h2>4. {{ t('section_sensory') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table skills-table">
            <thead>
              <tr>
                <th class="skill-col">{{ t('col_sense') }}</th>
                <th class="level-col">{{ t('col_level') }}</th>
                <th>{{ t('col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of sensory(); track row.key; let i = $index) {
                <tr>
                  <td class="skill-cell">{{ t(row.key) }}</td>
                  <td>
                    <div class="level-pills">
                      @for (lvl of sensoryLevels; track lvl.value) {
                        <label class="mini-pill" [class.active]="row.level === lvl.value" [attr.data-variant]="lvl.variant">
                          <input type="radio" [name]="'sens-' + i" [value]="lvl.value" [(ngModel)]="row.level" />
                          {{ t(lvl.labelKey) }}
                        </label>
                      }
                    </div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'sens-notes-' + i" [placeholder]="t('optional')" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 5: Sensory integration -->
      <section class="card">
        <header class="section-head">
          <h2>5. {{ t('section_integration') }}</h2>
        </header>
        <div class="table-wrap">
          <table class="data-table skills-table">
            <thead>
              <tr>
                <th class="skill-col">{{ t('col_skill') }}</th>
                <th class="level-col">{{ t('col_level') }}</th>
                <th>{{ t('col_notes') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of integration(); track row.key; let i = $index) {
                <tr>
                  <td class="skill-cell">{{ t(row.key) }}</td>
                  <td>
                    <div class="level-pills">
                      @for (lvl of achievementLevels; track lvl.value) {
                        <label class="mini-pill" [class.active]="row.level === lvl.value" [attr.data-variant]="lvl.variant">
                          <input type="radio" [name]="'si-' + i" [value]="lvl.value" [(ngModel)]="row.level" />
                          {{ t(lvl.labelKey) }}
                        </label>
                      }
                    </div>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.notes" [name]="'si-notes-' + i" [placeholder]="t('optional')" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 6: Behavioral notes -->
      <section class="card">
        <header class="section-head">
          <h2>6. {{ t('section_behavior') }}</h2>
        </header>
        <div class="card-body">
          <div class="form-group">
            <label for="behavior">{{ t('section_behavior') }}</label>
            <textarea
              id="behavior"
              [(ngModel)]="behavioralNotes"
              name="behavior"
              rows="5"
              [placeholder]="t('behavior_placeholder')"
            ></textarea>
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
    :host { display: block; --accent: #B07A30; }

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
    .header-title p { margin: 0; font-size: 0.85rem; color: var(--text-muted); max-width: 580px; }

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

    .download-row {
      display: flex; justify-content: flex-end;
    }

    .card {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .card-body { padding: 1.25rem 1.5rem; }
    .grid-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem;
      padding: 1.25rem 1.5rem;
    }
    .form-group-wide { grid-column: 1 / -1; }

    .section-head {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      display: flex; justify-content: space-between; align-items: baseline;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-head h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }

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
    .form-group .invalid { border-color: #D95A5A; }
    .form-group textarea { resize: vertical; min-height: 100px; }

    .input-skeleton {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .pill-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .radio-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 0.95rem;
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

    .table-wrap { overflow-x: auto; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 0.88rem;
    }
    .data-table th {
      background: var(--off-white);
      padding: 0.7rem 0.6rem;
      text-align: start;
      font-weight: 700; color: var(--heading-color);
      border-bottom: 1.5px solid var(--border-light);
      font-size: 0.82rem;
    }
    .data-table td {
      padding: 0.55rem 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-light) 70%, transparent);
      vertical-align: middle;
    }
    .data-table input[type="text"] {
      width: 100%;
      padding: 0.4rem 0.55rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.85rem;
      background: var(--white); color: var(--text);
    }

    .skills-table .skill-col { width: 28%; }
    .skills-table .level-col { width: 38%; }
    .skill-cell { font-weight: 600; color: var(--heading-color); }

    .level-pills { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .mini-pill {
      display: inline-flex; align-items: center;
      padding: 0.3rem 0.7rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-xl);
      cursor: pointer; font-size: 0.78rem; font-weight: 600;
      color: var(--text-muted); background: var(--white);
      transition: var(--transition);
      white-space: nowrap;
    }
    .mini-pill input { display: none; }
    .mini-pill:hover { border-color: var(--accent); }
    .mini-pill.active[data-variant="good"] {
      background: var(--accent); color: var(--white); border-color: var(--accent);
    }
    .mini-pill.active[data-variant="warn"] {
      background: #C18938; color: var(--white); border-color: #C18938;
    }
    .mini-pill.active[data-variant="bad"] {
      background: #B0483C; color: var(--white); border-color: #B0483C;
    }
    .mini-pill.active[data-variant="neutral"] {
      background: var(--accent); color: var(--white); border-color: var(--accent);
    }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; }
      .header-actions .btn { flex: 1; }
      .skills-table .skill-col,
      .skills-table .level-col { width: auto; }
    }
  `,
})
export class OTAssessmentPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Inline i18n helper
  t = (key: string): string => {
    const lang = this.ts.isArabic() ? 'ar' : 'en';
    return T[lang][key] ?? T.ar[key] ?? key;
  };

  // Header
  studentId = signal<string>('');
  evalDate = signal<string>(new Date().toISOString().slice(0, 10));

  // Radios
  dominantHand = signal<DominantHand | null>(null);
  nonDominantAssist = signal<CoordinationLevel | null>(null);
  visualMotor = signal<CoordinationLevel | null>(null);

  // Tables
  cognitive = signal<SkillRow[]>(makeSkillRows(COGNITIVE_KEYS));
  fineMotor = signal<SkillRow[]>(makeSkillRows(FINE_KEYS));
  grossMotor = signal<SkillRow[]>(makeSkillRows(GROSS_KEYS));
  sensory = signal<SensoryRow[]>(makeSensoryRows(SENSORY_KEYS));
  integration = signal<SkillRow[]>(makeSkillRows(INTEGRATION_KEYS));

  behavioralNotes = signal<string>('');

  // UI state
  loadingStudents = signal(true);
  students = signal<Student[]>([]);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);

  // Options
  coordLevels: { value: CoordinationLevel; labelKey: string }[] = [
    { value: 'Excellent', labelKey: 'level_excellent' },
    { value: 'Good', labelKey: 'level_good' },
    { value: 'Weak', labelKey: 'level_weak' },
  ];

  achievementLevels: { value: AchievementLevel; labelKey: string; variant: 'good' | 'warn' | 'bad' }[] = [
    { value: AchievementLevel.Mastered, labelKey: 'level_mastered', variant: 'good' },
    { value: AchievementLevel.Partial, labelKey: 'level_partial', variant: 'warn' },
    { value: AchievementLevel.NotMastered, labelKey: 'level_not_mastered', variant: 'bad' },
  ];

  sensoryLevels: { value: SensoryResponseLevel; labelKey: string; variant: 'good' | 'warn' | 'bad' | 'neutral' }[] = [
    { value: SensoryResponseLevel.Hypo, labelKey: 'sense_hypo', variant: 'warn' },
    { value: SensoryResponseLevel.Hyper, labelKey: 'sense_hyper', variant: 'bad' },
    { value: SensoryResponseLevel.Normal, labelKey: 'sense_normal', variant: 'good' },
  ];

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

  private rowsToSkills(rows: SkillRow[]): MotorSkill[] {
    return rows.map((r) => ({ skill: r.key, level: r.level, notes: r.notes }));
  }

  private rowsToSensory(rows: SensoryRow[]): SensoryProcessingItem[] {
    return rows.map((r) => ({ sense: r.key, level: r.level, notes: r.notes }));
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    if (!this.canSubmit()) return;

    this.saving.set(true);

    const payload: OccupationalAssessmentData = {
      dominantHand: this.dominantHand() ?? undefined,
      nonDominantAssist: this.nonDominantAssist() ?? undefined,
      visualMotorCoordination: this.visualMotor() ?? undefined,
      cognitive: this.rowsToSkills(this.cognitive()),
      fineMotor: this.rowsToSkills(this.fineMotor()),
      grossMotor: this.rowsToSkills(this.grossMotor()),
      sensoryProcessing: this.rowsToSensory(this.sensory()),
      sensoryIntegration: this.rowsToSkills(this.integration()),
      behavioralNotes: this.behavioralNotes(),
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Occupational,
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
