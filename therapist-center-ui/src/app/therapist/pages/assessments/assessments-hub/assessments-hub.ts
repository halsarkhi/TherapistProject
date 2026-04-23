import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TherapistService } from '../../../services/therapist.service';
import { AssessmentService } from '../../../services/assessment.service';
import { Student } from '../../../../core/models/student.model';
import { AssessmentType } from '../../../../core/models/assessment.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';

interface AssessmentDownload {
  fileName: string;
  format: 'pdf' | 'docx' | 'xlsx';
}

interface AssessmentTypeCard {
  type: AssessmentType;
  route: string;
  titleKey: string;
  descKey: string;
  color: string;
  icon: string;
  downloads?: AssessmentDownload[];
}

@Component({
  selector: 'app-assessments-hub',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="hub-wrapper">
      <header class="hub-header">
        <div>
          <h1>{{ 'assess_hub_title' | translate }}</h1>
          <p>{{ 'assess_hub_subtitle' | translate }}</p>
        </div>
        <div class="student-picker">
          <label for="student">{{ 'assess_pick_student' | translate }}</label>
          @if (loading()) {
            <div class="input-skeleton"></div>
          } @else {
            <select id="student" [(ngModel)]="selectedStudentId">
              <option value="">{{ 'assess_all_students' | translate }}</option>
              @for (s of students(); track s.id) {
                <option [value]="s.id">{{ s.fullName }}</option>
              }
            </select>
          }
        </div>
      </header>

      <section class="cards-grid">
        @for (card of typeCards; track card.type) {
          <div class="type-card" [style.--card-color]="card.color">
            <a
              class="card-link"
              [routerLink]="['/therapist/assessments', card.route]"
              [queryParams]="selectedStudentId ? { studentId: selectedStudentId } : null"
            >
              <div class="card-icon" [innerHTML]="card.icon"></div>
              <h3>{{ card.titleKey | translate }}</h3>
              <p>{{ card.descKey | translate }}</p>
              <span class="card-arrow">→</span>
            </a>
            @if (card.downloads?.length) {
              <div class="card-downloads">
                <span class="downloads-label">{{ 'assess_hub_download_source' | translate }}:</span>
                @for (dl of card.downloads; track dl.fileName) {
                  <a
                    class="download-pill"
                    [href]="'assets/forms/' + dl.fileName"
                    [download]="dl.fileName"
                    target="_blank"
                    rel="noopener"
                    [title]="('assess_hub_download_title' | translate) + ' (' + dl.format.toUpperCase() + ')'"
                    (click)="$event.stopPropagation()"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span class="dl-format">{{ dl.format.toUpperCase() }}</span>
                  </a>
                }
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    :host { display: block; }

    .hub-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .hub-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .hub-header h1 {
      font-size: 1.7rem;
      color: var(--heading-color);
      margin: 0 0 0.4rem;
    }

    .hub-header p {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.95rem;
    }

    .student-picker {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 260px;
    }

    .student-picker label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text);
    }

    .student-picker select {
      padding: 0.6rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-light);
      background: var(--white);
      font-size: 0.92rem;
      color: var(--text);
    }

    .input-skeleton {
      height: 38px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--off-white) 25%, var(--border-light) 50%, var(--off-white) 75%);
      background-size: 200% 100%;
      animation: skeleton 1.4s infinite;
    }

    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .type-card {
      position: relative;
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      transition: var(--transition);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .type-card::before {
      content: '';
      position: absolute;
      top: 0;
      inset-inline-start: 0;
      width: 4px;
      height: 100%;
      background: var(--card-color, var(--primary));
      transition: width 0.3s ease;
      pointer-events: none;
      z-index: 1;
    }

    .type-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(45, 62, 40, 0.1);
      border-color: var(--card-color, var(--primary));
    }

    .type-card:hover::before {
      width: 6px;
    }

    .card-link {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 1.5rem 1.25rem 1.25rem;
      text-decoration: none;
      color: inherit;
      flex: 1;
    }

    .card-downloads {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1.25rem;
      border-top: 1px dashed var(--border-light);
      background: color-mix(in srgb, var(--card-color, var(--primary)) 4%, transparent);
      flex-wrap: wrap;
    }

    .downloads-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .download-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-xl);
      background: var(--white);
      border: 1px solid var(--border-light);
      color: var(--card-color, var(--primary));
      font-size: 0.72rem;
      font-weight: 700;
      text-decoration: none;
      transition: var(--transition);
    }

    .download-pill:hover {
      border-color: var(--card-color, var(--primary));
      background: color-mix(in srgb, var(--card-color, var(--primary)) 10%, var(--white));
      transform: translateY(-1px);
    }

    .download-pill svg {
      width: 12px;
      height: 12px;
    }

    .dl-format {
      font-size: 0.68rem;
      letter-spacing: 0.02em;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--card-color, var(--primary)) 12%, transparent);
      color: var(--card-color, var(--primary));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon svg {
      width: 24px;
      height: 24px;
    }

    .type-card h3 {
      margin: 0;
      font-size: 1.05rem;
      color: var(--heading-color);
    }

    .type-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.5;
      min-height: 2.5rem;
    }

    .card-arrow {
      align-self: flex-end;
      font-size: 1.4rem;
      color: var(--card-color, var(--primary));
      font-weight: 700;
      transition: transform 0.25s ease;
    }

    [dir="rtl"] .card-arrow {
      transform: scaleX(-1);
    }

    .type-card:hover .card-arrow {
      transform: translateX(4px);
    }

    [dir="rtl"] .type-card:hover .card-arrow {
      transform: scaleX(-1) translateX(4px);
    }

    @media (max-width: 768px) {
      .hub-header { flex-direction: column; align-items: stretch; }
      .student-picker { min-width: 0; }
    }
  `,
})
export class AssessmentsHubPage implements OnInit {
  private readonly therapist = inject(TherapistService);
  private readonly assessments = inject(AssessmentService);
  protected readonly ts = inject(TranslationService);

  loading = signal(true);
  students = signal<Student[]>([]);
  selectedStudentId = '';

  typeCards: AssessmentTypeCard[] = [
    {
      type: AssessmentType.Speech,
      route: 'speech',
      titleKey: 'assess_type_speech',
      descKey: 'assess_type_speech_desc',
      color: '#7C9885',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>',
      downloads: [
        { fileName: 'speech-articulation-evaluation.pdf', format: 'pdf' },
        { fileName: 'speech-articulation-evaluation.xlsx', format: 'xlsx' },
      ],
    },
    {
      type: AssessmentType.Physiotherapy,
      route: 'physiotherapy',
      titleKey: 'assess_type_physio',
      descKey: 'assess_type_physio_desc',
      color: '#5A8FD9',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v4M12 11l-4 5M12 11l4 5M9 21l3-5 3 5"/></svg>',
      downloads: [{ fileName: 'physiotherapy-evaluation.pdf', format: 'pdf' }],
    },
    {
      type: AssessmentType.Occupational,
      route: 'occupational',
      titleKey: 'assess_type_ot',
      descKey: 'assess_type_ot_desc',
      color: '#D9A05A',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="13" rx="2"/></svg>',
      downloads: [{ fileName: 'occupational-therapy-evaluation.pdf', format: 'pdf' }],
    },
    {
      type: AssessmentType.Psychological,
      route: 'psychological',
      titleKey: 'assess_type_psych',
      descKey: 'assess_type_psych_desc',
      color: '#9B6BD9',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A4.5 4.5 0 0 1 14 6.5V8a2 2 0 1 1 0 4v.5a4.5 4.5 0 0 1-9 0V12a2 2 0 1 1 0-4V6.5A4.5 4.5 0 0 1 9.5 2z"/></svg>',
    },
    {
      type: AssessmentType.Social,
      route: 'social',
      titleKey: 'assess_type_social',
      descKey: 'assess_type_social_desc',
      color: '#D95A7C',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      type: AssessmentType.NurseDaily,
      route: 'nurse-log',
      titleKey: 'assess_type_nurse',
      descKey: 'assess_type_nurse_desc',
      color: '#5AB8B5',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/></svg>',
      downloads: [{ fileName: 'nurse-daily-log.docx', format: 'docx' }],
    },
    {
      type: AssessmentType.Monthly,
      route: 'monthly',
      titleKey: 'assess_type_monthly',
      descKey: 'assess_type_monthly_desc',
      color: '#5C6F58',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      downloads: [{ fileName: 'monthly-unified-report.docx', format: 'docx' }],
    },
  ];

  ngOnInit(): void {
    this.therapist.getMyStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.students.set([]);
        this.loading.set(false);
      },
    });
  }
}
