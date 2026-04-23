import { Component, Input } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-assessment-placeholder',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="placeholder-wrapper">
      <a routerLink="/therapist/assessments" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ 'assess_back_to_hub' | translate }}
      </a>

      <div class="placeholder-card">
        <div class="placeholder-icon" [style.background]="iconBg" [style.color]="iconColor">
          <span [innerHTML]="icon"></span>
        </div>
        <h1>{{ title }}</h1>
        <p class="lead">{{ description }}</p>

        @if (sections.length) {
          <div class="sections">
            <h3>{{ 'assess_planned_sections' | translate }}</h3>
            <ul>
              @for (s of sections; track s) {
                <li>{{ s }}</li>
              }
            </ul>
          </div>
        }

        <div class="status-badge">{{ 'assess_under_construction' | translate }}</div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .placeholder-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      align-self: flex-start;
    }

    .back-link:hover { color: var(--primary); }

    .back-link svg { width: 16px; height: 16px; }

    [dir="rtl"] .back-link svg { transform: scaleX(-1); }

    .placeholder-card {
      background: var(--white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 3rem 2rem;
      text-align: center;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
    }

    .placeholder-icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .placeholder-icon svg { width: 36px; height: 36px; }

    .placeholder-card h1 {
      margin: 0 0 0.6rem;
      font-size: 1.6rem;
      color: var(--heading-color);
    }

    .lead {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 560px;
      margin: 0 auto 2rem;
      line-height: 1.65;
    }

    .sections {
      text-align: start;
      max-width: 520px;
      margin: 0 auto 1.75rem;
      background: var(--off-white);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
    }

    .sections h3 {
      margin: 0 0 0.6rem;
      font-size: 0.95rem;
      color: var(--heading-color);
    }

    .sections ul {
      margin: 0;
      padding-inline-start: 1.25rem;
      color: var(--text);
      font-size: 0.9rem;
      line-height: 1.85;
    }

    .status-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: color-mix(in srgb, #D9A05A 15%, transparent);
      color: #B07A30;
      border-radius: var(--radius-xl);
      font-size: 0.82rem;
      font-weight: 700;
    }
  `,
})
export class AssessmentPlaceholderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() sections: string[] = [];
  @Input() icon = '';
  @Input() iconBg = 'color-mix(in srgb, var(--primary) 12%, transparent)';
  @Input() iconColor = 'var(--primary)';

  constructor(public readonly route: ActivatedRoute) {}
}
