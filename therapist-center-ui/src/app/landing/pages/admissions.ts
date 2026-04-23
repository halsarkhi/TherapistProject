import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'adm_badge' | translate }}</span>
        <h1>{{ 'adm_hero_title' | translate }}</h1>
        <p>{{ 'adm_hero_desc' | translate }}</p>
      </div>
    </section>

    <!-- Steps -->
    <section class="steps-section">
      <div class="container">
        <div class="section-header" #animateEl>
          <span class="section-badge">{{ 'adm_steps_badge' | translate }}</span>
          <h2>{{ 'adm_steps_title' | translate }}</h2>
        </div>
        <div class="steps-grid">
          @for (step of steps(); track step.title; let i = $index) {
            <div class="step-card" #animateEl [style.transition-delay]="(i * 120) + 'ms'">
              <div class="step-number">{{ i + 1 }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Requirements -->
    <section class="req-section">
      <div class="container">
        <div class="req-grid">
          <div class="req-card" #animateEl>
            <h2>{{ 'adm_req_title' | translate }}</h2>
            <ul>
              @for (req of requirements(); track req) {
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ req }}
                </li>
              }
            </ul>
          </div>
          <div class="req-card" #animateEl>
            <h2>{{ 'adm_docs_title' | translate }}</h2>
            <ul>
              @for (doc of documents(); track doc) {
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {{ doc }}
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section" #animateEl>
      <div class="container">
        <div class="cta-content">
          <h2>{{ 'adm_cta_title' | translate }}</h2>
          <p>{{ 'adm_cta_desc' | translate }}</p>
          <div class="cta-actions">
            <a routerLink="/contact" class="btn btn-white">{{ 'contact_us_btn' | translate }}</a>
            <a href="tel:+966565456459" class="btn btn-outline-white">{{ 'adm_cta_call' | translate }}</a>
          </div>
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

    .page-badge, .section-badge {
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

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .section-header.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--heading-color);
    }

    .steps-section {
      padding: 5rem 0;
      background: var(--white);
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .step-card {
      text-align: center;
      padding: 2rem 1.5rem;
      background: var(--off-white);
      border-radius: var(--radius-lg);
      position: relative;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    }

    .step-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .step-card:hover {
      box-shadow: var(--shadow-md);
    }

    .step-number {
      width: 48px;
      height: 48px;
      background: var(--primary);
      color: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 auto 1rem;
    }

    .step-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.5rem;
    }

    .step-card p {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .req-section {
      padding: 4rem 0 5rem;
      background: var(--off-white);
    }

    .req-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .req-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      box-shadow: var(--shadow-sm);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .req-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .req-card h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--light-green);
    }

    .req-card ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .req-card li {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.92rem;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .req-card li svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: var(--primary);
      margin-top: 4px;
    }

    .cta-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease, transform 0.7s ease;
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
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--white);
      margin-bottom: 0.75rem;
    }

    .cta-content p {
      color: rgba(255,255,255,0.8);
      margin-bottom: 2rem;
      line-height: 1.8;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

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
    }

    .btn-white {
      background: var(--white);
      color: var(--heading-color);
    }

    .btn-white:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-outline-white {
      background: transparent;
      color: var(--white);
      border: 2px solid rgba(255,255,255,0.5);
    }

    .btn-outline-white:hover {
      background: rgba(255,255,255,0.15);
      border-color: var(--white);
      transform: translateY(-2px);
    }

    @media (max-width: 1024px) {
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .steps-grid {
        grid-template-columns: 1fr;
      }
      .req-grid {
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
export class AdmissionsComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);

  steps = computed(() => [
    { title: this.ts.t('adm_step1_title'), desc: this.ts.t('adm_step1_desc') },
    { title: this.ts.t('adm_step2_title'), desc: this.ts.t('adm_step2_desc') },
    { title: this.ts.t('adm_step3_title'), desc: this.ts.t('adm_step3_desc') },
    { title: this.ts.t('adm_step4_title'), desc: this.ts.t('adm_step4_desc') },
  ]);

  requirements = computed(() => [
    this.ts.t('adm_req1'),
    this.ts.t('adm_req2'),
    this.ts.t('adm_req3'),
    this.ts.t('adm_req4'),
    this.ts.t('adm_req5'),
  ]);

  documents = computed(() => [
    this.ts.t('adm_doc1'),
    this.ts.t('adm_doc2'),
    this.ts.t('adm_doc3'),
    this.ts.t('adm_doc4'),
    this.ts.t('adm_doc5'),
    this.ts.t('adm_doc6'),
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
