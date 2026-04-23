import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  AssessmentStatus,
  AssessmentType,
  PhysioAssessmentData,
  PhysioBalanceDynamic,
  PhysioBalanceStatic,
  PhysioCoordEquilRow,
  PhysioCoordNonEquilRow,
  PhysioFimRow,
  PhysioFooter,
  PhysioGait,
  PhysioHandFunction,
  PhysioHeader,
  PhysioLimbLengthRow,
  PhysioMeasureRow,
  PhysioMmtRow,
  PhysioObservation,
  PhysioPalpation,
  PhysioProblemRow,
  PhysioReflexRow,
  PhysioRiRow,
  PhysioRomBilateralRow,
  PhysioRomSpineRow,
  PhysioSensoryRow,
  PhysioSpecialTestRow,
  PhysioSubjective,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDownloadButtonComponent } from '../shared/form-download-button';

/**
 * Inline i18n dictionary for labels unique to this form. Kept local to avoid
 * churn in the shared ar.ts/en.ts files (edited concurrently by other agents).
 */
const T: { ar: Record<string, string>; en: Record<string, string> } = {
  en: {
    back: 'Back to assessments',
    title: 'Physiotherapy Evaluation',
    subtitle:
      'Full physiotherapy evaluation: subjective history, objective examination, ROM, MMT, reflexes, sensory, FIM, gait, balance, coordination, special tests, problem list, goals and treatment plan.',
    saveDraft: 'Save draft',
    saving: 'Saving…',
    submit: 'Submit',
    student: 'Student',
    pickStudent: 'Select student…',
    date: 'Date',
    savedDraft: 'Draft saved.',
    savedSubmitted: 'Assessment submitted.',
    saveError: 'Could not save the assessment. Please try again.',
  },
  ar: {
    back: 'العودة للتقييمات',
    title: 'تقييم العلاج الطبيعي',
    subtitle:
      'تقييم شامل للعلاج الطبيعي: التاريخ المرضي، الفحص الموضوعي، مدى الحركة، اختبار العضلات، الانعكاسات، الإحساس، FIM، المشي، التوازن، التنسيق، الاختبارات الخاصة، قائمة المشكلات، الأهداف وخطة العلاج.',
    saveDraft: 'حفظ كمسودة',
    saving: 'جارٍ الحفظ…',
    submit: 'إرسال',
    student: 'الطالب',
    pickStudent: 'اختر الطالب…',
    date: 'التاريخ',
    savedDraft: 'تم حفظ المسودة.',
    savedSubmitted: 'تم إرسال التقييم.',
    saveError: 'تعذّر حفظ التقييم. حاول مرة أخرى.',
  },
};

const FIM_ITEMS: { index: number; item: string }[] = [
  { index: 1, item: 'Food' },
  { index: 2, item: 'Care of appearance' },
  { index: 3, item: 'Hygiene' },
  { index: 4, item: 'Dressing upper' },
  { index: 5, item: 'Dressing lower' },
  { index: 6, item: 'Bladder' },
  { index: 7, item: 'Bowel' },
  { index: 8, item: 'Bed / chair / wheelchair' },
  { index: 9, item: 'Toilet' },
  { index: 10, item: 'Bath / shower' },
  { index: 11, item: 'Wheelchair' },
  { index: 12, item: 'Stairs' },
  { index: 13, item: 'Auditive comprehension' },
  { index: 14, item: 'Verbal expression' },
  { index: 15, item: 'Social interaction' },
  { index: 16, item: 'Problem resolution' },
  { index: 17, item: 'Memory' },
];

