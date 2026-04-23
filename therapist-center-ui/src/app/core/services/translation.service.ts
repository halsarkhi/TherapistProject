import { Injectable, signal, computed } from '@angular/core';
import { AR_TRANSLATIONS } from '../i18n/ar';
import { EN_TRANSLATIONS } from '../i18n/en';

export type Lang = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'app_lang';
  private readonly _currentLang = signal<Lang>(this.getStoredLang());

  readonly currentLang = this._currentLang.asReadonly();
  readonly isArabic = computed(() => this._currentLang() === 'ar');
  readonly dir = computed(() => this._currentLang() === 'ar' ? 'rtl' : 'ltr');

  private translations: Record<Lang, Record<string, string>> = {
    ar: AR_TRANSLATIONS,
    en: EN_TRANSLATIONS,
  };

  constructor() {
    this.applyDirection();
  }

  t(key: string): string {
    return this.translations[this._currentLang()][key] || this.translations['ar'][key] || key;
  }

  switchLang(lang: Lang): void {
    this._currentLang.set(lang);
    localStorage.setItem(this.storageKey, lang);
    this.applyDirection();
  }

  toggleLang(): void {
    this.switchLang(this._currentLang() === 'ar' ? 'en' : 'ar');
  }

  private getStoredLang(): Lang {
    const stored = localStorage.getItem(this.storageKey);
    return (stored === 'ar' || stored === 'en') ? stored : 'ar';
  }

  private applyDirection(): void {
    const lang = this._currentLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.fontFamily =
      lang === 'ar'
        ? "'Cairo', sans-serif"
        : "'Cairo', 'Segoe UI', sans-serif";
  }
}
