import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <footer>
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="logo-area">
              <div class="logo-icon">
                <img src="logo.png" alt="logo" />
              </div>
              <div class="logo-text">
                <h3>{{ 'app_name' | translate }}</h3>
                <span>{{ 'app_subtitle' | translate }}</span>
              </div>
            </div>
            <p class="tagline">{{ 'hero_title' | translate }}</p>
          </div>

          <div class="footer-links">
            <h4>{{ 'quick_links' | translate }}</h4>
            <a routerLink="/">{{ 'nav_home' | translate }}</a>
            <a routerLink="/vision">{{ 'nav_vision' | translate }}</a>
            <a routerLink="/programs">{{ 'nav_programs' | translate }}</a>
            <a routerLink="/admissions">{{ 'nav_admissions' | translate }}</a>
            <a routerLink="/facilities">{{ 'nav_facilities' | translate }}</a>
            <a routerLink="/contact">{{ 'nav_contact' | translate }}</a>
          </div>

          <div class="footer-contact">
            <h4>{{ 'contact_us_btn' | translate }}</h4>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ 'location_value' | translate }}</span>
            </div>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span dir="ltr">{{ 'phone_number' | translate }}</span>
            </div>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ 'working_hours_days' | translate }}: {{ 'working_hours_time' | translate }}</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>{{ 'copyright' | translate }} &copy; {{ currentYear }} {{ 'app_name' | translate }} {{ 'app_subtitle' | translate }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    :host {
      display: block;
    }

    footer {
      background: var(--primary-dark);
      color: rgba(255, 255, 255, 0.85);
      padding: 3.5rem 2rem 1.5rem;
    }

    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.5fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
    }

    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .logo-icon svg {
      width: 100%;
      height: 100%;
    }

    .logo-text h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--white);
      margin: 0;
    }

    .logo-text span {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }

    .tagline {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.6;
    }

    h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 1rem;
    }

    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-links a {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.65);
      transition: var(--transition);
      padding: 0.2rem 0;
    }

    .footer-links a:hover {
      color: var(--white);
      padding-right: 0.5rem;
    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }

    .contact-item svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 3px;
      color: var(--primary-light);
    }

    .footer-bottom {
      padding-top: 1.5rem;
      text-align: center;
    }

    .footer-bottom p {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 768px) {
      .footer-top {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }

      .logo-area {
        justify-content: center;
      }

      .contact-item {
        justify-content: center;
      }

      footer {
        padding: 2.5rem 1.25rem 1.25rem;
      }
    }
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
