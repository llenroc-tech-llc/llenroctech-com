import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface EnvatoItem {
  id: number|string;
  name: string;
  author: string;
  url: string;
  livePreview?: string;
  thumbnail?: string;
  rating?: number;
  rating_count?: number;
  updated_at?: string;
  price_cents?: number;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class EnvatoService {
  private http = inject(HttpClient);

  list(term = 'angular', page = 1, pageSize = 12) {
    const qs = new URLSearchParams({
      q: term,
      page: String(page),
      page_size: String(pageSize)
    });
    return this.http.get<{ items: EnvatoItem[] }>(
      '/.netlify/functions/envato-templates?' + qs.toString()
    );
  }
}