@Component({
  selector: 'app-physio-assessment',
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v4M12 11l-4 5M12 11l4 5M9 21l3-5 3 5"/></svg>
          </div>
          <div>
            <h1>{{ t('title') }}</h1>
            <p>{{ t('subtitle') }}</p>
          </div>
        </div>

        <div class="header-actions">
          <app-form-download-button fileName="physiotherapy-evaluation.pdf" label="Download original form (PDF)" format="pdf" />
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

      <!-- Student picker -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="student">{{ t('student') }} *</label>
            @if (loadingStudents()) {
              <div class="input-skeleton"></div>
            } @else {
              <select id="student" [(ngModel)]="studentId" name="studentId" [class.invalid]="submitted() && !studentId()">
                <option [ngValue]="''">{{ t('pickStudent') }}</option>
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

      <!-- Header / demographics -->
      <details class="card" open>
        <summary class="section-head"><h2>Patient Information</h2></summary>
        <div class="card-body grid-3">
          <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="header().name" (ngModelChange)="mutateHeader('name', $event)" name="h_name" /></div>
          <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="header().date" (ngModelChange)="mutateHeader('date', $event)" name="h_date" /></div>
          <div class="form-group"><label>Age</label><input type="text" [(ngModel)]="header().age" (ngModelChange)="mutateHeader('age', $event)" name="h_age" /></div>
          <div class="form-group">
            <label>Gender</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="header().gender === 'M'">
                <input type="radio" name="h_gender" value="M" [(ngModel)]="header().gender" (ngModelChange)="mutateHeader('gender', $event)" /> M
              </label>
              <label class="radio-pill" [class.active]="header().gender === 'F'">
                <input type="radio" name="h_gender" value="F" [(ngModel)]="header().gender" (ngModelChange)="mutateHeader('gender', $event)" /> F
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>IP / OP</label>
            <div class="pill-row">
              <label class="radio-pill" [class.active]="header().ipOp === 'IP'">
                <input type="radio" name="h_ipop" value="IP" [(ngModel)]="header().ipOp" (ngModelChange)="mutateHeader('ipOp', $event)" /> IP
              </label>
              <label class="radio-pill" [class.active]="header().ipOp === 'OP'">
                <input type="radio" name="h_ipop" value="OP" [(ngModel)]="header().ipOp" (ngModelChange)="mutateHeader('ipOp', $event)" /> OP
              </label>
            </div>
          </div>
          <div class="form-group"><label>Occupation</label><input type="text" [(ngModel)]="header().occupation" (ngModelChange)="mutateHeader('occupation', $event)" name="h_occ" /></div>
          <div class="form-group"><label>Referred by</label><input type="text" [(ngModel)]="header().referredBy" (ngModelChange)="mutateHeader('referredBy', $event)" name="h_ref" /></div>
          <div class="form-group"><label>Phone</label><input type="text" [(ngModel)]="header().phone" (ngModelChange)="mutateHeader('phone', $event)" name="h_phone" /></div>
          <div class="form-group"><label>Registration Number</label><input type="text" [(ngModel)]="header().registrationNumber" (ngModelChange)="mutateHeader('registrationNumber', $event)" name="h_reg" /></div>
          <div class="form-group"><label>Civil Status</label><input type="text" [(ngModel)]="header().civilStatus" (ngModelChange)="mutateHeader('civilStatus', $event)" name="h_civil" /></div>
          <div class="form-group span-2"><label>Address</label><input type="text" [(ngModel)]="header().address" (ngModelChange)="mutateHeader('address', $event)" name="h_addr" /></div>
          <div class="form-group span-3"><label>Diagnosis</label><input type="text" [(ngModel)]="header().diagnosis" (ngModelChange)="mutateHeader('diagnosis', $event)" name="h_dx" /></div>
        </div>
      </details>

      <!-- I. Subjective -->
      <details class="card" open>
        <summary class="section-head"><h2>I. Subjective</h2></summary>
        <div class="card-body grid-2">
          <div class="form-group span-2"><label>Chief Complaints</label><textarea rows="2" [(ngModel)]="subjective().chiefComplaints" (ngModelChange)="mutateSubjective('chiefComplaints', $event)" name="s_cc"></textarea></div>
          <div class="form-group"><label>Past Medical History</label><textarea rows="2" [(ngModel)]="subjective().pastMedicalHistory" (ngModelChange)="mutateSubjective('pastMedicalHistory', $event)" name="s_pmh"></textarea></div>
          <div class="form-group"><label>Personal History</label><textarea rows="2" [(ngModel)]="subjective().personalHistory" (ngModelChange)="mutateSubjective('personalHistory', $event)" name="s_ph"></textarea></div>
          <div class="form-group"><label>Family History</label><textarea rows="2" [(ngModel)]="subjective().familyHistory" (ngModelChange)="mutateSubjective('familyHistory', $event)" name="s_fh"></textarea></div>
          <div class="form-group"><label>Socioeconomic History</label><textarea rows="2" [(ngModel)]="subjective().socioeconomicHistory" (ngModelChange)="mutateSubjective('socioeconomicHistory', $event)" name="s_se"></textarea></div>
          <div class="form-group span-2"><label>Symptoms History</label><textarea rows="2" [(ngModel)]="subjective().symptomsHistory" (ngModelChange)="mutateSubjective('symptomsHistory', $event)" name="s_sh"></textarea></div>
        </div>

        <div class="sub-head">Symptoms</div>
        <div class="card-body grid-3 tight">
          <div class="form-group"><label>Side</label><input type="text" [ngModel]="subjective().symptoms.side" (ngModelChange)="mutateSymptom('side', $event)" name="sym_side" /></div>
          <div class="form-group"><label>Site</label><input type="text" [ngModel]="subjective().symptoms.site" (ngModelChange)="mutateSymptom('site', $event)" name="sym_site" /></div>
          <div class="form-group"><label>Onset</label><input type="text" [ngModel]="subjective().symptoms.onset" (ngModelChange)="mutateSymptom('onset', $event)" name="sym_onset" /></div>
          <div class="form-group"><label>Duration</label><input type="text" [ngModel]="subjective().symptoms.duration" (ngModelChange)="mutateSymptom('duration', $event)" name="sym_dur" /></div>
          <div class="form-group"><label>Type</label><input type="text" [ngModel]="subjective().symptoms.type" (ngModelChange)="mutateSymptom('type', $event)" name="sym_type" /></div>
          <div class="form-group"><label>Severity</label><input type="text" [ngModel]="subjective().symptoms.severity" (ngModelChange)="mutateSymptom('severity', $event)" name="sym_sev" /></div>
        </div>

        <div class="card-body grid-2">
          <div class="form-group"><label>Aggravating Factors</label><textarea rows="2" [(ngModel)]="subjective().aggravatingFactors" (ngModelChange)="mutateSubjective('aggravatingFactors', $event)" name="s_agg"></textarea></div>
          <div class="form-group"><label>Relieving Factors</label><textarea rows="2" [(ngModel)]="subjective().relievingFactors" (ngModelChange)="mutateSubjective('relievingFactors', $event)" name="s_rel"></textarea></div>
        </div>
      </details>

      <!-- II. Objective Examination -->
      <details class="card" open>
        <summary class="section-head"><h2>II. Objective Examination — On Observation</h2></summary>
        <div class="card-body grid-3">
          <div class="form-group"><label>Built</label><input type="text" [(ngModel)]="observation().built" (ngModelChange)="mutateObservation('built', $event)" name="o_built" /></div>
          <div class="form-group"><label>Wasting</label><input type="text" [(ngModel)]="observation().wasting" (ngModelChange)="mutateObservation('wasting', $event)" name="o_wast" /></div>
          <div class="form-group"><label>Oedema</label><input type="text" [(ngModel)]="observation().oedema" (ngModelChange)="mutateObservation('oedema', $event)" name="o_oed" /></div>
          <div class="form-group"><label>Bandages / Scars</label><input type="text" [(ngModel)]="observation().bandagesScars" (ngModelChange)="mutateObservation('bandagesScars', $event)" name="o_band" /></div>
          <div class="form-group"><label>Attitude of the Limbs</label><input type="text" [(ngModel)]="observation().attitudeOfLimbs" (ngModelChange)="mutateObservation('attitudeOfLimbs', $event)" name="o_att" /></div>
          <div class="form-group"><label>Type of gait</label><input type="text" [(ngModel)]="observation().typeOfGait" (ngModelChange)="mutateObservation('typeOfGait', $event)" name="o_gait" /></div>
          <div class="form-group"><label>Bony contours</label><input type="text" [(ngModel)]="observation().bonyContours" (ngModelChange)="mutateObservation('bonyContours', $event)" name="o_bony" /></div>
          <div class="form-group"><label>Deformities</label><input type="text" [(ngModel)]="observation().deformities" (ngModelChange)="mutateObservation('deformities', $event)" name="o_def" /></div>
        </div>

        <div class="sub-head">Pain Score</div>
        <div class="pain-block">
          <input type="range" min="0" max="10" step="1"
                 [ngModel]="observation().painScore"
                 (ngModelChange)="mutateObservation('painScore', +$event)"
                 name="painScore" class="pain-slider" />
          <div class="pain-labels">
            <span>0 — No pain</span>
            <span>5 — Moderate pain</span>
            <span>10 — Worst possible pain</span>
          </div>
          <div class="pain-value">Current: <strong>{{ observation().painScore }}</strong> / 10</div>
        </div>

        <div class="sub-head">Vital Signs</div>
        <div class="card-body grid-4">
          <div class="form-group"><label>Temperature</label><input type="text" [ngModel]="observation().vitals.temperature" (ngModelChange)="mutateVital('temperature', $event)" name="v_temp" /></div>
          <div class="form-group"><label>Heart Rate</label><input type="text" [ngModel]="observation().vitals.heartRate" (ngModelChange)="mutateVital('heartRate', $event)" name="v_hr" /></div>
          <div class="form-group"><label>Blood Pressure</label><input type="text" [ngModel]="observation().vitals.bloodPressure" (ngModelChange)="mutateVital('bloodPressure', $event)" name="v_bp" /></div>
          <div class="form-group"><label>Respiratory Rate</label><input type="text" [ngModel]="observation().vitals.respiratoryRate" (ngModelChange)="mutateVital('respiratoryRate', $event)" name="v_rr" /></div>
        </div>

        <div class="card-body">
          <div class="form-group">
            <label>Body chart observations (deformities, edema, etc.)</label>
            <textarea rows="3" [(ngModel)]="observation().bodyChartNotes" (ngModelChange)="mutateObservation('bodyChartNotes', $event)" name="bodychart"></textarea>
          </div>
        </div>
      </details>

      <!-- On Palpation -->
      <details class="card">
        <summary class="section-head"><h2>On Palpation</h2></summary>
        <div class="card-body grid-3">
          <div class="form-group"><label>Tenderness</label><input type="text" [(ngModel)]="palpation().tenderness" (ngModelChange)="mutatePalpation('tenderness', $event)" name="p_ten" /></div>
          <div class="form-group"><label>Tissue tension / texture</label><input type="text" [(ngModel)]="palpation().tissueTension" (ngModelChange)="mutatePalpation('tissueTension', $event)" name="p_tt" /></div>
          <div class="form-group"><label>Spasm</label><input type="text" [(ngModel)]="palpation().spasm" (ngModelChange)="mutatePalpation('spasm', $event)" name="p_sp" /></div>
          <div class="form-group"><label>Type of Skin</label><input type="text" [(ngModel)]="palpation().typeOfSkin" (ngModelChange)="mutatePalpation('typeOfSkin', $event)" name="p_skin" /></div>
          <div class="form-group"><label>Scar</label><input type="text" [(ngModel)]="palpation().scar" (ngModelChange)="mutatePalpation('scar', $event)" name="p_scar" /></div>
          <div class="form-group"><label>Swelling</label><input type="text" [(ngModel)]="palpation().swelling" (ngModelChange)="mutatePalpation('swelling', $event)" name="p_sw" /></div>
          <div class="form-group"><label>Crepitus</label><input type="text" [(ngModel)]="palpation().crepitus" (ngModelChange)="mutatePalpation('crepitus', $event)" name="p_crep" /></div>
        </div>
      </details>

      <!-- ROM Upper Limb -->
      <details class="card">
        <summary class="section-head">
          <h2>Motor Assessment — Upper Limb ROM</h2>
          <button type="button" class="btn btn-outline btn-sm" (click)="addRomUpperRow(); $event.preventDefault()">+ Add row</button>
        </summary>
        <div class="table-wrap">
          <table class="data-table rom-table">
            <thead>
              <tr>
                <th>Joint</th><th>Movement</th>
                <th>Active Rt</th><th>Active Lt</th>
                <th>Passive Rt</th><th>Passive Lt</th>
                <th>End Feel</th><th>Limitation</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of romUpper(); track $index; let i = $index) {
                <tr>
                  <td><input type="text" [ngModel]="row.joint" (ngModelChange)="mutateRowField(romUpper, i, 'joint', $event)" [name]="'ru_j_'+i" /></td>
                  <td><input type="text" [ngModel]="row.movement" (ngModelChange)="mutateRowField(romUpper, i, 'movement', $event)" [name]="'ru_m_'+i" /></td>
                  <td><input type="text" [ngModel]="row.activeRt" (ngModelChange)="mutateRowField(romUpper, i, 'activeRt', $event)" [name]="'ru_ar_'+i" /></td>
                  <td><input type="text" [ngModel]="row.activeLt" (ngModelChange)="mutateRowField(romUpper, i, 'activeLt', $event)" [name]="'ru_al_'+i" /></td>
                  <td><input type="text" [ngModel]="row.passiveRt" (ngModelChange)="mutateRowField(romUpper, i, 'passiveRt', $event)" [name]="'ru_pr_'+i" /></td>
                  <td><input type="text" [ngModel]="row.passiveLt" (ngModelChange)="mutateRowField(romUpper, i, 'passiveLt', $event)" [name]="'ru_pl_'+i" /></td>
                  <td><input type="text" [ngModel]="row.endFeel" (ngModelChange)="mutateRowField(romUpper, i, 'endFeel', $event)" [name]="'ru_ef_'+i" /></td>
                  <td><input type="text" [ngModel]="row.limitation" (ngModelChange)="mutateRowField(romUpper, i, 'limitation', $event)" [name]="'ru_lim_'+i" /></td>
                  <td><button type="button" class="btn-icon" (click)="removeRow(romUpper, i)" title="Remove">×</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- ROM Lower Limb -->
      <details class="card">
        <summary class="section-head">
          <h2>Lower Limb ROM</h2>
          <button type="button" class="btn btn-outline btn-sm" (click)="addRomLowerRow(); $event.preventDefault()">+ Add row</button>
        </summary>
        <div class="table-wrap">
          <table class="data-table rom-table">
            <thead>
              <tr>
                <th>Joint</th><th>Movement</th>
                <th>Active Rt</th><th>Active Lt</th>
                <th>Passive Rt</th><th>Passive Lt</th>
                <th>End Feel</th><th>Limitation</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of romLower(); track $index; let i = $index) {
                <tr>
                  <td><input type="text" [ngModel]="row.joint" (ngModelChange)="mutateRowField(romLower, i, 'joint', $event)" [name]="'rl_j_'+i" /></td>
                  <td><input type="text" [ngModel]="row.movement" (ngModelChange)="mutateRowField(romLower, i, 'movement', $event)" [name]="'rl_m_'+i" /></td>
                  <td><input type="text" [ngModel]="row.activeRt" (ngModelChange)="mutateRowField(romLower, i, 'activeRt', $event)" [name]="'rl_ar_'+i" /></td>
                  <td><input type="text" [ngModel]="row.activeLt" (ngModelChange)="mutateRowField(romLower, i, 'activeLt', $event)" [name]="'rl_al_'+i" /></td>
                  <td><input type="text" [ngModel]="row.passiveRt" (ngModelChange)="mutateRowField(romLower, i, 'passiveRt', $event)" [name]="'rl_pr_'+i" /></td>
                  <td><input type="text" [ngModel]="row.passiveLt" (ngModelChange)="mutateRowField(romLower, i, 'passiveLt', $event)" [name]="'rl_pl_'+i" /></td>
                  <td><input type="text" [ngModel]="row.endFeel" (ngModelChange)="mutateRowField(romLower, i, 'endFeel', $event)" [name]="'rl_ef_'+i" /></td>
                  <td><input type="text" [ngModel]="row.limitation" (ngModelChange)="mutateRowField(romLower, i, 'limitation', $event)" [name]="'rl_lim_'+i" /></td>
                  <td><button type="button" class="btn-icon" (click)="removeRow(romLower, i)" title="Remove">×</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Spine ROM -->
      <details class="card">
        <summary class="section-head">
          <h2>Spine ROM</h2>
          <button type="button" class="btn btn-outline btn-sm" (click)="addRomSpineRow(); $event.preventDefault()">+ Add row</button>
        </summary>
        <div class="table-wrap">
          <table class="data-table rom-table">
            <thead>
              <tr>
                <th>Joint</th><th>Movement</th>
                <th>Active</th><th>Passive</th>
                <th>End Feel</th><th>Limitation</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of romSpine(); track $index; let i = $index) {
                <tr>
                  <td><input type="text" [ngModel]="row.joint" (ngModelChange)="mutateRowField(romSpine, i, 'joint', $event)" [name]="'rs_j_'+i" /></td>
                  <td><input type="text" [ngModel]="row.movement" (ngModelChange)="mutateRowField(romSpine, i, 'movement', $event)" [name]="'rs_m_'+i" /></td>
                  <td><input type="text" [ngModel]="row.active" (ngModelChange)="mutateRowField(romSpine, i, 'active', $event)" [name]="'rs_a_'+i" /></td>
                  <td><input type="text" [ngModel]="row.passive" (ngModelChange)="mutateRowField(romSpine, i, 'passive', $event)" [name]="'rs_p_'+i" /></td>
                  <td><input type="text" [ngModel]="row.endFeel" (ngModelChange)="mutateRowField(romSpine, i, 'endFeel', $event)" [name]="'rs_ef_'+i" /></td>
                  <td><input type="text" [ngModel]="row.limitation" (ngModelChange)="mutateRowField(romSpine, i, 'limitation', $event)" [name]="'rs_lim_'+i" /></td>
                  <td><button type="button" class="btn-icon" (click)="removeRow(romSpine, i)" title="Remove">×</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- MMT Upper -->
      <details class="card">
        <summary class="section-head"><h2>MMT — Upper Limb</h2></summary>
        <div class="table-wrap">
          <table class="data-table mmt-table">
            <thead><tr><th>Group</th><th>Muscle</th><th>Rt</th><th>Lt</th></tr></thead>
            <tbody>
              @for (row of mmtUpper(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.group }}</td>
                  <td>{{ row.muscle }}</td>
                  <td>
                    <select [ngModel]="row.rt" (ngModelChange)="mutateRowField(mmtUpper, i, 'rt', $event)" [name]="'mu_rt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                  <td>
                    <select [ngModel]="row.lt" (ngModelChange)="mutateRowField(mmtUpper, i, 'lt', $event)" [name]="'mu_lt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- MMT Lower -->
      <details class="card">
        <summary class="section-head"><h2>MMT — Lower Limb</h2></summary>
        <div class="table-wrap">
          <table class="data-table mmt-table">
            <thead><tr><th>Group</th><th>Muscle</th><th>Rt</th><th>Lt</th></tr></thead>
            <tbody>
              @for (row of mmtLower(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.group }}</td>
                  <td>{{ row.muscle }}</td>
                  <td>
                    <select [ngModel]="row.rt" (ngModelChange)="mutateRowField(mmtLower, i, 'rt', $event)" [name]="'ml_rt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                  <td>
                    <select [ngModel]="row.lt" (ngModelChange)="mutateRowField(mmtLower, i, 'lt', $event)" [name]="'ml_lt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Trunk MMT -->
      <details class="card">
        <summary class="section-head"><h2>Trunk MMT</h2></summary>
        <div class="table-wrap">
          <table class="data-table mmt-table">
            <thead><tr><th>Muscle</th><th>Rt</th><th>Lt</th></tr></thead>
            <tbody>
              @for (row of mmtTrunk(); track $index; let i = $index) {
                <tr>
                  <td>{{ row.muscle }}</td>
                  <td>
                    <select [ngModel]="row.rt" (ngModelChange)="mutateRowField(mmtTrunk, i, 'rt', $event)" [name]="'mt_rt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                  <td>
                    <select [ngModel]="row.lt" (ngModelChange)="mutateRowField(mmtTrunk, i, 'lt', $event)" [name]="'mt_lt_'+i">
                      @for (g of mmtGrades; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Resisted Isometrics -->
      <details class="card">
        <summary class="section-head"><h2>Resisted Isometrics (RI)</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Muscles</th><th>Findings</th></tr></thead>
            <tbody>
              @for (row of ri(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.muscles }}</td>
                  <td><input type="text" [ngModel]="row.findings" (ngModelChange)="mutateRowField(ri, i, 'findings', $event)" [name]="'ri_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Reflexes -->
      <details class="card">
        <summary class="section-head"><h2>Reflexes</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Group</th><th>Reflex</th><th>Left</th><th>Right</th></tr></thead>
            <tbody>
              @for (row of reflexes(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.group }}</td>
                  <td>{{ row.reflex }}</td>
                  <td><input type="text" [ngModel]="row.left" (ngModelChange)="mutateRowField(reflexes, i, 'left', $event)" [name]="'rfx_l_'+i" /></td>
                  <td><input type="text" [ngModel]="row.right" (ngModelChange)="mutateRowField(reflexes, i, 'right', $event)" [name]="'rfx_r_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Muscle Girth -->
      <details class="card">
        <summary class="section-head"><h2>Muscle Girth</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Area</th><th>Rt (cm)</th><th>Lt (cm)</th></tr></thead>
            <tbody>
              @for (row of muscleGirth(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.area }}</td>
                  <td><input type="text" [ngModel]="row.rt" (ngModelChange)="mutateRowField(muscleGirth, i, 'rt', $event)" [name]="'mg_rt_'+i" /></td>
                  <td><input type="text" [ngModel]="row.lt" (ngModelChange)="mutateRowField(muscleGirth, i, 'lt', $event)" [name]="'mg_lt_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Limb Length -->
      <details class="card">
        <summary class="section-head"><h2>Limb Length</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Side</th><th>Rt (cm)</th><th>Lt (cm)</th></tr></thead>
            <tbody>
              @for (row of limbLength(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.side }}</td>
                  <td><input type="text" [ngModel]="row.rt" (ngModelChange)="mutateRowField(limbLength, i, 'rt', $event)" [name]="'ll_rt_'+i" /></td>
                  <td><input type="text" [ngModel]="row.lt" (ngModelChange)="mutateRowField(limbLength, i, 'lt', $event)" [name]="'ll_lt_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Sensory Assessment -->
      <details class="card">
        <summary class="section-head"><h2>Sensory Assessment</h2></summary>
        <div class="table-wrap">
          <table class="data-table sensory-table">
            <thead>
              <tr>
                <th>Group</th><th>Location</th>
                <th>Upper Rt</th><th>Upper Lt</th>
                <th>Lower Rt</th><th>Lower Lt</th>
                <th>Trunk Rt</th><th>Trunk Lt</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              @for (row of sensory(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.group }}</td>
                  <td>{{ row.location }}</td>
                  <td><input type="text" [ngModel]="row.upperExtRt" (ngModelChange)="mutateRowField(sensory, i, 'upperExtRt', $event)" [name]="'ss_ur_'+i" /></td>
                  <td><input type="text" [ngModel]="row.upperExtLt" (ngModelChange)="mutateRowField(sensory, i, 'upperExtLt', $event)" [name]="'ss_ul_'+i" /></td>
                  <td><input type="text" [ngModel]="row.lowerExtRt" (ngModelChange)="mutateRowField(sensory, i, 'lowerExtRt', $event)" [name]="'ss_lr_'+i" /></td>
                  <td><input type="text" [ngModel]="row.lowerExtLt" (ngModelChange)="mutateRowField(sensory, i, 'lowerExtLt', $event)" [name]="'ss_ll_'+i" /></td>
                  <td><input type="text" [ngModel]="row.trunkRt" (ngModelChange)="mutateRowField(sensory, i, 'trunkRt', $event)" [name]="'ss_tr_'+i" /></td>
                  <td><input type="text" [ngModel]="row.trunkLt" (ngModelChange)="mutateRowField(sensory, i, 'trunkLt', $event)" [name]="'ss_tl_'+i" /></td>
                  <td><input type="text" [ngModel]="row.comments" (ngModelChange)="mutateRowField(sensory, i, 'comments', $event)" [name]="'ss_c_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="card-body grid-2">
          <div class="form-group"><label>Dermatomes</label><textarea rows="2" [(ngModel)]="dermatomes" name="derm"></textarea></div>
          <div class="form-group"><label>Myotomes</label><textarea rows="2" [(ngModel)]="myotomes" name="myo"></textarea></div>
        </div>
      </details>

      <!-- FIM -->
      <details class="card">
        <summary class="section-head"><h2>Functional Independence Measure (FIM)</h2></summary>
        <div class="table-wrap">
          <table class="data-table fim-table">
            <thead><tr><th>#</th><th>Item</th><th>Score (1-7)</th><th>Comment</th></tr></thead>
            <tbody>
              @for (row of fim(); track row.index; let i = $index) {
                <tr>
                  <td class="idx">{{ row.index }}</td>
                  <td>{{ row.item }}</td>
                  <td>
                    <select [ngModel]="row.score" (ngModelChange)="mutateRowField(fim, i, 'score', $event)" [name]="'fim_s_'+i">
                      @for (g of fimScores; track g) { <option [ngValue]="g">{{ g }}</option> }
                    </select>
                  </td>
                  <td><input type="text" [ngModel]="row.comment" (ngModelChange)="mutateRowField(fim, i, 'comment', $event)" [name]="'fim_c_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Gait Analysis -->
      <details class="card">
        <summary class="section-head"><h2>Gait Analysis</h2></summary>
        <div class="card-body grid-3">
          <div class="form-group"><label>Stance Phase</label><input type="text" [(ngModel)]="gait().stancePhase" (ngModelChange)="mutateGait('stancePhase', $event)" name="g_stance" /></div>
          <div class="form-group"><label>Base Width</label><input type="text" [(ngModel)]="gait().baseWidth" (ngModelChange)="mutateGait('baseWidth', $event)" name="g_base" /></div>
          <div class="form-group"><label>Swing Phase</label><input type="text" [(ngModel)]="gait().swingPhase" (ngModelChange)="mutateGait('swingPhase', $event)" name="g_swing" /></div>
          <div class="form-group"><label>Cadence</label><input type="text" [(ngModel)]="gait().cadence" (ngModelChange)="mutateGait('cadence', $event)" name="g_cad" /></div>
          <div class="form-group"><label>Step Length</label><input type="text" [(ngModel)]="gait().stepLength" (ngModelChange)="mutateGait('stepLength', $event)" name="g_step" /></div>
          <div class="form-group"><label>Stride Length</label><input type="text" [(ngModel)]="gait().strideLength" (ngModelChange)="mutateGait('strideLength', $event)" name="g_stride" /></div>
          <div class="form-group span-3"><label>Other</label><input type="text" [(ngModel)]="gait().other" (ngModelChange)="mutateGait('other', $event)" name="g_other" /></div>
        </div>
      </details>

      <!-- Balance -->
      <details class="card">
        <summary class="section-head"><h2>Balance</h2></summary>
        <div class="sub-head">Static</div>
        <div class="card-body grid-2">
          <div class="form-group"><label>Sitting — eyes open</label><input type="text" [(ngModel)]="balanceStatic().sittingEyesOpen" (ngModelChange)="mutateBalStatic('sittingEyesOpen', $event)" name="bs_so" /></div>
          <div class="form-group"><label>Sitting — eyes closed</label><input type="text" [(ngModel)]="balanceStatic().sittingEyesClosed" (ngModelChange)="mutateBalStatic('sittingEyesClosed', $event)" name="bs_sc" /></div>
          <div class="form-group"><label>Standing — eyes open</label><input type="text" [(ngModel)]="balanceStatic().standingEyesOpen" (ngModelChange)="mutateBalStatic('standingEyesOpen', $event)" name="bs_sto" /></div>
          <div class="form-group"><label>Standing — eyes closed</label><input type="text" [(ngModel)]="balanceStatic().standingEyesClosed" (ngModelChange)="mutateBalStatic('standingEyesClosed', $event)" name="bs_stc" /></div>
          <div class="form-group"><label>Tandem standing — eyes open</label><input type="text" [(ngModel)]="balanceStatic().tandemEyesOpen" (ngModelChange)="mutateBalStatic('tandemEyesOpen', $event)" name="bs_to" /></div>
          <div class="form-group"><label>Tandem standing — eyes closed</label><input type="text" [(ngModel)]="balanceStatic().tandemEyesClosed" (ngModelChange)="mutateBalStatic('tandemEyesClosed', $event)" name="bs_tc" /></div>
        </div>
        <div class="sub-head">Dynamic</div>
        <div class="card-body grid-2">
          <div class="form-group"><label>Reaching activities</label><input type="text" [(ngModel)]="balanceDynamic().reachingActivities" (ngModelChange)="mutateBalDynamic('reachingActivities', $event)" name="bd_r" /></div>
          <div class="form-group"><label>Perturbation</label><input type="text" [(ngModel)]="balanceDynamic().perturbation" (ngModelChange)="mutateBalDynamic('perturbation', $event)" name="bd_p" /></div>
        </div>
      </details>

      <!-- Hand Function -->
      <details class="card">
        <summary class="section-head"><h2>Hand Function</h2></summary>
        <div class="card-body grid-2">
          <div class="form-group"><label>Reaching</label><input type="text" [(ngModel)]="handFunction().reaching" (ngModelChange)="mutateHand('reaching', $event)" name="hf_r" /></div>
          <div class="form-group"><label>Grasping</label><input type="text" [(ngModel)]="handFunction().grasping" (ngModelChange)="mutateHand('grasping', $event)" name="hf_g" /></div>
          <div class="form-group"><label>Releasing</label><input type="text" [(ngModel)]="handFunction().releasing" (ngModelChange)="mutateHand('releasing', $event)" name="hf_rel" /></div>
          <div class="form-group"><label>Assistive Devices</label><input type="text" [(ngModel)]="handFunction().assistiveDevices" (ngModelChange)="mutateHand('assistiveDevices', $event)" name="hf_ad" /></div>
        </div>
      </details>

      <!-- Coordination Non-Equilibrium -->
      <details class="card">
        <summary class="section-head"><h2>Coordination — Non-Equilibrium Tests</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Test</th><th>Rt</th><th>Lt</th></tr></thead>
            <tbody>
              @for (row of coordNonEquil(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.test }}</td>
                  <td><input type="text" [ngModel]="row.rt" (ngModelChange)="mutateRowField(coordNonEquil, i, 'rt', $event)" [name]="'cne_rt_'+i" /></td>
                  <td><input type="text" [ngModel]="row.lt" (ngModelChange)="mutateRowField(coordNonEquil, i, 'lt', $event)" [name]="'cne_lt_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Coordination Equilibrium -->
      <details class="card">
        <summary class="section-head"><h2>Coordination — Equilibrium Tests</h2></summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Test</th><th>Grade</th></tr></thead>
            <tbody>
              @for (row of coordEquil(); track $index; let i = $index) {
                <tr>
                  <td class="group-cell">{{ row.test }}</td>
                  <td><input type="text" [ngModel]="row.grade" (ngModelChange)="mutateRowField(coordEquil, i, 'grade', $event)" [name]="'ce_g_'+i" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Special Tests -->
      <details class="card">
        <summary class="section-head">
          <h2>Special Tests</h2>
          <button type="button" class="btn btn-outline btn-sm" (click)="addSpecialTest(); $event.preventDefault()">+ Add test</button>
        </summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Test name</th><th>Positive</th><th>Negative</th><th></th></tr></thead>
            <tbody>
              @for (row of specialTests(); track $index; let i = $index) {
                <tr>
                  <td><input type="text" [ngModel]="row.name" (ngModelChange)="mutateRowField(specialTests, i, 'name', $event)" [name]="'st_n_'+i" /></td>
                  <td class="center"><input type="checkbox" class="big-check" [ngModel]="row.positive" (ngModelChange)="mutateRowField(specialTests, i, 'positive', $event)" [name]="'st_p_'+i" /></td>
                  <td class="center"><input type="checkbox" class="big-check" [ngModel]="row.negative" (ngModelChange)="mutateRowField(specialTests, i, 'negative', $event)" [name]="'st_neg_'+i" /></td>
                  <td><button type="button" class="btn-icon" (click)="removeRow(specialTests, i)" title="Remove">×</button></td>
                </tr>
              }
              @if (specialTests().length === 0) {
                <tr><td colspan="4" class="muted">No special tests added — click "+ Add test".</td></tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Investigations -->
      <details class="card">
        <summary class="section-head"><h2>Investigations</h2></summary>
        <div class="card-body">
          <div class="form-group"><textarea rows="3" [(ngModel)]="investigations" name="invest"></textarea></div>
        </div>
      </details>

      <!-- Problem List -->
      <details class="card">
        <summary class="section-head">
          <h2>Problem List</h2>
          <button type="button" class="btn btn-outline btn-sm" (click)="addProblem(); $event.preventDefault()">+ Add problem</button>
        </summary>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Impairment</th><th>Functional Limitation</th><th>Disability</th><th></th></tr></thead>
            <tbody>
              @for (row of problemList(); track $index; let i = $index) {
                <tr>
                  <td><input type="text" [ngModel]="row.impairment" (ngModelChange)="mutateRowField(problemList, i, 'impairment', $event)" [name]="'pl_i_'+i" /></td>
                  <td><input type="text" [ngModel]="row.functionalLimitation" (ngModelChange)="mutateRowField(problemList, i, 'functionalLimitation', $event)" [name]="'pl_f_'+i" /></td>
                  <td><input type="text" [ngModel]="row.disability" (ngModelChange)="mutateRowField(problemList, i, 'disability', $event)" [name]="'pl_d_'+i" /></td>
                  <td><button type="button" class="btn-icon" (click)="removeRow(problemList, i)" title="Remove">×</button></td>
                </tr>
              }
              @if (problemList().length === 0) {
                <tr><td colspan="4" class="muted">No problems added yet — click "+ Add problem".</td></tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- Functional Diagnosis -->
      <details class="card">
        <summary class="section-head"><h2>Functional Diagnosis</h2></summary>
        <div class="card-body">
          <div class="form-group"><textarea rows="3" [(ngModel)]="functionalDiagnosis" name="fdx"></textarea></div>
        </div>
      </details>

      <!-- Goals -->
      <details class="card">
        <summary class="section-head"><h2>Goals</h2></summary>
        <div class="card-body grid-2">
          <div class="form-group"><label>Short Term Goals</label><textarea rows="4" [(ngModel)]="shortTermGoals" name="stg"></textarea></div>
          <div class="form-group"><label>Long Term Goals</label><textarea rows="4" [(ngModel)]="longTermGoals" name="ltg"></textarea></div>
        </div>
      </details>

      <!-- Treatment Plan -->
      <details class="card">
        <summary class="section-head"><h2>Treatment Plan</h2></summary>
        <div class="card-body">
          <div class="form-group"><textarea rows="6" [(ngModel)]="treatmentPlan" name="tp"></textarea></div>
        </div>
      </details>

      <!-- Home Programme -->
      <details class="card">
        <summary class="section-head"><h2>Home Programme</h2></summary>
        <div class="card-body">
          <div class="form-group"><textarea rows="4" [(ngModel)]="homeProgramme" name="hp"></textarea></div>
        </div>
      </details>

      <!-- Footer -->
      <details class="card" open>
        <summary class="section-head"><h2>Signature</h2></summary>
        <div class="card-body grid-3">
          <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="footer().date" (ngModelChange)="mutateFooter('date', $event)" name="f_date" /></div>
          <div class="form-group"><label>Physiotherapist's Name</label><input type="text" [(ngModel)]="footer().physiotherapistName" (ngModelChange)="mutateFooter('physiotherapistName', $event)" name="f_name" /></div>
          <div class="form-group"><label>Signature</label><input type="text" [(ngModel)]="footer().signature" (ngModelChange)="mutateFooter('signature', $event)" name="f_sig" placeholder="Type name to sign" /></div>
        </div>
      </details>

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
    :host { display: block; --accent: #3D6FB0; }

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
    .header-title p { margin: 0; font-size: 0.85rem; color: var(--text-muted); max-width: 620px; }

    .header-actions { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }

    .btn {
      padding: 0.6rem 1.25rem; border-radius: var(--radius-sm);
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      border: 1.5px solid transparent; transition: var(--transition);
    }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
    .btn-primary { background: var(--accent); color: var(--white); border-color: var(--accent); }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.92); }
    .btn-outline { background: transparent; color: var(--text); border-color: var(--border-light); }
    .btn-outline:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-icon {
      border: none; background: transparent;
      color: var(--text-muted); cursor: pointer;
      font-size: 1.2rem; line-height: 1; padding: 0.1rem 0.45rem;
      border-radius: 6px;
    }
    .btn-icon:hover { background: color-mix(in srgb, #D95A5A 15%, transparent); color: #D95A5A; }

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
    details.card > summary { list-style: none; cursor: pointer; }
    details.card > summary::-webkit-details-marker { display: none; }
    details.card > summary::after {
      content: '▾'; margin-inline-start: auto;
      color: var(--text-muted); transition: transform 0.2s ease;
      font-size: 0.9rem;
    }
    details.card:not([open]) > summary::after { transform: rotate(-90deg); }

    .card-body { padding: 1.25rem 1.5rem; }
    .card-body.tight { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem 1.5rem; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem 1.5rem; }
    .span-2 { grid-column: span 2; }
    .span-3 { grid-column: span 3; }

    .section-head {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 0.5rem;
    }
    .section-head h2 { margin: 0; font-size: 1.05rem; color: var(--heading-color); }

    .sub-head {
      padding: 0.75rem 1.5rem 0.25rem;
      font-size: 0.85rem; font-weight: 700;
      color: var(--accent); text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: var(--text); }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.5rem 0.75rem;
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
    .form-group textarea { resize: vertical; min-height: 60px; }

    .input-skeleton {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .pill-row { display: flex; gap: 0.4rem; }
    .radio-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.35rem 0.85rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-xl);
      cursor: pointer; font-size: 0.82rem; font-weight: 600;
      color: var(--text-muted); background: var(--white);
      transition: var(--transition);
    }
    .radio-pill input { display: none; }
    .radio-pill:hover { border-color: var(--accent); }
    .radio-pill.active { background: var(--accent); color: var(--white); border-color: var(--accent); }

    .table-wrap { overflow-x: auto; padding: 0.5rem 0.75rem 1rem; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 0.85rem;
    }
    .data-table th {
      background: var(--off-white);
      padding: 0.55rem 0.5rem;
      text-align: start;
      font-weight: 700; color: var(--heading-color);
      border-bottom: 1.5px solid var(--border-light);
      font-size: 0.78rem;
    }
    .data-table td {
      padding: 0.35rem 0.4rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-light) 70%, transparent);
      vertical-align: middle;
    }
    .data-table td.center { text-align: center; }
    .data-table td.muted { color: var(--text-muted); text-align: center; padding: 1rem; font-style: italic; }
    .data-table td.idx { width: 36px; text-align: center; color: var(--text-muted); font-weight: 700; }
    .data-table td.group-cell { font-weight: 700; color: var(--accent); font-size: 0.82rem; white-space: nowrap; }
    .data-table input[type="text"],
    .data-table select {
      width: 100%;
      padding: 0.35rem 0.5rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.82rem;
      background: var(--white); color: var(--text);
    }
    .big-check { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); }

    .rom-table th, .rom-table td { font-size: 0.78rem; }
    .sensory-table th, .sensory-table td { font-size: 0.76rem; padding: 0.3rem 0.35rem; }
    .fim-table td:first-child { width: 36px; }

    .pain-block {
      padding: 0.25rem 1.5rem 1.25rem;
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    .pain-slider { width: 100%; accent-color: var(--accent); }
    .pain-labels {
      display: flex; justify-content: space-between;
      font-size: 0.72rem; color: var(--text-muted);
    }
    .pain-value { font-size: 0.85rem; color: var(--text); }
    .pain-value strong { color: var(--accent); font-size: 1.05rem; }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0 2rem;
    }

    @media (max-width: 900px) {
      .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
      .span-3 { grid-column: span 2; }
    }
    @media (max-width: 640px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
      .span-2, .span-3 { grid-column: span 1; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; }
    }
  `,
})
export class PhysioAssessmentPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // Top-level form state
  studentId = signal<string>('');
  evalDate = signal<string>(new Date().toISOString().slice(0, 10));

  // Header block
  header = signal<PhysioHeader>({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    age: '',
    gender: '',
    ipOp: '',
    occupation: '',
    referredBy: '',
    address: '',
    phone: '',
    registrationNumber: '',
    civilStatus: '',
    diagnosis: '',
  });

  // I. Subjective
  subjective = signal<PhysioSubjective>({
    chiefComplaints: '',
    pastMedicalHistory: '',
    personalHistory: '',
    familyHistory: '',
    socioeconomicHistory: '',
    symptomsHistory: '',
    symptoms: { side: '', site: '', onset: '', duration: '', type: '', severity: '' },
    aggravatingFactors: '',
    relievingFactors: '',
  });

  // II. Objective / observation
  observation = signal<PhysioObservation>({
    built: '', wasting: '', oedema: '', bandagesScars: '',
    attitudeOfLimbs: '', typeOfGait: '', bonyContours: '', deformities: '',
    painScore: 0,
    vitals: { temperature: '', heartRate: '', bloodPressure: '', respiratoryRate: '' },
    bodyChartNotes: '',
  });

  palpation = signal<PhysioPalpation>({
    tenderness: '', tissueTension: '', spasm: '', typeOfSkin: '',
    scar: '', swelling: '', crepitus: '',
  });

  // ROM tables
  romUpper = signal<PhysioRomBilateralRow[]>([
    this.blankRomBi('SHOULDER'),
    this.blankRomBi('ELBOW'),
    this.blankRomBi('FOREARM'),
    this.blankRomBi('WRIST'),
    this.blankRomBi('HANDS & FINGERS'),
  ]);
  romLower = signal<PhysioRomBilateralRow[]>([
    this.blankRomBi('HIP'),
    this.blankRomBi('KNEE'),
    this.blankRomBi('ANKLE'),
    this.blankRomBi('FOOT'),
  ]);
  romSpine = signal<PhysioRomSpineRow[]>([
    this.blankRomSpine('CERVICAL'),
    this.blankRomSpine('THORACIC'),
    this.blankRomSpine('LUMBAR'),
  ]);

  // MMT tables
  mmtUpper = signal<PhysioMmtRow[]>(this.seedMmtUpper());
  mmtLower = signal<PhysioMmtRow[]>(this.seedMmtLower());
  mmtTrunk = signal<PhysioMmtRow[]>([
    { group: 'TRUNK', muscle: 'Trunk Flexors', rt: '', lt: '' },
    { group: 'TRUNK', muscle: 'Trunk Extensors', rt: '', lt: '' },
    { group: 'TRUNK', muscle: 'Trunk Side Flexors', rt: '', lt: '' },
    { group: 'TRUNK', muscle: 'Trunk Rotators', rt: '', lt: '' },
  ]);

  ri = signal<PhysioRiRow[]>([
    { muscles: 'Upper Limb', findings: '' },
    { muscles: 'Lower Limb', findings: '' },
  ]);

  reflexes = signal<PhysioReflexRow[]>([
    { group: 'Superficial', reflex: 'Abdominal', left: '', right: '' },
    { group: 'Superficial', reflex: 'Plantar', left: '', right: '' },
    { group: 'Deep', reflex: 'Biceps', left: '', right: '' },
    { group: 'Deep', reflex: 'Brachioradialis', left: '', right: '' },
    { group: 'Deep', reflex: 'Triceps', left: '', right: '' },
    { group: 'Deep', reflex: 'Knee', left: '', right: '' },
    { group: 'Deep', reflex: 'Ankle', left: '', right: '' },
  ]);

  muscleGirth = signal<PhysioMeasureRow[]>([
    { area: 'Arm', rt: '', lt: '' },
    { area: 'Forearm', rt: '', lt: '' },
    { area: 'Thigh', rt: '', lt: '' },
    { area: 'Calf', rt: '', lt: '' },
  ]);

  limbLength = signal<PhysioLimbLengthRow[]>([
    { side: 'True', rt: '', lt: '' },
    { side: 'Apparent', rt: '', lt: '' },
  ]);

  sensory = signal<PhysioSensoryRow[]>(this.seedSensory());
  dermatomes = signal<string>('');
  myotomes = signal<string>('');

  fim = signal<PhysioFimRow[]>(
    FIM_ITEMS.map((it) => ({ index: it.index, item: it.item, score: '', comment: '' })),
  );

  gait = signal<PhysioGait>({
    stancePhase: '', baseWidth: '', swingPhase: '', cadence: '',
    stepLength: '', strideLength: '', other: '',
  });

  balanceStatic = signal<PhysioBalanceStatic>({
    sittingEyesOpen: '', sittingEyesClosed: '',
    standingEyesOpen: '', standingEyesClosed: '',
    tandemEyesOpen: '', tandemEyesClosed: '',
  });
  balanceDynamic = signal<PhysioBalanceDynamic>({
    reachingActivities: '', perturbation: '',
  });

  handFunction = signal<PhysioHandFunction>({
    reaching: '', grasping: '', releasing: '', assistiveDevices: '',
  });

  coordNonEquil = signal<PhysioCoordNonEquilRow[]>([
    { test: 'Finger to nose', rt: '', lt: '' },
    { test: 'Finger opposition', rt: '', lt: '' },
    { test: 'Mass Grasp', rt: '', lt: '' },
    { test: 'Pronation / Supination', rt: '', lt: '' },
    { test: 'Rebound test', rt: '', lt: '' },
    { test: 'Tapping (Hand)', rt: '', lt: '' },
    { test: 'Tapping (Foot)', rt: '', lt: '' },
    { test: 'Heel to knee', rt: '', lt: '' },
    { test: 'Drawing circle (Hand)', rt: '', lt: '' },
    { test: 'Drawing circle (Foot)', rt: '', lt: '' },
  ]);

  coordEquil = signal<PhysioCoordEquilRow[]>([
    { test: 'Standing normal posture', grade: '' },
    { test: 'Standing with vision occluded', grade: '' },
    { test: 'Standing feet together', grade: '' },
    { test: 'Standing on one foot', grade: '' },
    { test: 'Standing lateral trunk flexion', grade: '' },
    { test: 'Tandem walking', grade: '' },
    { test: 'Walk sideways', grade: '' },
    { test: 'Walk backward', grade: '' },
    { test: 'Walk in circle', grade: '' },
    { test: 'Walk on heels', grade: '' },
    { test: 'Walk on toes', grade: '' },
  ]);

  specialTests = signal<PhysioSpecialTestRow[]>([]);
  investigations = signal<string>('');
  problemList = signal<PhysioProblemRow[]>([]);
  functionalDiagnosis = signal<string>('');
  shortTermGoals = signal<string>('');
  longTermGoals = signal<string>('');
  treatmentPlan = signal<string>('');
  homeProgramme = signal<string>('');

  footer = signal<PhysioFooter>({
    date: new Date().toISOString().slice(0, 10),
    physiotherapistName: '',
    signature: '',
  });

  // UI state
  loadingStudents = signal(true);
  students = signal<Student[]>([]);
  saving = signal(false);
  submitted = signal(false);
  savedNotice = signal<string | null>(null);

  readonly mmtGrades = ['', '0', '1', '2', '3', '4', '5'];
  readonly fimScores = ['', '1', '2', '3', '4', '5', '6', '7'];

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

  t(key: keyof typeof T.en): string {
    const lang = this.ts.currentLang();
    return T[lang][key] ?? T.en[key] ?? key;
  }

  // --- Object-signal mutators (update() pattern) ---
  mutateHeader<K extends keyof PhysioHeader>(key: K, value: PhysioHeader[K]): void {
    this.header.update((h) => ({ ...h, [key]: value }));
  }
  mutateSubjective<K extends keyof PhysioSubjective>(key: K, value: PhysioSubjective[K]): void {
    this.subjective.update((s) => ({ ...s, [key]: value }));
  }
  mutateSymptom<K extends keyof PhysioSubjective['symptoms']>(key: K, value: string): void {
    this.subjective.update((s) => ({ ...s, symptoms: { ...s.symptoms, [key]: value } }));
  }
  mutateObservation<K extends keyof PhysioObservation>(key: K, value: PhysioObservation[K]): void {
    this.observation.update((o) => ({ ...o, [key]: value }));
  }
  mutateVital<K extends keyof PhysioObservation['vitals']>(key: K, value: string): void {
    this.observation.update((o) => ({ ...o, vitals: { ...o.vitals, [key]: value } }));
  }
  mutatePalpation<K extends keyof PhysioPalpation>(key: K, value: PhysioPalpation[K]): void {
    this.palpation.update((p) => ({ ...p, [key]: value }));
  }
  mutateGait<K extends keyof PhysioGait>(key: K, value: PhysioGait[K]): void {
    this.gait.update((g) => ({ ...g, [key]: value }));
  }
  mutateBalStatic<K extends keyof PhysioBalanceStatic>(key: K, value: string): void {
    this.balanceStatic.update((b) => ({ ...b, [key]: value }));
  }
  mutateBalDynamic<K extends keyof PhysioBalanceDynamic>(key: K, value: string): void {
    this.balanceDynamic.update((b) => ({ ...b, [key]: value }));
  }
  mutateHand<K extends keyof PhysioHandFunction>(key: K, value: string): void {
    this.handFunction.update((h) => ({ ...h, [key]: value }));
  }
  mutateFooter<K extends keyof PhysioFooter>(key: K, value: PhysioFooter[K]): void {
    this.footer.update((f) => ({ ...f, [key]: value }));
  }

  // --- Row-level mutator for arrays of rows ---
  mutateRowField<T>(
    sig: { update: (fn: (arr: T[]) => T[]) => void },
    index: number,
    field: keyof T,
    value: unknown,
  ): void {
    sig.update((arr) => arr.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  removeRow<T>(sig: { update: (fn: (arr: T[]) => T[]) => void }, index: number): void {
    sig.update((arr) => arr.filter((_, i) => i !== index));
  }

  // --- Row adders ---
  addRomUpperRow(): void {
    this.romUpper.update((arr) => [...arr, this.blankRomBi('')]);
  }
  addRomLowerRow(): void {
    this.romLower.update((arr) => [...arr, this.blankRomBi('')]);
  }
  addRomSpineRow(): void {
    this.romSpine.update((arr) => [...arr, this.blankRomSpine('')]);
  }
  addSpecialTest(): void {
    this.specialTests.update((arr) => [...arr, { name: '', positive: false, negative: false }]);
  }
  addProblem(): void {
    this.problemList.update((arr) => [...arr, { impairment: '', functionalLimitation: '', disability: '' }]);
  }

  // --- Seeders ---
  private blankRomBi(joint: string): PhysioRomBilateralRow {
    return { joint, movement: '', activeRt: '', activeLt: '', passiveRt: '', passiveLt: '', endFeel: '', limitation: '' };
  }
  private blankRomSpine(joint: string): PhysioRomSpineRow {
    return { joint, movement: '', active: '', passive: '', endFeel: '', limitation: '' };
  }
  private seedMmtUpper(): PhysioMmtRow[] {
    return [
      ...['Flexor', 'Extensor', 'Abductors', 'Adductors', 'External Rotators', 'Internal Rotators']
        .map((m) => ({ group: 'SHOULDER', muscle: m, rt: '', lt: '' })),
      ...['Flexors', 'Extensors'].map((m) => ({ group: 'ELBOW', muscle: m, rt: '', lt: '' })),
      ...['Pronators', 'Supinators'].map((m) => ({ group: 'FOREARM', muscle: m, rt: '', lt: '' })),
      ...['Flexors', 'Extensors', 'Radial Deviators', 'Ulnar Deviators']
        .map((m) => ({ group: 'WRISTS', muscle: m, rt: '', lt: '' })),
      ...['Intrinsics', 'Extrinsics'].map((m) => ({ group: 'HAND', muscle: m, rt: '', lt: '' })),
    ];
  }
  private seedMmtLower(): PhysioMmtRow[] {
    return [
      ...['Flexors', 'Extensors', 'Abductors', 'Adductors', 'External Rotators', 'Internal Rotators']
        .map((m) => ({ group: 'HIP', muscle: m, rt: '', lt: '' })),
      ...['Flexors', 'Extensors'].map((m) => ({ group: 'KNEE', muscle: m, rt: '', lt: '' })),
      ...['Dorsiflexors', 'Plantarflexors'].map((m) => ({ group: 'ANKLE', muscle: m, rt: '', lt: '' })),
      ...['Invertors', 'Evertors', 'Intrinsics', 'Extrinsics']
        .map((m) => ({ group: 'FOOT', muscle: m, rt: '', lt: '' })),
    ];
  }
  private seedSensory(): PhysioSensoryRow[] {
    const empty = (g: 'Superficial' | 'Deep' | 'Cortical', loc: string): PhysioSensoryRow => ({
      group: g, location: loc,
      upperExtRt: '', upperExtLt: '', lowerExtRt: '', lowerExtLt: '',
      trunkRt: '', trunkLt: '', comments: '',
    });
    return [
      empty('Superficial', 'Pain'),
      empty('Superficial', 'Temperature'),
      empty('Superficial', 'Touch'),
      empty('Superficial', 'Pressure'),
      empty('Deep', 'Movement Sense'),
      empty('Deep', 'Position Sense'),
      empty('Deep', 'Vibration'),
      empty('Cortical', 'Tactile Localization'),
      empty('Cortical', '2-pt Discrimination'),
      empty('Cortical', 'Stereognosis'),
      empty('Cortical', 'Barognosis'),
      empty('Cortical', 'Graphesthesia'),
      empty('Cortical', 'Texture Recognition'),
      empty('Cortical', 'Double Simultaneous Stimulation'),
    ];
  }

  save(asDraft: boolean): void {
    this.submitted.set(true);
    if (!this.canSubmit()) return;

    this.saving.set(true);

    const payload: PhysioAssessmentData = {
      header: this.header(),
      subjective: this.subjective(),
      observation: this.observation(),
      palpation: this.palpation(),
      romUpper: this.romUpper(),
      romLower: this.romLower(),
      romSpine: this.romSpine(),
      mmtUpper: this.mmtUpper(),
      mmtLower: this.mmtLower(),
      mmtTrunk: this.mmtTrunk(),
      ri: this.ri(),
      reflexes: this.reflexes(),
      muscleGirth: this.muscleGirth(),
      limbLength: this.limbLength(),
      sensory: this.sensory(),
      dermatomes: this.dermatomes(),
      myotomes: this.myotomes(),
      fim: this.fim(),
      gait: this.gait(),
      balanceStatic: this.balanceStatic(),
      balanceDynamic: this.balanceDynamic(),
      handFunction: this.handFunction(),
      coordNonEquil: this.coordNonEquil(),
      coordEquil: this.coordEquil(),
      specialTests: this.specialTests(),
      investigations: this.investigations(),
      problemList: this.problemList(),
      functionalDiagnosis: this.functionalDiagnosis(),
      shortTermGoals: this.shortTermGoals(),
      longTermGoals: this.longTermGoals(),
      treatmentPlan: this.treatmentPlan(),
      homeProgramme: this.homeProgramme(),
      footer: this.footer(),
    };

    const student = this.students().find((s) => s.id === this.studentId());

    this.assessments
      .save({
        type: AssessmentType.Physiotherapy,
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
          this.savedNotice.set(asDraft ? this.t('savedDraft') : this.t('savedSubmitted'));
          setTimeout(() => this.savedNotice.set(null), 4000);
          if (!asDraft) {
            setTimeout(() => this.router.navigate(['/therapist/assessments']), 1200);
          }
        },
        error: () => {
          this.saving.set(false);
          this.savedNotice.set(this.t('saveError'));
        },
      });
  }
}
