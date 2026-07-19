import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('light-mode');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('light-mode');
  });

  it('applies and persists light theme immediately', () => {
    const service = TestBed.inject(ThemeService);
    service.setTheme('light');

    expect(service.theme()).toBe('light');
    expect(document.body.classList.contains('light-mode')).toBeTrue();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('restores the persisted theme when the application is recreated', () => {
    localStorage.setItem('theme', 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(document.body.classList.contains('light-mode')).toBeTrue();
  });

  it('keeps one body theme state across route-level component changes', () => {
    const service = TestBed.inject(ThemeService);
    service.setTheme('light');

    document.body.classList.add('contact-route');
    expect(document.body.classList.contains('light-mode')).toBeTrue();

    document.body.classList.remove('contact-route');
    expect(document.body.classList.contains('light-mode')).toBeTrue();
  });
});
