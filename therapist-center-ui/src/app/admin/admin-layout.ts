import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { LangSwitcherComponent } from '../shared/components/lang-switcher';
import { ThemeSwitcherComponent } from '../shared/components/theme-switcher';
import { TranslationService } from '../core/services/translation.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, ThemeSwitcherComponent],
  template: `
    <!-- Mobile top bar -->
    <div class="mobile-topbar">
      <button class="hamburger" (click)="toggleSidebar()" [attr.aria-label]="'menu' | translate">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <span class="mobile-title">{{ 'app_name' | translate }}</span>
      <div class="mobile-topbar-spacer"></div>
      <div class="mobile-topbar-switchers">
        <app-theme-switcher />
        <app-lang-switcher />
      </div>
    </div>

    <!-- Overlay -->
    @if (sidebarOpen()) {
      <div class="overlay" (click)="toggleSidebar()"></div>
    }

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="sidebarOpen()">
      <div class="sidebar-header">
        <div class="logo-icon">
          <img src="logo.png" alt="logo" />
        </div>
        <div class="logo-text">
          <span class="center-name">{{ 'app_name' | translate }}</span>
          <span class="center-sub">{{ 'app_subtitle' | translate }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="closeSidebar()"
          >
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-label">{{ item.labelKey | translate }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            </svg>
          </div>
          <div class="admin-details">
            <span class="admin-name">{{ 'admin_label' | translate }}</span>
            <span class="admin-email">center.hemmhr&#64;gmail.com</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>{{ 'logout' | translate }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <div class="top-toolbar">
        <div class="toolbar-spacer"></div>
        <div class="toolbar-switchers">
          <app-theme-switcher />
          <app-lang-switcher />
        </div>
      </div>
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      min-height: 100vh;
      direction: rtl;
    }

    .sidebar {
      width: 280px;
      min-height: 100vh;
      background: var(--primary-dark);
      color: #fff;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      inset-inline-end: 0;
      bottom: 0;
      z-index: 100;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-header {
      padding: 28px 24px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      background: var(--white);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }

    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .center-name {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.4;
    }

    .center-sub {
      font-size: 12px;
      opacity: 0.7;
      font-weight: 400;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
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
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 500;
      transition: var(--transition);
      cursor: pointer;
      text-decoration: none;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .nav-item.active {
      background: var(--primary);
      color: #fff;
      font-weight: 600;
    }

    .nav-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-icon :first-child {
      width: 22px;
      height: 22px;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .admin-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      margin-bottom: 8px;
    }

    .admin-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--accent-green);
    }

    .admin-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-name {
      font-size: 14px;
      font-weight: 600;
    }

    .admin-email {
      font-size: 11px;
      opacity: 0.6;
      direction: ltr;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      background: rgba(192, 57, 43, 0.15);
      color: #e74c3c;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
    }

    .logout-btn:hover {
      background: rgba(192, 57, 43, 0.25);
    }

    .main-content {
      flex: 1;
      margin-right: 280px;
      margin-left: 0;
      padding: 0 32px 32px;
      min-height: 100vh;
      background: var(--off-white);
    }

    :host-context(html[dir="ltr"]) .main-content {
      margin-right: 0;
      margin-left: 280px;
    }

    .top-toolbar {
      display: flex;
      align-items: center;
      padding: 16px 0;
      gap: 12px;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .toolbar-switchers {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mobile-topbar-spacer {
      flex: 1;
    }

    .mobile-topbar-switchers {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mobile-topbar {
      display: none;
    }

    .overlay {
      display: none;
    }

    .hamburger {
      display: none;
    }

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

      .main-content {
        margin-right: 0 !important;
        margin-left: 0 !important;
        padding: 80px 16px 16px;
      }

      .top-toolbar {
        display: none;
      }

      .mobile-topbar {
        display: flex;
        align-items: center;
        gap: 12px;
        position: fixed;
        top: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 60px;
        background: var(--primary-dark);
        color: #fff;
        padding: 0 16px;
        z-index: 90;
      }

      .mobile-title {
        font-size: 16px;
        font-weight: 700;
      }

      .hamburger {
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: none;
        padding: 4px;
        cursor: pointer;
      }

      .hamburger-line {
        width: 24px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: var(--transition);
      }

      .overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
        animation: fadeIn 0.2s ease;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
})
export class AdminLayoutComponent {
  readonly sidebarOpen = signal(false);

  readonly navItems = [
    {
      labelKey: 'dashboard',
      route: '/admin/dashboard',
      exact: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    },
    {
      labelKey: 'manage_students',
      route: '/admin/students',
      exact: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      labelKey: 'manage_staff',
      route: '/admin/staff',
      exact: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
    },
    {
      labelKey: 'manage_schedules',
      route: '/admin/schedules',
      exact: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    },
    {
      labelKey: 'messages',
      route: '/admin/messages',
      exact: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    },
    {
      labelKey: 'settings',
      route: '/admin/settings',
      exact: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    },
  ];

  constructor(
    private readonly authService: AuthService,
    public readonly ts: TranslationService,
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
    this.syncBodyScroll();
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.syncBodyScroll();
  }

  private syncBodyScroll(): void {
    document.body.classList.toggle('no-scroll', this.sidebarOpen());
  }

  logout(): void {
    this.authService.logout();
  }
}
