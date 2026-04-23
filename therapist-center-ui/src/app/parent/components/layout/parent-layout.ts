import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LangSwitcherComponent } from '../../../shared/components/lang-switcher';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher';

@Component({
  selector: 'app-parent-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, ThemeSwitcherComponent],
  template: `
    <!-- Mobile overlay -->
    @if (sidebarOpen()) {
      <div class="overlay" (click)="sidebarOpen.set(false)"></div>
    }

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="sidebarOpen()">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">
            <img src="logo.png" alt="logo" />
          </div>
          <div>
            <h2 class="sidebar-title">{{ 'parent_portal' | translate }}</h2>
            <p class="sidebar-subtitle">{{ 'parent_dashboard' | translate }}</p>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/parent/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileSidebar()" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>{{ 'dashboard' | translate }}</span>
        </a>
        <a routerLink="/parent/messages" routerLinkActive="active" (click)="closeMobileSidebar()" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>{{ 'therapist_messages' | translate }}</span>
        </a>
        <a routerLink="/parent/schedule" routerLinkActive="active" (click)="closeMobileSidebar()" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ 'session_schedule' | translate }}</span>
        </a>
        <a routerLink="/parent/reports" routerLinkActive="active" (click)="closeMobileSidebar()" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>{{ 'progress_reports' | translate }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>{{ 'logout' | translate }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="top-header">
        <div class="header-right">
          <button class="hamburger" (click)="sidebarOpen.set(!sidebarOpen())" [attr.aria-label]="ts.t('menu')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="greeting">
            <span class="greeting-text">{{ 'welcome_parent' | translate }}</span>
            @if (ts.isArabic()) {
              <span class="greeting-name">{{ userName() }}</span>
            }
          </div>
        </div>
        <div class="header-left">
          <div class="header-switchers">
            <app-theme-switcher />
            <app-lang-switcher />
          </div>
          <div class="header-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" fill="var(--primary)" opacity="0.12"/>
              <path d="M18 10c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 2.4c1.32 0 2.4 1.08 2.4 2.4s-1.08 2.4-2.4 2.4-2.4-1.08-2.4-2.4 1.08-2.4 2.4-2.4zm0 11.36c-2 0-3.76-1.02-4.8-2.56.02-1.6 3.2-2.48 4.8-2.48s4.78.88 4.8 2.48c-1.04 1.54-2.8 2.56-4.8 2.56z" fill="var(--primary)"/>
            </svg>
          </div>
          <button class="header-logout" (click)="logout()" [attr.aria-label]="ts.t('logout')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content animate-fade-in">
        <router-outlet />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="bottom-nav">
      <a routerLink="/parent/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>{{ 'control_panel' | translate }}</span>
      </a>
      <a routerLink="/parent/messages" routerLinkActive="active" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <span>{{ 'the_messages' | translate }}</span>
      </a>
      <a routerLink="/parent/schedule" routerLinkActive="active" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{{ 'the_sessions' | translate }}</span>
      </a>
      <a routerLink="/parent/reports" routerLinkActive="active" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>{{ 'the_reports' | translate }}</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      min-height: 100vh;
      direction: rtl;
    }

    /* ── Sidebar ── */
    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      left: auto;
      width: 260px;
      height: 100vh;
      background: var(--white);
      border-left: 1px solid var(--light-green);
      display: flex;
      flex-direction: column;
      z-index: 100;
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host-context(html[dir="ltr"]) .sidebar {
      right: auto;
      left: 0;
      border-left: none;
      border-right: 1px solid var(--light-green);
    }

    .sidebar-header {
      padding: 24px 20px 16px;
      border-bottom: 1px solid var(--light-green);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--off-white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 4px;
    }

    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .sidebar-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading-color);
      line-height: 1.3;
    }

    .sidebar-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      transition: var(--transition);
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--off-white);
      color: var(--heading-color);
    }

    .nav-item.active {
      background: var(--primary);
      color: var(--white);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* Sidebar footer */
    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid var(--light-green);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      width: 100%;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--error);
      font-size: 0.9rem;
      font-weight: 600;
      transition: var(--transition);
    }

    .logout-btn:hover {
      background: var(--error-light);
    }

    /* ── Main wrapper ── */
    .main-wrapper {
      flex: 1;
      margin-right: 260px;
      margin-left: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    :host-context(html[dir="ltr"]) .main-wrapper {
      margin-right: 0;
      margin-left: 260px;
    }

    /* Header */
    .top-header {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 64px;
      background: var(--white);
      border-bottom: 1px solid var(--light-green);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      box-shadow: var(--shadow-sm);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hamburger {
      display: none;
      background: none;
      padding: 8px;
      border-radius: var(--radius-sm);
      color: var(--heading-color);
    }

    .hamburger:hover {
      background: var(--off-white);
    }

    .greeting-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .greeting-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-right: 8px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-switchers {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-logo {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--off-white);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-logout {
      background: none;
      padding: 8px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      transition: var(--transition);
    }

    .header-logout:hover {
      background: var(--error-light);
      color: var(--error);
    }

    /* Page content */
    .page-content {
      flex: 1;
      padding: 28px;
    }

    /* Overlay */
    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 90;
      backdrop-filter: blur(2px);
    }

    /* Bottom nav */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--white);
      border-top: 1px solid var(--light-green);
      z-index: 80;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      transition: var(--transition);
    }

    .bottom-nav-item.active {
      color: var(--primary);
    }

    .bottom-nav-item.active svg {
      stroke: var(--primary);
    }

    /* Animation */
    .animate-fade-in {
      animation: fadeIn 0.35s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(100%);
      }

      :host-context(html[dir="ltr"]) .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .overlay {
        display: block;
      }

      .main-wrapper {
        margin-right: 0 !important;
        margin-left: 0 !important;
      }

      .hamburger {
        display: flex;
      }

      .bottom-nav {
        display: flex;
      }

      .page-content {
        padding: 20px 16px 80px;
      }
    }

    @media (max-width: 480px) {
      .top-header {
        padding: 0 16px;
      }

      .greeting-name {
        display: none;
      }

      .page-content {
        padding: 16px 12px 80px;
      }
    }
  `,
})
export class ParentLayout {
  private readonly auth = inject(AuthService);
  readonly ts = inject(TranslationService);

  readonly sidebarOpen = signal(false);

  readonly userName = () => this.auth.getUserName() ?? '';

  closeMobileSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
