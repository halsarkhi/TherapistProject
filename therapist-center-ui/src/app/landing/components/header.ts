import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, ThemeSwitcherComponent],
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="header-container">
        <a routerLink="/" class="logo-area">
          <div class="logo-icon">
            <img src="logo.png" alt="logo" />
          </div>
          <div class="logo-text">
            <h1>{{ 'app_name' | translate }}</h1>
            <span>{{ 'app_subtitle' | translate }}</span>
          </div>
        </a>

        <nav class="desktop-nav">
          @for (link of navLinks(); track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: link.exact}">
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="header-actions desktop-only">
          <app-theme-switcher />
          <app-lang-switcher />
          <a routerLink="/login" class="login-btn">{{ 'login' | translate }}</a>
        </div>

        <button class="hamburger" (click)="toggleMenu()" [class.open]="menuOpen()" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-overlay" [class.show]="menuOpen()" (click)="closeMenu()"></div>
      <nav class="mobile-nav" [class.open]="menuOpen()">
        <div class="mobile-nav-header">
          <div class="logo-area">
            <div class="logo-icon small">
              <img src="logo.png" alt="logo" />
            </div>
            <div class="logo-text">
              <h1>{{ 'app_name' | translate }}</h1>
              <span>{{ 'app_subtitle' | translate }}</span>
            </div>
          </div>
          <button class="close-btn" (click)="closeMenu()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="mobile-nav-links">
          @for (link of navLinks(); track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: link.exact}" (click)="closeMenu()">
              {{ link.label }}
            </a>
          }
        </div>
        <div class="mobile-nav-footer">
          <app-theme-switcher />
          <app-lang-switcher />
          <a routerLink="/login" class="login-btn mobile" (click)="closeMenu()">{{ 'login' | translate }}</a>
        </div>
      </nav>
    </header>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    header {
      background: color-mix(in srgb, var(--bg-main) 85%, transparent);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid transparent;
      transition: var(--transition);
      padding: 0 2rem;
    }

    header.scrolled {
      background: color-mix(in srgb, var(--bg-main) 95%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
      box-shadow: var(--shadow-sm);
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      gap: 1rem;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
      flex-shrink: 0;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }

    .logo-icon.small {
      width: 40px;
      height: 40px;
    }

    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .logo-text h1 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--heading-color);
      line-height: 1.3;
      margin: 0;
    }

    .logo-text span {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .desktop-nav a {
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: var(--transition);
      white-space: nowrap;
    }

    .desktop-nav a:hover {
      color: var(--heading-color);
      background: color-mix(in srgb, var(--primary) 8%, transparent);
    }

    .desktop-nav a.active {
      color: var(--heading-color);
      background: color-mix(in srgb, var(--primary) 12%, transparent);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .login-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.55rem 1.5rem;
      background: var(--primary);
      color: var(--white);
      border-radius: var(--radius-xl);
      font-size: 0.9rem;
      font-weight: 700;
      transition: var(--transition);
      white-space: nowrap;
      text-decoration: none;
    }

    .login-btn:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 44px;
      height: 44px;
      background: none;
      gap: 5px;
      padding: 0;
      z-index: 1001;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 2.5px;
      background: var(--primary-dark);
      border-radius: 2px;
      transition: var(--transition);
    }

    .hamburger.open span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.open span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .mobile-overlay.show {
      opacity: 1;
    }

    .mobile-nav {
      display: none;
      position: fixed;
      top: 0;
      right: -320px;
      width: 300px;
      max-width: 85vw;
      height: 100vh;
      background: var(--white);
      z-index: 999;
      flex-direction: column;
      padding: 1.5rem;
      transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-lg);
      overflow-y: auto;
    }

    .mobile-nav.open {
      right: 0;
    }

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--light-green);
      margin-bottom: 1rem;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      background: var(--off-white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mobile-nav-links a {
      padding: 0.85rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: var(--transition);
    }

    .mobile-nav-links a:hover,
    .mobile-nav-links a.active {
      color: var(--heading-color);
      background: color-mix(in srgb, var(--primary) 10%, transparent);
    }

    .mobile-nav-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }

    .login-btn.mobile {
      padding: 0.85rem;
      text-align: center;
      width: 100%;
    }

    .desktop-only {
      display: flex;
    }

    @media (max-width: 1024px) {
      .desktop-nav {
        display: none;
      }

      .desktop-only {
        display: none;
      }

      .hamburger {
        display: flex;
      }

      .mobile-overlay {
        display: block;
        pointer-events: none;
      }

      .mobile-overlay.show {
        pointer-events: auto;
      }

      .mobile-nav {
        display: flex;
      }

      header {
        padding: 0 1rem;
      }
    }

    @media (max-width: 480px) {
      .logo-text h1 {
        font-size: 0.95rem;
      }
      .logo-text span {
        font-size: 0.7rem;
      }
      .logo-icon {
        width: 40px;
        height: 40px;
      }
    }
  `
})
export class HeaderComponent {
  private readonly ts = inject(TranslationService);

  isScrolled = signal(false);
  menuOpen = signal(false);

  navLinks = computed(() => [
    { path: '/', label: this.ts.t('nav_home'), exact: true },
    { path: '/vision', label: this.ts.t('nav_vision'), exact: false },
    { path: '/programs', label: this.ts.t('nav_programs'), exact: false },
    { path: '/admissions', label: this.ts.t('nav_admissions'), exact: false },
    { path: '/facilities', label: this.ts.t('nav_facilities'), exact: false },
    { path: '/gallery', label: this.ts.t('nav_gallery'), exact: false },
    { path: '/contact', label: this.ts.t('nav_contact'), exact: false },
  ]);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
  }
}
