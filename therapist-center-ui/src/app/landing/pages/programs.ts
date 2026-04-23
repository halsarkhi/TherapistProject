import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'programs_badge' | translate }}</span>
        <h1>{{ 'programs_page_title' | translate }}</h1>
        <p>{{ 'programs_hero_desc' | translate }}</p>
      </div>
    </section>

    <section class="programs-section">
      <div class="container">
        <div class="programs-grid">
          @for (program of programs(); track program.title; let i = $index) {
            <div class="program-card" #animateEl [style.transition-delay]="(i * 100) + 'ms'">
              <div class="program-icon" [innerHTML]="program.icon"></div>
              <h3>{{ program.title }}</h3>
              <p>{{ program.desc }}</p>
              <ul>
                @for (item of program.features; track item) {
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ item }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .page-hero {
      background: linear-gradient(135deg, var(--off-white) 0%, var(--light-green) 100%);
      padding: 4rem 0 3.5rem;
      text-align: center;
    }

    .page-badge {
      display: inline-block;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
      padding: 0.35rem 1.1rem;
      border-radius: var(--radius-xl);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .page-hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 0.75rem;
    }

    .page-hero > .container > p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.8;
    }

    .programs-section {
      padding: 4rem 0 5rem;
    }

    .programs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .program-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      opacity: 0;
      transform: translateY(25px);
      border: 1px solid var(--border-light);
    }

    .program-card.visible {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    }

    .program-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }

    .program-card.visible:hover {
      transform: translateY(-6px);
    }

    .program-icon {
      width: 56px;
      height: 56px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .program-icon :first-child {
      width: 28px;
      height: 28px;
      color: var(--primary);
    }

    .program-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .program-card > p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .program-card ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .program-card li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .program-card li svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--primary);
    }

    @media (max-width: 1024px) {
      .programs-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .programs-grid {
        grid-template-columns: 1fr;
      }
      .page-hero h1 {
        font-size: 1.8rem;
      }
      .container {
        padding: 0 1.25rem;
      }
    }
  `
})
export class ProgramsComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);

  programs = computed(() => [
    {
      title: this.ts.t('prog1_title'),
      desc: this.ts.t('prog1_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      features: [this.ts.t('prog1_feat1'), this.ts.t('prog1_feat2'), this.ts.t('prog1_feat3')]
    },
    {
      title: this.ts.t('prog2_title'),
      desc: this.ts.t('prog2_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      features: [this.ts.t('prog2_feat1'), this.ts.t('prog2_feat2'), this.ts.t('prog2_feat3')]
    },
    {
      title: this.ts.t('prog3_title'),
      desc: this.ts.t('prog3_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      features: [this.ts.t('prog3_feat1'), this.ts.t('prog3_feat2'), this.ts.t('prog3_feat3')]
    },
    {
      title: this.ts.t('prog4_title'),
      desc: this.ts.t('prog4_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      features: [this.ts.t('prog4_feat1'), this.ts.t('prog4_feat2'), this.ts.t('prog4_feat3')]
    },
    {
      title: this.ts.t('prog5_title'),
      desc: this.ts.t('prog5_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      features: [this.ts.t('prog5_feat1'), this.ts.t('prog5_feat2'), this.ts.t('prog5_feat3')]
    },
    {
      title: this.ts.t('prog6_title'),
      desc: this.ts.t('prog6_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      features: [this.ts.t('prog6_feat1'), this.ts.t('prog6_feat2'), this.ts.t('prog6_feat3')]
    }
  ]);

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    this.animateElements.forEach(el => observer.observe(el.nativeElement));
  }
}
