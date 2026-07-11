import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from '../contact/contact.component';
import { RouterLink } from '@angular/router';
import { SelectedTemplateService } from '../../../services/selected-template.service';

@Component({
  selector: 'app-design-model-section',
  standalone: true,
  imports: [CommonModule, ContactComponent, RouterLink], // ⬅️ added CommonModule
  templateUrl: './design-model-section.component.html',
  styleUrls: ['./design-model-section.component.scss']
})
export class DesignModelSectionComponent {
  /** Modal visibility comes from parent (Sidebar) */
  @Input() isOpen = false;

  /** Notify parent to close */
  @Output() close = new EventEmitter<void>();

  /** Selected item from the portfolio */
  private sel = inject(SelectedTemplateService);
  selected = this.sel.item;  // signal<EnvatoItem|null>

  /** Template calls this */
  closeModal() { this.close.emit(); }

  /** Alias to cover any existing (click)="closeModel()" in the HTML */
  closeModel() { this.closeModal(); }
}
