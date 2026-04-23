import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg-pattern"></div>
      <div class="container">
        <div class="hero-content" #animateEl>
          <span class="hero-badge">{{ 'app_name' | translate }} {{ 'app_subtitle' | translate }}</span>
          <h1>{{ 'hero_title' | translate }}</h1>
          <p class="hero-subtitle">
            {{ 'hero_full_subtitle' | translate }}
          </p>
          <div class="hero-actions">
            <a routerLink="/programs" class="btn btn-primary">{{ 'learn_more' | translate }}</a>
            <a routerLink="/contact" class="btn btn-outline">{{ 'contact_us_btn' | translate }}</a>
          </div>
        </div>
        <div class="hero-visual" #animateEl>
          <div class="hero-card">
            <div class="hero-illustration">
              <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="40" width="280" height="200" rx="20" fill="var(--light-green)"/>
                <circle cx="160" cy="120" r="45" fill="var(--primary)" opacity="0.2"/>
                <path d="M160 80C160 80 145 105 145 120C145 130 150 140 160 145C170 140 175 130 175 120C175 105 160 80 160 80Z" fill="var(--primary)"/>
                <path d="M140 100C140 100 148 105 152 115" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
                <path d="M180 100C180 100 172 105 168 115" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round"/>
                <circle cx="100" cy="180" r="20" fill="var(--primary)" opacity="0.15"/>
                <circle cx="220" cy="180" r="20" fill="var(--primary)" opacity="0.15"/>
                <circle cx="160" cy="200" r="15" fill="var(--primary)" opacity="0.1"/>
                <!-- People silhouettes -->
                <circle cx="100" cy="170" r="8" fill="var(--primary)" opacity="0.4"/>
                <rect x="93" y="180" width="14" height="18" rx="5" fill="var(--primary)" opacity="0.4"/>
                <circle cx="220" cy="170" r="8" fill="var(--primary)" opacity="0.4"/>
                <rect x="213" y="180" width="14" height="18" rx="5" fill="var(--primary)" opacity="0.4"/>
                <circle cx="160" cy="190" r="8" fill="var(--primary)" opacity="0.3"/>
                <rect x="153" y="200" width="14" height="18" rx="5" fill="var(--primary)" opacity="0.3"/>
                <!-- Hearts -->
                <path d="M130 65C130 60 135 55 140 60C145 55 150 60 150 65C150 73 140 80 140 80C140 80 130 73 130 65Z" fill="var(--primary-light)" opacity="0.5"/>
                <path d="M170 55C170 50 175 45 180 50C185 45 190 50 190 55C190 63 180 70 180 70C180 70 170 63 170 55Z" fill="var(--primary-light)" opacity="0.4"/>
              </svg>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-number">6+</span>
                <span class="stat-label">{{ 'specialized_programs' | translate }}</span>
              </div>
              <div class="stat">
                <span class="stat-number">10+</span>
                <span class="stat-label">{{ 'certified_specialists' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs Section -->
    <section class="programs-section">
      <div class="container">
        <div class="section-header" #animateEl>
          <span class="section-badge">{{ 'our_services' | translate }}</span>
          <h2>{{ 'programs_title' | translate }}</h2>
          <p>{{ 'programs_desc' | translate }}</p>
        </div>
        <div class="programs-grid">
          @for (program of programs(); track program.titleKey; let i = $index) {
            <div class="program-item" #animateEl [style.transition-delay]="(i * 100) + 'ms'">
              <div class="check-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <h3>{{ program.title }}</h3>
                <p>{{ program.subtitle }}</p>
              </div>
            </div>
          }
        </div>
        <div class="programs-cta" #animateEl>
          <a routerLink="/programs" class="btn btn-primary">{{ 'discover_all_programs' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="why-section">
      <div class="container">
        <div class="section-header" #animateEl>
          <span class="section-badge">{{ 'why_us' | translate }}</span>
          <h2>{{ 'why_choose_us' | translate }}</h2>
          <p>{{ 'why_choose_desc' | translate }}</p>
        </div>
        <div class="why-grid">
          @for (card of whyCards(); track card.titleKey; let i = $index) {
            <div class="why-card" #animateEl [style.transition-delay]="(i * 120) + 'ms'">
              <div class="why-icon" [innerHTML]="card.icon"></div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section" #animateEl>
      <div class="container">
        <div class="cta-content">
          <h2>{{ 'cta_title' | translate }}</h2>
          <p>{{ 'cta_desc' | translate }}</p>
          <div class="cta-actions">
            <a routerLink="/admissions" class="btn btn-white">{{ 'admission_requirements' | translate }}</a>
            <a routerLink="/contact" class="btn btn-outline-white">{{ 'nav_contact' | translate }}</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Hero */
    .hero {
      position: relative;
      padding: 5rem 0 4rem;
      overflow: hidden;
      background: linear-gradient(135deg, var(--off-white) 0%, var(--light-green) 100%);
      transition: background-color 0.3s ease;
    }

    .hero-bg-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 80%, color-mix(in srgb, var(--primary) 6%, transparent) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 50%);
    }

    .hero .container {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .hero-badge {
      display: inline-block;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
      padding: 0.4rem 1.2rem;
      border-radius: var(--radius-xl);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }

    .hero h1 {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--heading-color);
      line-height: 1.3;
      margin-bottom: 1.25rem;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.9;
      margin-bottom: 2rem;
      max-width: 540px;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero-visual {
      display: flex;
      justify-content: center;
    }

    .hero-card {
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 2rem;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 420px;
    }

    .hero-illustration {
      margin-bottom: 1.5rem;
    }

    .hero-illustration svg {
      width: 100%;
      height: auto;
    }

    .hero-stats {
      display: flex;
      gap: 2rem;
      justify-content: center;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary);
    }

    .stat-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 2rem;
      border-radius: var(--radius-xl);
      font-size: 0.95rem;
      font-weight: 700;
      transition: var(--transition);
      text-decoration: none;
      gap: 0.5rem;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--primary);
      color: var(--white);
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-outline {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: var(--white);
      transform: translateY(-2px);
    }

    .btn-white {
      background: var(--white);
      color: var(--heading-color);
    }

    .btn-white:hover {
      background: var(--off-white);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-outline-white {
      background: transparent;
      color: var(--white);
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .btn-outline-white:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--white);
      transform: translateY(-2px);
    }

    /* Section Header */
    .section-header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3rem;
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
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 0.75rem;
    }

    .section-header p {
      font-size: 1rem;
      color: var(--text-muted);
      line-height: 1.8;
    }

    /* Programs Section */
    .programs-section {
      padding: 5rem 0;
      background: var(--white);
    }

    .programs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .program-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--off-white);
      border-radius: var(--radius-md);
      transition: var(--transition);
      opacity: 0;
      transform: translateY(20px);
    }

    .program-item.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .program-item:hover {
      background: var(--light-green);
      transform: translateX(-4px);
      box-shadow: var(--shadow-sm);
    }

    .program-item.visible:hover {
      transform: translateX(-4px);
    }

    .check-icon {
      width: 32px;
      height: 32px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .check-icon svg {
      width: 16px;
      height: 16px;
      color: var(--white);
    }

    .program-item h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.2rem;
    }

    .program-item p {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .programs-cta {
      text-align: center;
      margin-top: 2.5rem;
      opacity: 0;
      transform: translateY(20px);
    }

    .programs-cta.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Why Section */
    .why-section {
      padding: 5rem 0;
      background: var(--off-white);
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .why-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      text-align: center;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      opacity: 0;
      transform: translateY(25px);
    }

    .why-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .why-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }

    .why-card.visible:hover {
      transform: translateY(-6px);
    }

    .why-icon {
      width: 60px;
      height: 60px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    .why-icon :first-child {
      width: 28px;
      height: 28px;
      color: var(--primary);
    }

    .why-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .why-card p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.7;
    }

    /* CTA */
    .cta-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      opacity: 0;
      transform: translateY(20px);
    }

    .cta-section.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .cta-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--white);
      margin-bottom: 0.75rem;
    }

    .cta-content p {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
      line-height: 1.8;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .why-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .hero .container {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .hero-subtitle {
        margin: 0 auto 2rem;
      }

      .hero-actions {
        justify-content: center;
      }

      .hero-card {
        max-width: 360px;
      }

      .programs-grid {
        grid-template-columns: 1fr;
      }

      .section-header h2 {
        font-size: 1.7rem;
      }

      .hero {
        padding: 3rem 0;
      }

      .programs-section,
      .why-section {
        padding: 3.5rem 0;
      }

      .container {
        padding: 0 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .hero h1 {
        font-size: 1.65rem;
      }

      .why-grid {
        grid-template-columns: 1fr;
      }

      .btn {
        padding: 0.65rem 1.5rem;
        font-size: 0.9rem;
      }

      .cta-content h2 {
        font-size: 1.5rem;
      }
    }
  `
})
export class HomeComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);

  programs = computed(() => [
    { titleKey: 'speech_therapy_short', title: this.ts.t('speech_therapy_short'), subtitle: this.ts.t('speech_therapy_sub') },
    { titleKey: 'physical_therapy_short', title: this.ts.t('physical_therapy_short'), subtitle: this.ts.t('physical_therapy_sub') },
    { titleKey: 'psychology_short', title: this.ts.t('psychology_short'), subtitle: this.ts.t('psychology_sub') },
    { titleKey: 'sensory_integration_short', title: this.ts.t('sensory_integration_short'), subtitle: this.ts.t('sensory_integration_sub') },
    { titleKey: 'vocational_short', title: this.ts.t('vocational_short'), subtitle: this.ts.t('vocational_sub') },
    { titleKey: 'daily_skills', title: this.ts.t('daily_skills'), subtitle: this.ts.t('independence') },
  ]);

  whyCards = computed(() => [
    {
      titleKey: 'quality_care',
      title: this.ts.t('quality_care'),
      desc: this.ts.t('quality_care_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    },
    {
      titleKey: 'loving_care',
      title: this.ts.t('loving_care'),
      desc: this.ts.t('loving_care_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    },
    {
      titleKey: 'individual_attention',
      title: this.ts.t('individual_attention'),
      desc: this.ts.t('individual_attention_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    },
    {
      titleKey: 'safe_environment',
      title: this.ts.t('safe_environment'),
      desc: this.ts.t('safe_environment_desc'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
    },
  ]);

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    this.animateElements.forEach(el => {
      observer.observe(el.nativeElement);
    });
  }
}
