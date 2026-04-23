import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'fac_badge' | translate }}</span>
        <h1>{{ 'fac_hero_title' | translate }}</h1>
        <p>{{ 'fac_hero_desc' | translate }}</p>
      </div>
    </section>

    <section class="facilities-section">
      <div class="container">
        <div class="facilities-grid">
          @for (facility of facilities(); track facility.title; let i = $index) {
            <div class="facility-card" #animateEl [style.transition-delay]="(i * 100) + 'ms'">
              <div class="facility-icon-wrapper" [innerHTML]="facility.icon"></div>
              <div class="facility-content">
                <h3>{{ facility.title }}</h3>
                <p>{{ facility.desc }}</p>
              </div>
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
    }

    .facilities-section {
      padding: 4rem 0 5rem;
    }

    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .facility-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2rem 1.75rem;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      border: 1px solid var(--border-light);
      opacity: 0;
      transform: translateY(25px);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .facility-card.visible {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    }

    .facility-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }

    .facility-card.visible:hover {
      transform: translateY(-6px);
    }

    .facility-icon-wrapper {
      width: 60px;
      height: 60px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .facility-icon-wrapper ::ng-deep svg {
      width: 30px;
      height: 30px;
    }

    .facility-content {
      padding: 0;
    }

    .facility-content h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .facility-content p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.8;
    }

    @media (max-width: 1024px) {
      .facilities-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .facilities-grid {
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
export class FacilitiesComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);
  private readonly sanitizer = inject(DomSanitizer);
  private safe = (html: string): SafeHtml => this.sanitizer.bypassSecurityTrustHtml(html);

  facilities = computed(() => [
    {
      title: this.ts.t('fac1_title'),
      desc: this.ts.t('fac1_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>')
    },
    {
      title: this.ts.t('fac2_title'),
      desc: this.ts.t('fac2_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1.003 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.25.4-1.51 1z"/></svg>')
    },
    {
      title: this.ts.t('fac3_title'),
      desc: this.ts.t('fac3_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>')
    },
    {
      title: this.ts.t('fac4_title'),
      desc: this.ts.t('fac4_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>')
    },
    {
      title: this.ts.t('fac5_title'),
      desc: this.ts.t('fac5_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>')
    },
    {
      title: this.ts.t('fac6_title'),
      desc: this.ts.t('fac6_desc'),
      icon: this.safe('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>')
    },
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
