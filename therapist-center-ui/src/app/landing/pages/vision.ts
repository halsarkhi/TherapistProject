import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-vision',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <!-- Page Hero -->
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'vision_badge' | translate }}</span>
        <h1>{{ 'vision_title' | translate }}</h1>
        <p>{{ 'vision_hero_desc' | translate }}</p>
      </div>
    </section>

    <!-- Vision & Mission -->
    <section class="vm-section">
      <div class="container">
        <div class="vm-grid">
          <div class="vm-card vision" #animateEl>
            <div class="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h2>{{ 'our_vision' | translate }}</h2>
            <p>{{ 'vision_text' | translate }}</p>
          </div>
          <div class="vm-card mission" #animateEl>
            <div class="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>{{ 'our_mission' | translate }}</h2>
            <p>{{ 'mission_text' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values -->
    <section class="values-section">
      <div class="container">
        <div class="section-header" #animateEl>
          <span class="section-badge">{{ 'values_badge' | translate }}</span>
          <h2>{{ 'values_title' | translate }}</h2>
          <p>{{ 'values_desc' | translate }}</p>
        </div>
        <div class="values-grid">
          @for (value of values(); track value.title; let i = $index) {
            <div class="value-card" #animateEl [style.transition-delay]="(i * 100) + 'ms'">
              <div class="value-number">{{ i + 1 }}</div>
              <div class="value-icon" [innerHTML]="value.icon"></div>
              <h3>{{ value.title }}</h3>
              <p>{{ value.desc }}</p>
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

    .vm-section {
      padding: 4rem 0;
      background: var(--white);
    }

    .vm-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .vm-card {
      padding: 2.5rem;
      border-radius: var(--radius-lg);
      opacity: 0;
      transform: translateY(25px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .vm-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .vm-card.vision {
      background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent) 0%, color-mix(in srgb, var(--primary) 3%, transparent) 100%);
      border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
    }

    .vm-card.mission {
      background: linear-gradient(135deg, rgba(45, 62, 40, 0.06) 0%, rgba(45, 62, 40, 0.02) 100%);
      border: 1px solid rgba(45, 62, 40, 0.12);
    }

    .vm-icon {
      width: 56px;
      height: 56px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .vm-icon svg {
      width: 26px;
      height: 26px;
      color: var(--white);
    }

    .vm-card h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 1rem;
    }

    .vm-card p {
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 2;
    }

    .section-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 3rem;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .section-header.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .section-badge {
      display: inline-block;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      color: var(--primary);
      padding: 0.35rem 1.1rem;
      border-radius: var(--radius-xl);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .values-section {
      padding: 5rem 0;
      background: var(--off-white);
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .value-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      text-align: center;
      position: relative;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      opacity: 0;
      transform: translateY(25px);
    }

    .value-card.visible {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    }

    .value-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .value-card.visible:hover {
      transform: translateY(-4px);
    }

    .value-number {
      position: absolute;
      top: 12px;
      left: 16px;
      font-size: 2.5rem;
      font-weight: 800;
      color: color-mix(in srgb, var(--primary) 8%, transparent);
      line-height: 1;
    }

    .value-icon {
      width: 52px;
      height: 52px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .value-icon :first-child {
      width: 24px;
      height: 24px;
      color: var(--primary);
    }

    .value-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .value-card p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.8;
    }

    @media (max-width: 768px) {
      .vm-grid {
        grid-template-columns: 1fr;
      }
      .values-grid {
        grid-template-columns: 1fr;
      }
      .page-hero h1 {
        font-size: 1.8rem;
      }
      .vm-card {
        padding: 1.75rem;
      }
      .container {
        padding: 0 1.25rem;
      }
    }
  `
})
export class VisionComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);

  values = computed(() => [
    {
      title: this.ts.t('value1_title'),
      desc: this.ts.t('value1_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    },
    {
      title: this.ts.t('value2_title'),
      desc: this.ts.t('value2_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    },
    {
      title: this.ts.t('value3_title'),
      desc: this.ts.t('value3_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },
    {
      title: this.ts.t('value4_title'),
      desc: this.ts.t('value4_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    },
    {
      title: this.ts.t('value5_title'),
      desc: this.ts.t('value5_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    },
    {
      title: this.ts.t('value6_title'),
      desc: this.ts.t('value6_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    },
  ]);

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    this.animateElements.forEach(el => observer.observe(el.nativeElement));
  }
}
