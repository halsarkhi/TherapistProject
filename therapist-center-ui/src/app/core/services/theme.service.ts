import { Injectable, signal, computed } from '@angular/core';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  bgMain: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  accent: string;
  offWhite: string;
  lightAccent: string;
}

export interface Theme {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: 'nature',
    nameAr: 'الطبيعة',
    nameEn: 'Nature',
    icon: '🌿',
    colors: {
      primary: '#6B8068',
      primaryLight: '#8FA88C',
      primaryDark: '#2D3E28',
      bgMain: '#F4F6F3',
      bgCard: '#FFFFFF',
      textPrimary: '#2D3E28',
      textSecondary: '#5A6B57',
      textMuted: '#8A9A87',
      border: '#D4DDD2',
      borderLight: '#E8EDE7',
      accent: '#8FA88C',
      offWhite: '#F4F6F3',
      lightAccent: '#E8EDE7',
    },
  },
  {
    id: 'ocean',
    nameAr: 'المحيط',
    nameEn: 'Ocean',
    icon: '🌊',
    colors: {
      primary: '#4A7C9B',
      primaryLight: '#6BA3C7',
      primaryDark: '#1E3A5F',
      bgMain: '#F0F5F8',
      bgCard: '#FFFFFF',
      textPrimary: '#1E3A5F',
      textSecondary: '#4A6B7F',
      textMuted: '#7A98AB',
      border: '#C8D8E4',
      borderLight: '#E0EBF2',
      accent: '#E8A838',
      offWhite: '#F0F5F8',
      lightAccent: '#E0EBF2',
    },
  },
  {
    id: 'lavender',
    nameAr: 'اللافندر',
    nameEn: 'Lavender',
    icon: '💜',
    colors: {
      primary: '#7B6BA5',
      primaryLight: '#9B8EC5',
      primaryDark: '#3D2E5C',
      bgMain: '#F5F3F8',
      bgCard: '#FFFFFF',
      textPrimary: '#3D2E5C',
      textSecondary: '#6B5D8A',
      textMuted: '#9388AA',
      border: '#D8D0E8',
      borderLight: '#EBE6F4',
      accent: '#C97B84',
      offWhite: '#F5F3F8',
      lightAccent: '#EBE6F4',
    },
  },
  {
    id: 'sunset',
    nameAr: 'الغروب',
    nameEn: 'Sunset',
    icon: '🌅',
    colors: {
      primary: '#C47B5A',
      primaryLight: '#D9A088',
      primaryDark: '#6B3A2A',
      bgMain: '#FDF6F2',
      bgCard: '#FFFFFF',
      textPrimary: '#4A2820',
      textSecondary: '#7A5A4A',
      textMuted: '#A08878',
      border: '#E8D5C8',
      borderLight: '#F2E6DC',
      accent: '#D4A853',
      offWhite: '#FDF6F2',
      lightAccent: '#F2E6DC',
    },
  },
  {
    id: 'rose',
    nameAr: 'الوردي',
    nameEn: 'Rose',
    icon: '🌸',
    colors: {
      primary: '#C75B7A',
      primaryLight: '#E088A0',
      primaryDark: '#8B2252',
      bgMain: '#FDF2F5',
      bgCard: '#FFFFFF',
      textPrimary: '#5C1A35',
      textSecondary: '#8A4060',
      textMuted: '#B07890',
      border: '#EAC8D5',
      borderLight: '#F5E0E8',
      accent: '#E8A0B0',
      offWhite: '#FDF2F5',
      lightAccent: '#F5E0E8',
    },
  },
  {
    id: 'coffee',
    nameAr: 'القهوة',
    nameEn: 'Coffee',
    icon: '☕',
    colors: {
      primary: '#8B6F4E',
      primaryLight: '#A8896A',
      primaryDark: '#4A3728',
      bgMain: '#F8F4F0',
      bgCard: '#FFFFFF',
      textPrimary: '#3A2A1A',
      textSecondary: '#6B5540',
      textMuted: '#9A876E',
      border: '#DDD0C0',
      borderLight: '#EDE5DA',
      accent: '#C4956A',
      offWhite: '#F8F4F0',
      lightAccent: '#EDE5DA',
    },
  },
  {
    id: 'emerald',
    nameAr: 'الزمرد',
    nameEn: 'Emerald',
    icon: '💎',
    colors: {
      primary: '#2E8B6E',
      primaryLight: '#50B892',
      primaryDark: '#1A5040',
      bgMain: '#F0F8F5',
      bgCard: '#FFFFFF',
      textPrimary: '#1A3A30',
      textSecondary: '#3D6B5A',
      textMuted: '#6A9A88',
      border: '#B8DDD0',
      borderLight: '#D5EDE5',
      accent: '#50B892',
      offWhite: '#F0F8F5',
      lightAccent: '#D5EDE5',
    },
  },
  {
    id: 'royal',
    nameAr: 'الملكي',
    nameEn: 'Royal',
    icon: '👑',
    colors: {
      primary: '#3A5BA0',
      primaryLight: '#5A7FC8',
      primaryDark: '#1E2D5C',
      bgMain: '#F0F2F8',
      bgCard: '#FFFFFF',
      textPrimary: '#1A2548',
      textSecondary: '#4A5A80',
      textMuted: '#7888A8',
      border: '#C0CAE0',
      borderLight: '#DDE3F0',
      accent: '#D4A840',
      offWhite: '#F0F2F8',
      lightAccent: '#DDE3F0',
    },
  },
  {
    id: 'cherry',
    nameAr: 'الكرزي',
    nameEn: 'Cherry',
    icon: '🍒',
    colors: {
      primary: '#B5394A',
      primaryLight: '#D46070',
      primaryDark: '#7A1A28',
      bgMain: '#FDF2F2',
      bgCard: '#FFFFFF',
      textPrimary: '#4A1218',
      textSecondary: '#8A3A42',
      textMuted: '#B07078',
      border: '#E8C0C5',
      borderLight: '#F5DDE0',
      accent: '#E88060',
      offWhite: '#FDF2F2',
      lightAccent: '#F5DDE0',
    },
  },
  {
    id: 'midnight',
    nameAr: 'منتصف الليل',
    nameEn: 'Midnight',
    icon: '🌃',
    colors: {
      primary: '#8AAAE0',
      primaryLight: '#A0BEF0',
      primaryDark: '#1A2540',
      bgMain: '#151820',
      bgCard: '#1E2230',
      textPrimary: '#E0E5F0',
      textSecondary: '#A8B5CC',
      textMuted: '#7585A0',
      border: '#2E3448',
      borderLight: '#262C3C',
      accent: '#E8A840',
      offWhite: '#1A1E2A',
      lightAccent: '#262C3C',
    },
  },
  {
    id: 'dark',
    nameAr: 'الداكن',
    nameEn: 'Dark',
    icon: '🌙',
    colors: {
      primary: '#A8C8A0',
      primaryLight: '#C0DDB8',
      primaryDark: '#2A3528',
      bgMain: '#1A1E1A',
      bgCard: '#252A25',
      textPrimary: '#E8EDE7',
      textSecondary: '#B8C5B6',
      textMuted: '#8A9A88',
      border: '#3A423A',
      borderLight: '#2F372F',
      accent: '#A8C8A0',
      offWhite: '#1F241F',
      lightAccent: '#2F372F',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app_theme';
  private readonly _currentTheme = signal<Theme>(this.getStoredTheme());

  readonly currentTheme = this._currentTheme.asReadonly();
  readonly currentThemeId = computed(() => this._currentTheme().id);

  constructor() {
    this.applyTheme(this._currentTheme());
  }

  getThemes(): Theme[] {
    return THEMES;
  }

  setTheme(themeId: string): void {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    this._currentTheme.set(theme);
    localStorage.setItem(this.storageKey, themeId);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty('--primary', c.primary);
    root.style.setProperty('--primary-light', c.primaryLight);
    root.style.setProperty('--primary-dark', c.primaryDark);
    root.style.setProperty('--bg-main', c.bgMain);
    root.style.setProperty('--bg-card', c.bgCard);
    root.style.setProperty('--bg-white', c.bgCard);
    root.style.setProperty('--text-primary', c.textPrimary);
    root.style.setProperty('--text-secondary', c.textSecondary);
    root.style.setProperty('--text-muted', c.textMuted);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--border-light', c.borderLight);
    root.style.setProperty('--accent-green', c.accent);
    root.style.setProperty('--off-white', c.offWhite);
    root.style.setProperty('--light-green', c.lightAccent);
    root.style.setProperty('--white', c.bgCard);

    // Heading color: in dark themes, headings use primaryLight instead of primaryDark
    const isDark = theme.id === 'dark' || theme.id === 'midnight';
    root.style.setProperty('--heading-color', isDark ? c.primaryLight : c.primaryDark);

    // Adaptive shadow color based on theme
    if (isDark) {
      root.style.setProperty('--shadow-sm', '0 1px 3px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-md', '0 4px 12px rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.5)');
    } else {
      root.style.setProperty(
        '--shadow-sm',
        '0 1px 3px rgba(45, 62, 40, 0.08)'
      );
      root.style.setProperty(
        '--shadow-md',
        '0 4px 12px rgba(45, 62, 40, 0.1)'
      );
      root.style.setProperty(
        '--shadow-lg',
        '0 8px 24px rgba(45, 62, 40, 0.12)'
      );
    }

    // Toggle dark class on body for any special dark-mode-only overrides
    document.body.classList.toggle('theme-dark', isDark);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const found = THEMES.find((t) => t.id === stored);
      if (found) return found;
    }
    return THEMES[0]; // default to nature
  }
}
