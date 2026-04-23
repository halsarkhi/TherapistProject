import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ContactMessageService } from '../../core/services/contact-message.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'con_badge' | translate }}</span>
        <h1>{{ 'con_hero_title' | translate }}</h1>
        <p>{{ 'con_hero_desc' | translate }}</p>
      </div>
    </section>

    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <!-- Contact Form -->
          <div class="contact-form-card" #animateEl>
            <h2>{{ 'con_form_title' | translate }}</h2>
            <p class="form-subtitle">{{ 'con_form_subtitle' | translate }}</p>

            @if (success()) {
              <div class="success-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.</span>
              </div>
            }
            <form #f="ngForm" (ngSubmit)="onSubmit(f)" class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">{{ 'full_name' | translate }}</label>
                  <input id="name" type="text" [(ngModel)]="form.name" name="name" [placeholder]="'con_name_ph' | translate" required>
                </div>
                <div class="form-group">
                  <label for="phone">{{ 'phone_label' | translate }}</label>
                  <input id="phone" type="tel" [(ngModel)]="form.phone" name="phone" placeholder="05XXXXXXXX" dir="ltr">
                </div>
              </div>
              <div class="form-group">
                <label for="email">{{ 'email_label' | translate }}</label>
                <input id="email" type="email" [(ngModel)]="form.email" name="email" placeholder="example&#64;email.com" dir="ltr">
              </div>
              <div class="form-group">
                <label for="message">{{ 'message' | translate }}</label>
                <textarea id="message" [(ngModel)]="form.message" name="message" [placeholder]="'con_msg_ph' | translate" rows="5" required></textarea>
              </div>
              <button type="submit" class="submit-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {{ 'con_submit' | translate }}
              </button>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="contact-info" #animateEl>
            <div class="info-cards">
              @for (info of contactInfo(); track info.title) {
                <div class="info-card">
                  <div class="info-icon" [innerHTML]="info.icon"></div>
                  <div>
                    <h3>{{ info.title }}</h3>
                    <p [dir]="info.dir || 'rtl'">{{ info.value }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Google Map -->
            <div class="map-frame">
              <iframe
                [src]="mapUrl"
                width="100%"
                height="260"
                style="border:0;"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen></iframe>
            </div>
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

    .contact-section {
      padding: 4rem 0 5rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    .contact-form-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .contact-form-card.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .contact-form-card h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 0.35rem;
    }

    .form-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.4rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 0.92rem;
      color: var(--text-primary);
      background: var(--off-white);
      transition: var(--transition);
      font-family: var(--font-family);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
      background: var(--white);
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: var(--text-muted);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 2rem;
      background: var(--primary);
      color: var(--white);
      border-radius: var(--radius-xl);
      font-size: 0.95rem;
      font-weight: 700;
      transition: var(--transition);
      width: 100%;
    }

    .submit-btn svg {
      width: 18px;
      height: 18px;
    }

    .submit-btn:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
    }

    .contact-info.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .info-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-card {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      transition: var(--transition);
    }

    .info-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(-4px);
    }

    .info-icon {
      width: 44px;
      height: 44px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-icon :first-child {
      width: 22px;
      height: 22px;
      color: var(--primary);
    }

    .info-card h3 {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-bottom: 0.2rem;
    }

    .info-card p {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .map-frame {
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
    }

    .map-frame iframe {
      display: block;
      width: 100%;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary-dark);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
    }

    .success-banner svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .contact-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .page-hero h1 {
        font-size: 1.8rem;
      }
      .contact-form-card {
        padding: 1.75rem;
      }
      .container {
        padding: 0 1.25rem;
      }
    }
  `
})
export class ContactComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);
  private readonly contactService = inject(ContactMessageService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly success = signal(false);

  readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps?q=' + encodeURIComponent('حي مسرة، الطائف، السعودية') + '&output=embed'
  );

  form = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  contactInfo = computed<{ title: string; value: string; dir?: string; icon: string }[]>(() => [
    {
      title: this.ts.t('location'),
      value: this.ts.t('con_location_val'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    },
    {
      title: this.ts.t('phone'),
      value: '+966 56 545 6459',
      dir: 'ltr',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    },
    {
      title: this.ts.t('working_hours'),
      value: this.ts.t('con_hours_val'),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    {
      title: this.ts.t('email'),
      value: 'info@himam-center.sa',
      dir: 'ltr',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
    },
  ]);

  onSubmit(f?: NgForm) {
    if (!this.form.name.trim() || !this.form.message.trim()) return;
    this.contactService.submit({ ...this.form });
    this.success.set(true);
    this.form = { name: '', email: '', phone: '', message: '' };
    f?.resetForm();
    setTimeout(() => this.success.set(false), 5000);
  }

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
