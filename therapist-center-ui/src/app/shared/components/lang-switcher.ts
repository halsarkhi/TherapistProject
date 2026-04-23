import { Component } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  template: `
    <button class="lang-switcher" (click)="ts.toggleLang()" [attr.aria-label]="ts.isArabic() ? 'Switch to English' : 'التبديل إلى العربية'">
      {{ ts.isArabic() ? 'EN' : 'عربي' }}
    </button>
  `,
  styles: [`
    .lang-switcher {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 52px;
      height: 32px;
      padding: 0 12px;
      font-family: 'Cairo', 'Segoe UI', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary-dark, #2D3E28);
      background: var(--light-green, #E8EDE7);
      border: 1.5px solid var(--border, #D4DDD2);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }

    .lang-switcher:hover {
      background: var(--primary, #6B8068);
      color: var(--bg-card, #fff);
      border-color: var(--primary, #6B8068);
    }

    .lang-switcher:active {
      transform: scale(0.95);
    }
  `],
})
export class LangSwitcherComponent {
  constructor(public ts: TranslationService) {}
}
