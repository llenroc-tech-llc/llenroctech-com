import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MarketplaceTemplate } from '../portfolio/portfolio.models';

/** Compatibility shape for the retired homepage gallery and selection service. */
export interface EnvatoItem extends MarketplaceTemplate {
  url?: string; livePreview?: string; thumbnail?: string; rating?: number; rating_count?: number;
  updated_at?: string; price_cents?: number;
}

@Injectable({ providedIn: 'root' })
export class EnvatoService {
  private readonly http = inject(HttpClient);
  list(_term?: string, _page?: number, _pageSize?: number) { return this.http.get<{ items: EnvatoItem[] }>('/.netlify/functions/envato-templates'); }
}
