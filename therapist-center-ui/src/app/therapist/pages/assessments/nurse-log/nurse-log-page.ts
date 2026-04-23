import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AssessmentService } from '../../../services/assessment.service';
import { TherapistService } from '../../../services/therapist.service';
import {
  AssessmentStatus,
  AssessmentType,
  NurseLogEntry,
} from '../../../../core/models/assessment.model';
import { Student } from '../../../../core/models/student.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDownloadButtonComponent } from '../shared/form-download-button';

interface NurseLogRow {
  studentId: string;
  healthCondition: string;
  allergiesYesNo: 'yes' | 'no' | '';
  allergiesDetails: string;
  epilepsyYesNo: 'yes' | 'no' | '';
  epilepsyDetails: string;
  diagnosis: string;
  medication: string;
  dose: string;
  temperature: number | null;
  notes: string;
}

interface MedReminder {
  id: string;
  medication: string;
  time: string;
  frequency: string;
  note: string;
}

type L = { ar: Record<string, string>; en: Record<string, string> };

const T: L = {
  ar: {
    back: 'العودة إلى مركز التقييمات',
    title: 'السجل اليومي للممرضة',
    desc: 'سجل يومي بأسماء الأطفال وحالتهم الصحية، الحساسية، الصرع، الأدوية ودرجة الحرارة والملاحظات.',
    saveDraft: 'حفظ كمسودة',
    submit: 'حفظ السجل',
    saving: 'جارٍ الحفظ…',
    savedDraft: 'تم حفظ المسودة.',
    savedSubmitted: 'تم حفظ السجل بنجاح.',
    saveError: 'تعذّر الحفظ. حاول مرة أخرى.',
    dateLabel: 'التاريخ',
    nurseName: 'اسم الممرضة',
    downloadLabel: 'تحميل النموذج الأصلي (Word)',
    sectionLog: 'السجل اليومي',
    sectionLogHint: 'أضف صفًا لكل طفل تمت متابعته اليوم.',
    addRow: '+ إضافة سجل',
    remove: 'حذف',
    colChild: 'اسم الطفل',
    colHealth: 'الحالة الصحية',
    colAllergies: 'هل يعاني الطفل من أي أنواع الحساسية',
    colEpilepsy: 'هل يعاني الطفل من صرع',
    colDiagnosis: 'التشخيص الطبي',
    colMedication: 'العلاج (الدواء / الجرعة)',
    colTemp: 'درجة الحرارة',
    colNotes: 'ملاحظات اضافية',
    pickChild: 'اختر الطفل…',
    yes: 'نعم',
    no: 'لا',
    detailsPh: 'تفاصيل…',
    medPh: 'الدواء',
    dosePh: 'الجرعة',
    tempPh: '°م',
    notesPh: 'ملاحظات',
    emptyRows: 'لم تتم إضافة أي سجل بعد. انقر "إضافة سجل" للبدء.',
    sectionAlerts: 'تنبيهات وتذكيرات',
    sectionAlertsHint: 'سجل تذكيرات جرعات الأدوية (يُخزَّن محلياً).',
    reminderMed: 'اسم الدواء',
    reminderTime: 'الوقت',
    reminderFreq: 'التكرار',
    reminderNote: 'ملاحظة',
    addReminder: 'إضافة تنبيه',
    reminderEmpty: 'لا توجد تنبيهات مسجلة.',
    noStudents: 'لا يوجد طلاب متاحون.',
    emptyFormError: 'أضف سجلاً واحداً على الأقل قبل الحفظ.',
  },
  en: {
    back: 'Back to assessments hub',
    title: 'Nurse Daily Log',
    desc: "Daily log of children's health status, allergies, epilepsy, medications, temperature, and notes.",
    saveDraft: 'Save as draft',
    submit: 'Save log',
    saving: 'Saving…',
    savedDraft: 'Draft saved.',
    savedSubmitted: 'Log saved successfully.',
    saveError: 'Could not save. Please try again.',
    dateLabel: 'Date',
    nurseName: 'Nurse name',
    downloadLabel: 'Download original form (Word)',
    sectionLog: 'Daily log',
    sectionLogHint: 'Add a row for each child seen today.',
    addRow: '+ Add row',
    remove: 'Remove',
    colChild: "Child's name",
    colHealth: 'Health condition',
    colAllergies: 'Any allergies?',
    colEpilepsy: 'Epilepsy?',
    colDiagnosis: 'Medical diagnosis',
    colMedication: 'Medication (drug / dose)',
    colTemp: 'Temperature',
    colNotes: 'Additional notes',
    pickChild: 'Select child…',
    yes: 'Yes',
    no: 'No',
    detailsPh: 'details…',
    medPh: 'Medication',
    dosePh: 'Dose',
    tempPh: '°C',
    notesPh: 'Notes',
    emptyRows: 'No records yet. Click "Add row" to begin.',
    sectionAlerts: 'Reminders & alerts',
    sectionAlertsHint: 'Log medication dose reminders (stored locally).',
    reminderMed: 'Medication',
    reminderTime: 'Time',
    reminderFreq: 'Frequency',
    reminderNote: 'Note',
    addReminder: 'Add reminder',
    reminderEmpty: 'No reminders yet.',
    noStudents: 'No students available.',
    emptyFormError: 'Add at least one row before saving.',
  },
};

