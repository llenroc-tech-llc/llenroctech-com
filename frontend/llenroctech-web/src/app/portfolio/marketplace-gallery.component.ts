import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EnvatoService } from '../services/envato.service';
import { MarketplaceTemplate } from './portfolio.models';

@Component({selector:'app-marketplace-gallery',standalone:true,imports:[CommonModule],templateUrl:'./marketplace-gallery.component.html',styleUrl:'./marketplace-gallery.component.scss'})
export class MarketplaceGalleryComponent implements OnInit {
  private readonly envato = inject(EnvatoService);
  readonly items = signal<MarketplaceTemplate[]>([]); readonly state = signal<'loading'|'ready'|'empty'|'error'>('loading');
  async ngOnInit(){ try { const response=await firstValueFrom(this.envato.list()); this.items.set(response?.items ?? []); this.state.set(this.items().length?'ready':'empty'); } catch { this.state.set('error'); } }
}
