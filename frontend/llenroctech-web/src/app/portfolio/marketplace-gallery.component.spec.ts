import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EnvatoService } from '../services/envato.service';
import { MarketplaceGalleryComponent } from './marketplace-gallery.component';

describe('MarketplaceGalleryComponent', () => {
  let fixture: ComponentFixture<MarketplaceGalleryComponent>;
  let envato: jasmine.SpyObj<EnvatoService>;

  beforeEach(async () => {
    envato = jasmine.createSpyObj<EnvatoService>('EnvatoService', ['list']);
    await TestBed.configureTestingModule({
      imports: [MarketplaceGalleryComponent],
      providers: [{ provide: EnvatoService, useValue: envato }],
    }).compileComponents();
  });

  it('renders a non-retryable fallback when Envato is not configured', async () => {
    envato.list.and.returnValue(
      of({
        items: [],
        available: false,
        retryable: false,
        reason: 'not_configured',
      }),
    );

    fixture = TestBed.createComponent(MarketplaceGalleryComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state()).toBe('unavailable');
    expect(envato.list).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain(
      'Template inspiration is temporarily unavailable',
    );
    expect(fixture.nativeElement.querySelector('.retry')).toBeNull();
  });

  it('does not retry a configuration failure indefinitely', async () => {
    envato.list.and.returnValue(
      of({
        items: [],
        available: false,
        retryable: false,
        reason: 'not_configured',
      }),
    );

    fixture = TestBed.createComponent(MarketplaceGalleryComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(envato.list).toHaveBeenCalledTimes(1);
  });
});
