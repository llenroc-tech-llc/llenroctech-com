import { Injectable, signal } from '@angular/core';
import type { EnvatoItem } from './envato.service';

@Injectable({ providedIn: 'root' })
export class SelectedTemplateService {
  readonly item = signal<EnvatoItem | null>(null);
  set(value: EnvatoItem | null) { this.item.set(value); }
}
