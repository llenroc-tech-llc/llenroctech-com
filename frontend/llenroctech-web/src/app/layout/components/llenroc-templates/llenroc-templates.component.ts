// src/app/sections/llenroc-templates/llenroc-templates.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SelectedTemplateService } from '../../../services/selected-template.service';

interface LlenrocTemplate {
  id: string;
  name: string;
  thumbnail: string;
  cover?: string;
  tags?: string[];
  blurb?: string;

  // preferred keys (match the modal)
  livePreview?: string;   // demo URL the modal checks
  url?: string;           // details/repo link the modal checks
  author?: string;

  // legacy keys (fallbacks if your JSON still uses them)
  liveDemo?: string;
  details?: string;
  repo?: string;
  contact?: string;
}

@Component({
  selector: 'app-llenroc-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './llenroc-templates.component.html',
  styleUrls: ['./llenroc-templates.component.scss']
})
export class LlenrocTemplatesComponent {
  @Input()  heading    = 'Llenroc Templates';

  @Output() open = new EventEmitter<void>();

  items: LlenrocTemplate[] = [];
  errorMsg: string | null = null;

  constructor(
    private http: HttpClient,
    private selectedSvc: SelectedTemplateService
  ) {}

  ngOnInit() {
    this.http.get<LlenrocTemplate[]>('assets/llenroc-templates.json')
      .subscribe({
        next: arr => this.items = arr ?? [],
        error: () => this.errorMsg = 'Failed to load Llenroc templates.'
      });
  }

  trackById = (_: number, t: LlenrocTemplate) => t.id;

  /** Click card → set the exact fields the modal reads → open modal */
  selectAndOpen(t: LlenrocTemplate) {
    // Normalize to the keys your modal template uses
    const selected = {
      id: t.id,
      name: t.name,
      author: t.author ?? 'LLENROC TECH',
      thumbnail: t.thumbnail,
      cover: t.cover,
      description: t.blurb ?? '',
      tags: t.tags ?? [],

      // critical: what the modal checks
      livePreview: t.livePreview ?? t.liveDemo ?? '',   
      url: undefined           

      // you can keep other fields if your modal uses them too
    };

    this.selectedSvc.set(selected as any);
    this.open.emit();
  }
}
