import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LangSwitcherComponent } from '../../../shared/components/lang-switcher';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher';
import { TherapistService } from '../../services/therapist.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-therapist-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, ThemeSwitcherComponent],
  template: `
    <div class="layout">
      <header class="header">
        <div class="header-inner">
          <div class="header-brand">
            <div class="logo-icon">
              <img src="logo.png" alt="logo" />
            </div>
            <div class="brand-text">
              <span class="brand-name">{{ 'app_name' | translate }}</span>
              <span class="brand-subtitle">{{ 'therapist_portal' | translate }}</span>
            </div>
          </div>

          <div class="header-actions">
            <app-theme-switcher />
            <app-lang-switcher />
            <div class="user-info">
              <div class="user-avatar">
                @if (photoUrl()) {
                  <img [src]="photoUrl()" alt="photo" />
                } @else {
                  {{ userInitial }}
                }
              </div>
              <span class="user-name">{{ displayName }}</span>
            </div>
            <button class="btn-logout" (click)="logout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {{ 'logout' | translate }}
            </button>
          </div>

          <button class="mobile-menu-btn" (click)="mobileMenuOpen = !mobileMenuOpen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              @if (mobileMenuOpen) {
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              } @else {
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              }
            </svg>
          </button>
        </div>

        @if (mobileMenuOpen) {
          <div class="mobile-dropdown">
            <div class="mobile-user">
              <div class="user-avatar">
                @if (photoUrl()) {
                  <img [src]="photoUrl()" alt="photo" />
                } @else {
                  <span>{{ userInitial }}</span>
                }
              </div>
              <span>{{ displayName }}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:0.75rem">
              <app-theme-switcher />
              <app-lang-switcher />
            </div>
            <button class="btn-logout mobile" (click)="logout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {{ 'logout' | translate }}
            </button>
          </div>
        }
      </header>

      <nav class="sub-nav">
        <div class="sub-nav-inner">
          <a routerLink="/therapist/sessions" routerLinkActive="active">{{ 'the_sessions' | translate }}</a>
          <a routerLink="/therapist/assessments" routerLinkActive="active">{{ 'assess_nav_label' | translate }}</a>
          <a routerLink="/therapist/broadcast" routerLinkActive="active">{{ 'broadcast_center' | translate }}</a>
          <a routerLink="/therapist/messages" routerLinkActive="active">{{ 'the_messages' | translate }}</a>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--off-white, #F4F6F3);
    }

    .header {
      background: linear-gradient(135deg, var(--primary-dark, #2D3E28) 0%, var(--primary, #6B8068) 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-md, 0 4px 20px rgba(45, 62, 40, 0.12));
    }

    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      height: var(--header-height, 80px);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: white;
      border-radius: 12px;
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

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .brand-subtitle {
      font-size: 0.8rem;
      opacity: 0.85;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      overflow: hidden;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.2rem;
      border-radius: var(--radius-sm, 8px);
      background: rgba(255, 255, 255, 0.15);
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition, all 0.3s ease);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
    }

    .mobile-dropdown {
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      animation: slideDown 0.25s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-user {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .btn-logout.mobile {
      width: 100%;
      justify-content: center;
    }

    .sub-nav {
      background: var(--white, #fff);
      border-bottom: 1px solid var(--border-light, #E5E7EB);
      box-shadow: var(--shadow-sm);
    }
    .sub-nav-inner {
      max-width: 1400px; margin: 0 auto; padding: 0 2rem;
      display: flex; gap: 4px; align-items: center; height: 48px;
    }
    .sub-nav a {
      padding: 8px 18px; border-radius: 8px;
      font-size: 14px; font-weight: 600;
      color: var(--text-muted); text-decoration: none;
      transition: var(--transition);
    }
    .sub-nav a:hover { background: color-mix(in srgb, var(--primary) 8%, transparent); color: var(--primary-dark); }
    .sub-nav a.active { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary-dark); }

    .main-content {
      flex: 1;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
    }

    @media (max-width: 768px) {
      .header-inner {
        padding: 0 1rem;
        height: 64px;
      }

      .brand-name {
        font-size: 0.85rem;
      }

      .brand-subtitle {
        font-size: 0.7rem;
      }

      .logo-icon {
        width: 36px;
        height: 36px;
      }

      .header-actions {
        display: none;
      }

      .mobile-menu-btn {
        display: block;
      }

      .main-content {
        padding: 1rem;
      }
    }
  `,
})
export class TherapistLayout implements OnInit {
  mobileMenuOpen = false;
  readonly photoUrl = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly therapistService: TherapistService,
    private readonly ts: TranslationService,
  ) {}

  ngOnInit(): void {
    this.therapistService.getMyStaffProfile().subscribe({
      next: (staff) => this.photoUrl.set(staff?.photoUrl ?? null),
      error: () => this.photoUrl.set(null),
    });
  }

  get userName(): string {
    return this.auth.getUserName() ?? this.ts.t('role_therapist_label');
  }

  get displayName(): string {
    return this.ts.isArabic() ? this.userName : this.ts.t('role_therapist_label');
  }

  get userInitial(): string {
    const name = this.userName;
    return name.charAt(0);
  }

  logout(): void {
    this.auth.logout();
  }
}
