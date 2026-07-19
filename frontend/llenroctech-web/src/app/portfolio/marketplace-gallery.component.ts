import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EnvatoService } from '../services/envato.service';
import { MarketplaceTemplate } from './portfolio.models';

@Component({
  selector: 'app-marketplace-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace-gallery.component.html',
  styleUrl: './marketplace-gallery.component.scss',
})
export class MarketplaceGalleryComponent implements OnInit {
  private readonly envato = inject(EnvatoService);
  readonly categories = [
    'all',
    'business',
    'corporate',
    'portfolio',
    'ecommerce',
    'fitness',
    'education',
    'real estate',
    'technology',
    'saas',
    'nonprofit',
    'medical',
    'restaurant',
    'travel',
  ];
  readonly items = signal<MarketplaceTemplate[]>([]);
  readonly state = signal<
    'loading' | 'ready' | 'empty' | 'unavailable' | 'error'
  >('loading');
  readonly retryable = signal(false);
  readonly activeCategory = signal('all');
  readonly searchTerm = signal('');
  readonly filteredItems = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    return search
      ? this.items().filter((item) =>
          `${item.name} ${item.author || ''} ${(item.tags || []).join(' ')}`
            .toLowerCase()
            .includes(search),
        )
      : this.items();
  });
  ngOnInit() {
    void this.load();
  }
  async load(category = this.activeCategory()) {
    this.activeCategory.set(category);
    this.state.set('loading');
    this.retryable.set(false);
    try {
      const response = await firstValueFrom(this.envato.list(category));
      this.items.set(response?.items ?? []);
      if (response?.available === false) {
        this.retryable.set(response.retryable === true);
        this.state.set('unavailable');
        return;
      }
      this.state.set(this.items().length ? 'ready' : 'empty');
    } catch {
      this.retryable.set(true);
      this.state.set('error');
    }
  }
}
