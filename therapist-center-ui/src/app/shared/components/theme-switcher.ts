import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <div class="theme-switcher-wrapper">
      <button
        class="theme-toggle-btn"
        (click)="toggleDropdown()"
        [attr.aria-label]="ts.isArabic() ? 'تغيير السمة' : 'Change Theme'"
        [attr.aria-expanded]="isOpen()"
      >
        <span class="current-theme-icon">{{ themeService.currentTheme().icon }}</span>
      </button>

      @if (isOpen()) {
        <div class="theme-dropdown" [class.dropdown-rtl]="ts.isArabic()">
          <div class="dropdown-header">
            {{ ts.isArabic() ? 'السمة' : 'Theme' }}
          </div>
          @for (theme of themeService.getThemes(); track theme.id) {
            <button
              class="theme-option"
              [class.active]="theme.id === themeService.currentThemeId()"
              (click)="selectTheme(theme)"
            >
              <span
                class="theme-color-dot"
                [style.background]="theme.colors.primary"
              ></span>
              <span class="theme-icon">{{ theme.icon }}</span>
              <span class="theme-name">{{ ts.isArabic() ? theme.nameAr : theme.nameEn }}</span>
              @if (theme.id === themeService.currentThemeId()) {
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .theme-switcher-wrapper {
      position: relative;
      display: inline-flex;
    }

    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 32px;
      font-size: 1.1rem;
      background: var(--light-green, #E8EDE7);
      border: 1.5px solid var(--border, #D4DDD2);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      line-height: 1;
      padding: 0;
    }

    .theme-toggle-btn:hover {
      background: var(--primary, #6B8068);
      border-color: var(--primary, #6B8068);
      transform: scale(1.05);
    }

    .current-theme-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 180px;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, #D4DDD2);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      overflow: hidden;
      animation: themeDropdownIn 0.2s ease;
    }

    .theme-dropdown.dropdown-rtl {
      right: 0;
      left: auto;
    }

    :host-context(html[dir="ltr"]) .theme-dropdown {
      right: auto;
      left: 0;
    }

    .dropdown-header {
      padding: 10px 14px 6px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted, #8A9A87);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 14px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary, #2D3E28);
      transition: background 0.15s ease;
      font-family: 'Cairo', sans-serif;
      text-align: inherit;
    }

    .theme-option:hover {
      background: var(--off-white, #F4F6F3);
    }

    .theme-option.active {
      background: var(--light-green, #E8EDE7);
      font-weight: 700;
    }

    .theme-option:last-child {
      border-radius: 0 0 12px 12px;
    }

    .theme-color-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 2px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    .theme-icon {
      font-size: 0.95rem;
      line-height: 1;
    }

    .theme-name {
      flex: 1;
    }

    .check-icon {
      width: 16px;
      height: 16px;
      color: var(--primary, #6B8068);
      flex-shrink: 0;
    }

    @keyframes themeDropdownIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);
  readonly ts = inject(TranslationService);
  private readonly elRef = inject(ElementRef);

  readonly isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme.id);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