@Component({
  selector: 'app-nurse-log-page',
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/></svg>
          </div>
          <div>
            <h1>{{ t('title') }}</h1>
            <p>{{ t('desc') }}</p>
          </div>
        </div>

        <div class="header-actions">
          <app-form-download-button fileName="nurse-daily-log.docx" [label]="t('downloadLabel')" format="docx" />
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
        <div class="notice error">
          {{ errorNotice() }}
        </div>
      }

      <!-- Header: date + nurse -->
      <section class="card">
        <div class="card-body grid-2">
          <div class="form-group">
            <label for="logDate">{{ t('dateLabel') }} *</label>
            <input id="logDate" type="date" [(ngModel)]="logDate" name="logDate" />
          </div>
          <div class="form-group">
            <label for="nurseName">{{ t('nurseName') }}</label>
            <input id="nurseName" type="text" [ngModel]="nurseName()" name="nurseName" readonly />
          </div>
        </div>
      </section>

      <!-- Main table -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sectionLog') }}</h2>
          <span class="section-hint">{{ t('sectionLogHint') }}</span>
        </header>

        @if (loadingStudents()) {
          <div class="table-skeleton">
            <div class="sk-row"></div>
            <div class="sk-row"></div>
          </div>
        } @else if (students().length === 0) {
          <div class="empty-state">{{ t('noStudents') }}</div>
        } @else {
          <div class="table-wrap">
            <table class="data-table nurse-table">
              <thead>
                <tr>
                  <th>{{ t('colChild') }}</th>
                  <th>{{ t('colHealth') }}</th>
                  <th>{{ t('colAllergies') }}</th>
                  <th>{{ t('colEpilepsy') }}</th>
                  <th>{{ t('colDiagnosis') }}</th>
                  <th>{{ t('colMedication') }}</th>
                  <th class="temp-col">{{ t('colTemp') }}</th>
                  <th>{{ t('colNotes') }}</th>
                  <th class="del-col" aria-label="remove"></th>
                </tr>
              </thead>
              <tbody>
                @if (rows().length === 0) {
                  <tr><td colspan="9" class="empty-cell">{{ t('emptyRows') }}</td></tr>
                }
                @for (row of rows(); track $index; let i = $index) {
                  <tr>
                    <td>
                      <select [(ngModel)]="row.studentId" [name]="'sid-' + i">
                        <option [ngValue]="''">{{ t('pickChild') }}</option>
                        @for (s of students(); track s.id) {
                          <option [ngValue]="s.id">{{ s.fullName }}</option>
                        }
                      </select>
                    </td>
                    <td><input type="text" [(ngModel)]="row.healthCondition" [name]="'hc-' + i" /></td>
                    <td>
                      <div class="yn-stack">
                        <div class="yn-pills">
                          <label class="yn-pill" [class.active]="row.allergiesYesNo === 'yes'">
                            <input type="radio" [(ngModel)]="row.allergiesYesNo" [name]="'alg-' + i" value="yes" />{{ t('yes') }}
                          </label>
                          <label class="yn-pill" [class.active]="row.allergiesYesNo === 'no'">
                            <input type="radio" [(ngModel)]="row.allergiesYesNo" [name]="'alg-' + i" value="no" />{{ t('no') }}
                          </label>
                        </div>
                        @if (row.allergiesYesNo === 'yes') {
                          <input type="text" class="yn-details" [(ngModel)]="row.allergiesDetails" [name]="'algd-' + i" [placeholder]="t('detailsPh')" />
                        }
                      </div>
                    </td>
                    <td>
                      <div class="yn-stack">
                        <div class="yn-pills">
                          <label class="yn-pill" [class.active]="row.epilepsyYesNo === 'yes'">
                            <input type="radio" [(ngModel)]="row.epilepsyYesNo" [name]="'ep-' + i" value="yes" />{{ t('yes') }}
                          </label>
                          <label class="yn-pill" [class.active]="row.epilepsyYesNo === 'no'">
                            <input type="radio" [(ngModel)]="row.epilepsyYesNo" [name]="'ep-' + i" value="no" />{{ t('no') }}
                          </label>
                        </div>
                        @if (row.epilepsyYesNo === 'yes') {
                          <input type="text" class="yn-details" [(ngModel)]="row.epilepsyDetails" [name]="'epd-' + i" [placeholder]="t('detailsPh')" />
                        }
                      </div>
                    </td>
                    <td><input type="text" [(ngModel)]="row.diagnosis" [name]="'dx-' + i" /></td>
                    <td>
                      <div class="med-cell">
                        <input type="text" [(ngModel)]="row.medication" [name]="'med-' + i" [placeholder]="t('medPh')" />
                        <input type="text" [(ngModel)]="row.dose" [name]="'dose-' + i" [placeholder]="t('dosePh')" />
                      </div>
                    </td>
                    <td class="temp-col">
                      <input type="number" step="0.1" min="35" max="42" [(ngModel)]="row.temperature" [name]="'temp-' + i" [placeholder]="t('tempPh')" />
                    </td>
                    <td><input type="text" [(ngModel)]="row.notes" [name]="'note-' + i" [placeholder]="t('notesPh')" /></td>
                    <td class="del-col">
                      <button type="button" class="del-btn" (click)="removeRow(i)" [attr.aria-label]="t('remove')">×</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <button type="button" class="btn btn-ghost" (click)="addRow()">{{ t('addRow') }}</button>
          </div>
        }
      </section>

      <!-- Reminders -->
      <section class="card">
        <header class="section-head">
          <h2>{{ t('sectionAlerts') }}</h2>
          <span class="section-hint">{{ t('sectionAlertsHint') }}</span>
        </header>
        <div class="card-body">
          <div class="reminder-form">
            <input type="text" [(ngModel)]="newMed" name="newMed" [placeholder]="t('reminderMed')" />
            <input type="time" [(ngModel)]="newTime" name="newTime" />
            <input type="text" [(ngModel)]="newFreq" name="newFreq" [placeholder]="t('reminderFreq')" />
            <input type="text" [(ngModel)]="newNote" name="newNote" [placeholder]="t('reminderNote')" />
            <button type="button" class="btn btn-primary btn-sm" (click)="addReminder()">{{ t('addReminder') }}</button>
          </div>

          @if (reminders().length === 0) {
            <div class="empty-state small">{{ t('reminderEmpty') }}</div>
          } @else {
            <ul class="reminder-list">
              @for (r of reminders(); track r.id) {
                <li>
                  <div class="r-main">
                    <strong>{{ r.medication || '—' }}</strong>
                    <span class="r-time">{{ r.time }}</span>
                    @if (r.frequency) { <span class="r-freq">{{ r.frequency }}</span> }
                  </div>
                  @if (r.note) { <div class="r-note">{{ r.note }}</div> }
                  <button type="button" class="del-btn" (click)="removeReminder(r.id)">×</button>
                </li>
              }
            </ul>
          }
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
    :host { display: block; --accent: #36807E; }

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

    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .data-table th {
      background: var(--off-white);
      padding: 0.7rem 0.6rem;
      text-align: start;
      font-weight: 700; color: var(--heading-color);
      border-bottom: 1.5px solid var(--border-light);
      font-size: 0.78rem;
      white-space: nowrap;
    }
    .data-table td {
      padding: 0.45rem 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-light) 70%, transparent);
      vertical-align: top;
    }
    .data-table input[type="text"],
    .data-table input[type="number"],
    .data-table select {
      width: 100%;
      padding: 0.4rem 0.55rem;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.84rem;
      background: var(--white); color: var(--text);
      font-family: inherit;
    }

    .nurse-table .temp-col { width: 90px; }
    .nurse-table .del-col { width: 38px; text-align: center; }

    .empty-cell { text-align: center; color: var(--text-muted); padding: 1.5rem !important; }
    .empty-state { padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; }
    .empty-state.small { padding: 0.75rem; }

    .table-skeleton { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .sk-row {
      height: 38px; border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%; animation: skeleton 1.4s infinite;
    }
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .yn-stack { display: flex; flex-direction: column; gap: 0.3rem; }
    .yn-pills { display: flex; gap: 0.25rem; }
    .yn-pill {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.25rem 0.6rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-xl);
      cursor: pointer; font-size: 0.78rem; font-weight: 600;
      color: var(--text-muted); background: var(--white);
      transition: var(--transition);
    }
    .yn-pill input { display: none; }
    .yn-pill:hover { border-color: var(--accent); }
    .yn-pill.active { background: var(--accent); color: var(--white); border-color: var(--accent); }
    .yn-details { font-size: 0.8rem !important; }

    .med-cell { display: flex; flex-direction: column; gap: 0.3rem; min-width: 140px; }

    .del-btn {
      width: 28px; height: 28px; border: none;
      border-radius: 50%;
      background: color-mix(in srgb, #D95A5A 12%, transparent);
      color: #D95A5A; font-size: 1.1rem; font-weight: 700;
      cursor: pointer; line-height: 1;
    }
    .del-btn:hover { background: #D95A5A; color: var(--white); }

    .table-footer {
      padding: 0.85rem 1.5rem;
      background: var(--off-white);
      border-top: 1px solid var(--border-light);
      display: flex; justify-content: flex-start;
    }

    .reminder-form {
      display: grid;
      grid-template-columns: 1.1fr 0.7fr 0.8fr 1.4fr auto;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .reminder-form input {
      padding: 0.5rem 0.7rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 0.85rem; background: var(--white);
      font-family: inherit;
    }
    .reminder-form input:focus { outline: none; border-color: var(--accent); }

    .reminder-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .reminder-list li {
      display: grid;
      grid-template-columns: 1fr auto;
      column-gap: 0.75rem;
      align-items: center;
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--accent) 3%, transparent);
    }
    .r-main { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; font-size: 0.88rem; }
    .r-time {
      font-family: monospace; font-size: 0.85rem;
      background: var(--white); border: 1px solid var(--border-light);
      padding: 0.15rem 0.5rem; border-radius: var(--radius-sm);
    }
    .r-freq { font-size: 0.8rem; color: var(--text-muted); }
    .r-note { font-size: 0.82rem; color: var(--text-muted); grid-column: 1 / 2; margin-top: 0.15rem; }

    .footer-actions {
      display: flex; gap: 0.6rem; justify-content: flex-end;
      padding: 1rem 0;
    }

    @media (max-width: 900px) {
      .reminder-form { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .assess-header { flex-direction: column; align-items: stretch; }
      .header-actions { justify-content: stretch; flex-wrap: wrap; }
      .reminder-form { grid-template-columns: 1fr; }
    }
  `,
})
export class NurseLogPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly ts = inject(TranslationService);

  // State
  logDate = signal<string>(new Date().toISOString().slice(0, 10));
  nurseName = signal<string>('');
  rows = signal<NurseLogRow[]>([]);
  reminders = signal<MedReminder[]>([]);

  // Reminder form fields
  newMed = signal<string>('');
  newTime = signal<string>('');
  newFreq = signal<string>('');
  newNote = signal<string>('');

  students = signal<Student[]>([]);
  loadingStudents = signal(true);
  saving = signal(false);
  savedNotice = signal<string | null>(null);
  errorNotice = signal<string | null>(null);

  canSubmit = computed(
    () =>
      this.logDate() !== '' &&
      this.rows().length > 0 &&
      this.rows().some((r) => r.studentId !== ''),
  );

  t(key: keyof typeof T.ar): string {
    const lang = this.ts.currentLang();
    return T[lang]?.[key] ?? T.ar[key] ?? key;
  }

  ngOnInit(): void {
    this.nurseName.set(this.auth.getUserName() ?? '');

    this.therapist.getMyStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        this.loadingStudents.set(false);
        // Seed with one row if none
        if (this.rows().length === 0) this.addRow();

        const queryStudent = this.route.snapshot.queryParamMap.get('studentId');
        if (queryStudent && list.some((s) => s.id === queryStudent)) {
          this.rows.update((arr) => {
            if (arr.length > 0) arr[0] = { ...arr[0], studentId: queryStudent };
            return [...arr];
          });
        }
      },
      error: () => {
        this.loadingStudents.set(false);
        if (this.rows().length === 0) this.addRow();
      },
    });
  }

  addRow(): void {
    const row: NurseLogRow = {
      studentId: '',
      healthCondition: '',
      allergiesYesNo: '',
      allergiesDetails: '',
      epilepsyYesNo: '',
      epilepsyDetails: '',
      diagnosis: '',
      medication: '',
      dose: '',
      temperature: null,
      notes: '',
    };
    this.rows.update((arr) => [...arr, row]);
  }

  removeRow(i: number): void {
    this.rows.update((arr) => arr.filter((_, idx) => idx !== i));
  }

  addReminder(): void {
    const med = this.newMed().trim();
    const time = this.newTime().trim();
    if (!med && !time) return;
    const reminder: MedReminder = {
      id: crypto.randomUUID(),
      medication: med,
      time,
      frequency: this.newFreq().trim(),
      note: this.newNote().trim(),
    };
    this.reminders.update((arr) => [...arr, reminder]);
    this.newMed.set('');
    this.newTime.set('');
    this.newFreq.set('');
    this.newNote.set('');
  }

  removeReminder(id: string): void {
    this.reminders.update((arr) => arr.filter((r) => r.id !== id));
  }

  private formatYesNo(yn: 'yes' | 'no' | '', details: string): string {
    if (yn === '') return '';
    const label = yn === 'yes' ? this.t('yes') : this.t('no');
    if (yn === 'yes' && details.trim()) return `${label} — ${details.trim()}`;
    return label;
  }

  save(asDraft: boolean): void {
    this.errorNotice.set(null);
    const validRows = this.rows().filter((r) => r.studentId !== '');
    if (validRows.length === 0) {
      this.errorNotice.set(this.t('emptyFormError'));
      return;
    }
    this.saving.set(true);

    const evaluatorId = this.auth.getUserId() ?? '';
    const evaluatorName = this.auth.getUserName() ?? '';
    const status = asDraft ? AssessmentStatus.Draft : AssessmentStatus.Submitted;

    const saves = validRows.map((row) => {
      const student = this.students().find((s) => s.id === row.studentId);
      const payload: NurseLogEntry = {
        date: this.logDate(),
        studentId: row.studentId,
        studentName: student?.fullName,
        healthCondition: row.healthCondition || undefined,
        allergies: this.formatYesNo(row.allergiesYesNo, row.allergiesDetails) || undefined,
        epilepsy: this.formatYesNo(row.epilepsyYesNo, row.epilepsyDetails) || undefined,
        diagnosis: row.diagnosis || undefined,
        medication: row.medication || undefined,
        dose: row.dose || undefined,
        temperature: row.temperature ?? undefined,
        notes: row.notes || undefined,
      };
      return this.assessments.save({
        type: AssessmentType.NurseDaily,
        studentId: row.studentId,
        studentName: student?.fullName,
        evaluatorId,
        evaluatorName,
        date: this.logDate(),
        status,
        payload,
      });
    });

    forkJoin(saves.length ? saves : [of(null)]).subscribe({
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
