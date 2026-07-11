import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvatoService, EnvatoItem } from '../../../services/envato.service';
import { SelectedTemplateService } from '../../../services/selected-template.service';
import { firstValueFrom } from 'rxjs';

/** Filter keys we support */
type FilterKey =
  | 'all' | 'ecommerce' | 'admin' | 'saas'
  | 'landing' | 'portfolio' | 'agency'
  | 'blog' | 'realestate';

/** Labels + terms that get appended to the search query */
const FILTERS = {
  all:        { label: 'All', terms: [] },
  ecommerce:  { label: 'E-commerce', terms: ['ecommerce'] }, //
  admin:      { label: 'Admin Dashboard', terms: ['admin'] },
  saas:       { label: 'SaaS', terms: ['saas'] },
  landing:    { label: 'Landing Page', terms: ['landing'] },
  portfolio:  { label: 'Portfolio', terms: ['portfolio'] },
  agency:     { label: 'Agency', terms: ['agency'] },
  blog:       { label: 'Blog / Magazine', terms: ['blog'] },
  realestate: { label: 'Real Estate', terms: ['real'] },
} as const;

@Component({
  selector: 'app-portfolio-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-section.component.html',
  styleUrl: './portfolio-section.component.scss'
})
export class PortfolioSectionComponent implements OnInit {

  @Output() open = new EventEmitter<void>();

  // ThemeForest items + pagination state
  items    = signal<EnvatoItem[]>([]);
  page     = signal(1);
  pageSize = 12;
  hasNext  = signal(true);
  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  // Search + filter state
  term         = signal('angular');
  activeFilter = signal<FilterKey>('all');
  readonly filters = FILTERS;
  readonly filterOrder: FilterKey[] = [
    'all','ecommerce','admin','saas','landing','portfolio','agency','blog','realestate'
  ];

  constructor(
    private envato: EnvatoService,
    private selected: SelectedTemplateService
  ) {}

  ngOnInit() { this.load(1, 'replace'); }

  trackById(_index: number, item: EnvatoItem) { return item.id; }

  /** Build the query that goes to the Envato API */
  private buildQuery(): string {
    const base = (this.term().trim() || 'angular');
    const f = FILTERS[this.activeFilter()];
    const extra = f.terms.join(' ');
    return [base, extra].filter(Boolean).join(' ');
  }

  /** Click a card: remember it and open modal */
  selectAndOpen(t: EnvatoItem) {
    this.selected.set(t);
    this.open.emit();
  }

  /** Triggered by Search button / Enter key */
  onSearch() { this.load(1, 'replace'); }

  /** Change filter and reload */
  applyFilter(key: FilterKey) {
    if (this.activeFilter() === key) return;
    this.activeFilter.set(key);
    this.load(1, 'replace');
  }

  async load(pageToLoad = 1, mode: 'replace' | 'append' = 'replace') {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set(null);
    try {
      const q = this.buildQuery();
      const res = await firstValueFrom(this.envato.list(q, pageToLoad, this.pageSize));
      const newItems = res?.items ?? [];
      if (mode === 'replace') {
        this.items.set(newItems);
      } else {
        this.items.set([...(this.items() || []), ...newItems]);
      }
      this.page.set(pageToLoad);
      this.hasNext.set(newItems.length === this.pageSize);
    } catch (e: any) {
      this.errorMsg.set(typeof e?.message === 'string' ? e.message : 'Failed to load templates.');
      this.hasNext.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  prevPage() { if (this.page() > 1) this.load(this.page() - 1, 'replace'); }
  nextPage() { if (this.hasNext())     this.load(this.page() + 1, 'replace'); }
  loadMore() {                          this.load(this.page() + 1, 'append'); }
}
