import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type SiteTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly browser: boolean;
  readonly theme = signal<SiteTheme>('dark');

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.browser = isPlatformBrowser(platformId);
    const saved = this.browser ? localStorage.getItem(this.storageKey) : null;
    this.apply(saved === 'light' ? 'light' : 'dark', false);
  }

  setTheme(theme: SiteTheme): void {
    this.apply(theme, true);
  }

  private apply(theme: SiteTheme, persist: boolean): void {
    this.theme.set(theme);
    this.document.body.classList.toggle('light-mode', theme === 'light');
    this.document.documentElement.style.colorScheme = theme;
    if (this.browser && persist) localStorage.setItem(this.storageKey, theme);
  }
}
