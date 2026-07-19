import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject } from './portfolio.models';

@Component({ selector:'app-portfolio-card', standalone:true, imports:[CommonModule, RouterLink], templateUrl:'./portfolio-card.component.html', styleUrl:'./portfolio-card.component.scss' })
export class PortfolioCardComponent { @Input({ required:true }) project!: PortfolioProject; @Input() compact = false; }
