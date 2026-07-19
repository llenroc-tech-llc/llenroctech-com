import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject } from './portfolio.models';

@Component({ selector:'app-portfolio-card', standalone:true, imports:[CommonModule, RouterLink], templateUrl:'./portfolio-card.component.html', styleUrl:'./portfolio-card.component.scss' })
export class PortfolioCardComponent {
  @Input({ required:true }) project!: PortfolioProject;
  @Input() compact = false;
  @ViewChild('previewDialog') previewDialog?: ElementRef<HTMLDialogElement>;
  openPreview(){ this.previewDialog?.nativeElement.showModal(); }
  closePreview(){ this.previewDialog?.nativeElement.close(); }
  actionLabel(){ if(this.project.id==='robot-mower') return 'Launch live demo'; if(this.project.id==='llenroc-tech') return 'Explore platform'; return 'View live website'; }
}
